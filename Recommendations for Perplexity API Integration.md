# Recommendations for Perplexity API Integration

This document provides recommendations and improved code examples for integrating the Perplexity API into your React (Vite frontend) and Node.js (backend) project, especially in the context of using Vercel AI SDK and OpenAI.

## 1. Analysis of Your Current Implementation

Your current approach to calling the Perplexity API is generally functional, but there are several areas where it can be improved for robustness, maintainability, and to leverage the full capabilities of the Perplexity API and Vercel AI SDK. Here's a summary of the analysis:

### Strengths:
- **Direct API Call:** Your use of `fetch` in the Node.js backend is a valid way to interact with the Perplexity API.
- **Basic Error Handling:** The `try...catch` block and `response.ok` check are good practices for handling API call failures.
- **Parameter Usage:** `temperature` and `max_tokens` are correctly used and are standard parameters for language models.

### Areas for Improvement:
1.  **Undocumented Model:** The model `llama-3.1-sonar-small-128k-online` is not listed in the official Perplexity API documentation. Relying on undocumented models can lead to unexpected behavior or breakage with future API updates. It is strongly recommended to use one of the officially supported `sonar` models (e.g., `sonar-pro`, `sonar-deep-research`).
2.  **Custom Timeframe Parameter:** Your `timeframe` parameter is handled by injecting it into the system prompt. While this might work to some extent, it's less precise and reliable than using the dedicated time-based filtering parameters provided by the Perplexity API, such as `search_recency_filter`, `search_after_date_filter`, or `search_before_date_filter`.
3.  **Undocumented Source Extraction:** You are extracting sources from `data.citations`. The official documentation specifies `search_results` as the field for obtaining source information. Relying on undocumented fields is risky and can break without warning.

## 2. Recommended Integration Patterns

Given your setup with a React frontend, Node.js backend, Vercel AI SDK, and OpenAI as the main AI agent, here are the recommended integration patterns for Perplexity:

### Option A: Direct API Call (Refined Version)

This option refines your current approach by addressing the identified areas for improvement while keeping the direct API call structure. This is suitable if you prefer to manage the API calls manually in your Node.js backend.

**Key Changes:**
- Use a documented Perplexity model (e.g., `sonar-pro`).
- Implement time-based filtering using `search_recency_filter`.
- Extract sources from `search_results`.

**Improved Backend Code Example (Node.js):**

```javascript
// Perplexity Service - Refined for best practices
// Handles real news research with documented API features

const apiKey = process.env.PERPLEXITY_API_KEY;
const apiUrl = 'https://api.perplexity.ai/chat/completions';

/**
 * Research news using Perplexity API with improved parameters and source extraction.
 * @param {string} query - The research query.
 * @param {string} searchRecency - Timeframe for search results (e.g., 'day', 'week', 'month', 'year').
 * @returns {Promise<object>} - Research results including content, sources, and timestamp.
 */
export const researchNews = async (query, searchRecency = 'week') => {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro', // Recommended: Use a documented model like 'sonar-pro'
        messages: [
          {
            role: 'system',
            content: `You are a news research assistant. ` +
                     `Provide factual, up-to-date information about current events. ` +
                     `Keep responses concise (under 500 words) for audio narration. ` +
                     `Include key facts and important details.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 1500,
        search_recency_filter: searchRecency, // Use documented parameter for time filtering
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Perplexity API error: ${response.status} - ${errorData.error.message}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract sources from search_results, which is the documented field
    const sources = data.search_results?.map(s => s.url || s.title) || [];
    
    return {
      content,
      sources: sources.slice(0, 5), // Limit to 5 sources
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Perplexity research error:', error);
    return {
      content: `Unable to fetch current news. Please try again. Error: ${error.message}`,
      sources: [],
      error: error.message
    };
  }
};
```

### Option B: Using Vercel AI SDK (Recommended for AI Agent Projects)

This is the recommended approach, especially since you are already using the Vercel AI SDK and OpenAI. The AI SDK provides a unified interface for various AI providers and simplifies integration, particularly with features like tool calling.

**Advantages:**
- **Unified Interface:** Work with Perplexity and OpenAI through a consistent API.
- **Tool Calling:** Allows your OpenAI agent to intelligently decide when to use Perplexity for research, making your agent more capable and dynamic.
- **Simplified Source Handling:** The AI SDK's `sources` property directly provides the necessary citation information.

**Integration Steps:**

1.  **Install the Perplexity AI SDK Provider:**
    ```bash
    npm install @ai-sdk/perplexity
    # or
    pnpm add @ai-sdk/perplexity
    # or
    yarn add @ai-sdk/perplexity
    ```

2.  **Backend Integration (Node.js):**
    Instead of a direct `fetch` call, you would use the `@ai-sdk/perplexity` provider. Here's how you might integrate it into a backend function, potentially exposed via an API endpoint:

    ```javascript
    // backend/api/research.js (Example API Route)
    import { perplexity } from '@ai-sdk/perplexity';
    import { generateText } from 'ai'; // From @vercel/ai

    export default async function handler(req, res) {
      if (req.method === 'POST') {
        const { query, searchRecency } = req.body;

        try {
          const { text, sources } = await generateText({
            model: perplexity('sonar-pro'), // Use a documented model
            prompt: query,
            providerOptions: {
              perplexity: {
                search_recency_filter: searchRecency || 'week', // Pass through Perplexity-specific options
              },
            },
            // You can also pass other common parameters like temperature, max_tokens here
            temperature: 0.2,
            max_tokens: 1500,
          });

          res.status(200).json({
            content: text,
            sources: sources.map(s => s.url || s.title), // AI SDK provides sources directly
            timestamp: new Date().toISOString(),
          });

        } catch (error) {
          console.error('Perplexity AI SDK research error:', error);
          res.status(500).json({
            content: `Unable to fetch current news. Please try again. Error: ${error.message}`,
            sources: [],
            error: error.message,
          });
        }
      } else {
        res.status(405).json({ message: 'Method Not Allowed' });
      }
    }
    ```

3.  **Frontend Integration (React/Vite):**
    Your React frontend would then call this new backend API route.

    ```javascript
    // frontend/src/services/researchService.js (Example Frontend Service)
    export const researchNews = async (query, searchRecency = 'week') => {
      try {
        const response = await fetch('/api/research', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, searchRecency }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch research results');
        }

        const data = await response.json();
        return data;

      } catch (error) {
        console.error('Frontend research call error:', error);
        return {
          content: `Failed to get research results. Error: ${error.message}`,
          sources: [],
          error: error.message,
        };
      }
    };
    ```

### Option C: OpenAI Tool Calling with Perplexity

This is the most advanced and flexible approach for an AI agent. It involves teaching your OpenAI model to use Perplexity as a tool for specific tasks (like research).

**Concept:**
- You define a 


`research` tool in your OpenAI agent.
- When the agent receives a query that requires research, it can decide to call this `research` tool.
- The `research` tool, in turn, calls the Perplexity API (either directly or via the Vercel AI SDK).

**Backend Code Example (using Vercel AI SDK for tool calling):**

```javascript
// backend/api/chat.js (Example API Route for your OpenAI agent)
import { openai } from '@ai-sdk/openai';
import { perplexity } from '@ai-sdk/perplexity';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export default async function handler(req, res) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'), // Your main OpenAI model
    messages,
    tools: {
      research: tool({
        description: 'Performs in-depth research on a given topic using Perplexity.',
        parameters: z.object({
          query: z.string().describe('The research query.'),
          searchRecency: z.string().optional().describe('Timeframe for search (e.g., day, week).'),
        }),
        execute: async ({ query, searchRecency }) => {
          try {
            const { text, sources } = await generateText({
              model: perplexity('sonar-pro'),
              prompt: query,
              providerOptions: {
                perplexity: {
                  search_recency_filter: searchRecency || 'week',
                },
              },
              temperature: 0.2,
              max_tokens: 1500,
            });

            return {
              content: text,
              sources: sources.map(s => s.url || s.title),
            };

          } catch (error) {
            console.error('Perplexity tool execution error:', error);
            return { error: `Failed to perform research: ${error.message}` };
          }
        },
      }),
    },
  });

  return result.toAIStreamResponse();
}
```

## 3. Summary of Recommendations

1.  **Switch to a Documented Model:** Immediately replace `llama-3.1-sonar-small-128k-online` with an officially supported model like `sonar-pro` to ensure stability and compatibility.
2.  **Use Documented API Parameters:** For time-based filtering, use `search_recency_filter` instead of relying on the system prompt. This provides more reliable and predictable results.
3.  **Use Documented Response Fields:** Extract sources from the `search_results` field in the API response, not the undocumented `citations` field.
4.  **Adopt the Vercel AI SDK:** For a project involving an AI agent with both OpenAI and Perplexity, using the Vercel AI SDK is highly recommended. It simplifies integration, provides a unified interface, and offers powerful features like tool calling.
5.  **Implement Tool Calling:** For the most flexible and intelligent agent, use the tool-calling pattern. This allows your OpenAI agent to dynamically decide when to leverage Perplexity's research capabilities, leading to a more robust and capable application.

By following these recommendations, you can build a more reliable, maintainable, and powerful AI application that effectively leverages the strengths of both OpenAI and Perplexity.

