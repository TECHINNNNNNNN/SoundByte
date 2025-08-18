# Implementing Perplexity API with Vercel AI SDK (Option B)

This guide provides a detailed walkthrough for integrating the Perplexity API into your project using the Vercel AI SDK, which is the recommended approach given your existing setup with a React frontend, Node.js backend, and OpenAI as your primary AI agent. This method offers a unified interface, simplifies API interactions, and enables powerful features like tool calling.

## 1. Understanding the Advantages of Vercel AI SDK for Perplexity Integration

Before diving into the implementation, it's crucial to understand why the Vercel AI SDK is particularly well-suited for your use case:

### 1.1. Unified Interface for AI Providers

The Vercel AI SDK acts as an abstraction layer, allowing you to interact with various AI models (like OpenAI and Perplexity) through a consistent API. This eliminates the need to learn and manage different API structures, authentication methods, and response formats for each provider. For instance, whether you're generating text with OpenAI or performing research with Perplexity, the core `generateText` function (or similar SDK functions) remains consistent, simplifying your development workflow.

### 1.2. Simplified API Interactions and Data Handling

The SDK handles much of the boilerplate code associated with making API calls, including request formatting, error handling, and streaming responses. Crucially, for Perplexity, it streamlines the extraction of search results (citations). Instead of manually parsing the `search_results` array from the raw API response, the SDK provides a clean `sources` property that directly contains the relevant citation URLs and titles, making it much easier to display or utilize this information in your application.

### 1.3. Seamless Integration with React and Next.js

While your frontend is React with Vite, the Vercel AI SDK is designed with React and Next.js in mind, offering hooks and utilities that simplify state management and UI updates for AI-powered features. Even with a custom Node.js backend, the SDK's client-side utilities can still be beneficial for managing the streaming and display of AI responses.

### 1.4. Powerful Tool Calling Capabilities

This is perhaps the most significant advantage for your AI agent project. The Vercel AI SDK supports tool calling (also known as function calling), which allows your primary OpenAI model to intelligently decide when to invoke external functions or services. In your case, this means your OpenAI agent can determine when a user's query requires real-time research and then automatically trigger a call to the Perplexity API via a defined tool. This creates a more dynamic, capable, and context-aware AI agent that can leverage Perplexity's specialized research abilities only when needed.

## 2. Step-by-Step Implementation Guide

Here's how to integrate the Perplexity API using the Vercel AI SDK into your existing project structure.

### Step 2.1: Install the Perplexity AI SDK Provider

The first step is to add the necessary package to your Node.js backend project. Open your terminal in the root of your backend project and run one of the following commands:

```bash
npm install @ai-sdk/perplexity
# or, if you are using pnpm
pnpm add @ai-sdk/perplexity
# or, if you are using yarn
yarn add @ai-sdk/perplexity
```

This command installs the official Perplexity provider for the Vercel AI SDK, allowing you to interact with the Perplexity API through the SDK's unified interface.

### Step 2.2: Configure Your Perplexity API Key

Ensure your Perplexity API key is securely stored and accessible in your Node.js backend. The Vercel AI SDK's Perplexity provider automatically looks for the `PERPLEXITY_API_KEY` environment variable. If you're using a `.env` file for local development, make sure it's configured like this:

```
PERPLEXITY_API_KEY=YOUR_PERPLEXITY_API_KEY_HERE
```

For deployment on Vercel, you would set this environment variable in your Vercel project settings. This keeps your sensitive API key out of your codebase and allows for easy management across different environments.

### Step 2.3: Backend Integration (Node.js API Route)

Instead of making a direct `fetch` call to the Perplexity API, you will now use the `@ai-sdk/perplexity` provider within your Node.js backend. This example assumes you have an API route (e.g., `/api/research`) that your frontend will call to initiate research.

Create a new file (e.g., `backend/api/research.js`) or modify an existing one to handle the research request:

```javascript
// backend/api/research.js

// Import necessary modules from the AI SDK
import { perplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai'; // Assuming you have '@vercel/ai' installed

export default async function handler(req, res) {
  // Ensure the request method is POST for handling data submission
  if (req.method === 'POST') {
    // Destructure query and optional searchRecency from the request body
    const { query, searchRecency } = req.body;

    try {
      // Use the AI SDK's generateText function with the perplexity provider
      const { text, sources } = await generateText({
        // Specify the Perplexity model to use. 'sonar-pro' is recommended for advanced search.
        // Ensure you use one of the officially documented models.
        model: perplexity('sonar-pro'), 
        // The user's research query
        prompt: query,
        // Pass Perplexity-specific options via providerOptions
        providerOptions: {
          perplexity: {
            // Use the documented search_recency_filter for time-based filtering
            // Default to 'week' if not provided by the frontend
            search_recency_filter: searchRecency || 'week',
            // You can add other Perplexity-specific parameters here, e.g.,
            // return_images: true, // If you are a Tier-2 Perplexity user and want images
          },
        },
        // Common LLM parameters, compatible across AI SDK providers
        temperature: 0.2, // Low temperature for factual accuracy
        max_tokens: 1500, // Limit the response length
      });

      // Send a successful response back to the frontend
      res.status(200).json({
        content: text, // The generated research content
        // The AI SDK automatically provides sources in a clean format
        sources: sources.map(s => s.url || s.title), // Map to get URLs or titles
        timestamp: new Date().toISOString(), // Add a timestamp for when the research was done
      });

    } catch (error) {
      // Handle any errors that occur during the API call
      console.error('Perplexity AI SDK research error:', error);
      res.status(500).json({
        content: `Unable to fetch current news. Please try again. Error: ${error.message}`,
        sources: [],
        error: error.message,
      });
    }
  } else {
    // If the request method is not POST, return a Method Not Allowed error
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
```

**Explanation of Changes:**
- **`import { perplexity } from '@ai-sdk/perplexity';`**: Imports the Perplexity provider.
- **`import { generateText } from 'ai';`**: Imports the core `generateText` function from the Vercel AI SDK. This is the primary function you'll use to interact with language models.
- **`model: perplexity('sonar-pro')`**: This is how you specify that you want to use the Perplexity provider and which Perplexity model (`sonar-pro` is recommended for research) to use. This replaces your hardcoded `apiUrl` and `model` string.
- **`providerOptions: { perplexity: { search_recency_filter: searchRecency || 'week' } }`**: This is how you pass Perplexity-specific parameters that are not part of the generic `generateText` function. The `search_recency_filter` is used here to correctly handle time-based filtering, replacing your previous system prompt injection.
- **`sources: sources.map(s => s.url || s.title)`**: The `generateText` function returns a `sources` array directly, which contains objects with `url` and `title` properties. This simplifies the extraction of citation information, addressing the previous issue with undocumented `citations`.

### Step 2.4: Frontend Integration (React/Vite)

Your React frontend will now call the new backend API route (`/api/research`) to trigger the Perplexity research. The frontend code remains relatively similar to how you might call any other backend API.

```javascript
// frontend/src/services/researchService.js

/**
 * Initiates news research via your Node.js backend using the Perplexity API (via Vercel AI SDK).
 * @param {string} query - The research query.
 * @param {string} searchRecency - Optional timeframe for search results (e.g., 'day', 'week').
 * @returns {Promise<object>} - Research results including content, sources, and timestamp.
 */
export const researchNews = async (query, searchRecency = 'week') => {
  try {
    // Make a POST request to your backend API route
    const response = await fetch('/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Specify content type as JSON
      },
      // Send the query and searchRecency in the request body
      body: JSON.stringify({ query, searchRecency }),
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      // Throw an error with a more descriptive message from the backend
      throw new Error(errorData.error || 'Failed to fetch research results');
    }

    // Parse the JSON response
    const data = await response.json();
    return data; // Return the research data

  } catch (error) {
    // Handle any errors during the frontend fetch operation
    console.error('Frontend research call error:', error);
    return {
      content: `Failed to get research results. Error: ${error.message}`,
      sources: [],
      error: error.message,
    };
  }
};

// Example of how you might use it in a React component:
/*
import React, { useState } from 'react';
import { researchNews } from './services/researchService';

function ResearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [researchResult, setResearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await researchNews(searchQuery, 'month'); // Example: search for past month
      setResearchResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Enter research query"
      />
      <button onClick={handleResearch} disabled={loading}>
        {loading ? 'Researching...' : 'Perform Research'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {researchResult && (
        <div>
          <h3>Research Content:</h3>
          <p>{researchResult.content}</p>
          {researchResult.sources && researchResult.sources.length > 0 && (
            <div>
              <h4>Sources:</h4>
              <ul>
                {researchResult.sources.map((source, index) => (
                  <li key={index}><a href={source} target="_blank" rel="noopener noreferrer">{source}</a></li>
                ))}
              </ul>
            </div>
          )}
          <p>Timestamp: {new Date(researchResult.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default ResearchComponent;
*/
```

### Step 2.5: Integrate with Your OpenAI Agent (Optional, but Recommended)

If your goal is to have your main OpenAI agent intelligently use Perplexity for research, you would implement this using the Vercel AI SDK's tool calling feature. This allows the OpenAI model to decide when to invoke your `research` function.

**Concept:**
1.  **Define a Tool:** You describe a `research` tool to your OpenAI model, specifying its purpose and the parameters it accepts (e.g., `query`, `searchRecency`).
2.  **Model Decides:** When the OpenAI model processes a user's prompt, it can decide that the `research` tool is relevant and generate a tool call with the appropriate parameters.
3.  **Execute Tool:** Your backend code intercepts this tool call, executes your `research` function (which now uses the Perplexity AI SDK), and returns the result to the OpenAI model.
4.  **Model Responds:** The OpenAI model then uses the research results to formulate its final response to the user.

**Backend Code Example (for OpenAI Agent with Perplexity Tool):**

This example assumes you have a central API route for your OpenAI agent (e.g., `/api/chat`) that handles conversational turns and tool calls.

```javascript
// backend/api/chat.js

// Import necessary modules
import { openai } from '@ai-sdk/openai';
import { perplexity } from '@ai-sdk/perplexity';
import { streamText, tool } from 'ai'; // 'tool' is for defining functions
import { z } from 'zod'; // For defining tool parameters schema

export default async function handler(req, res) {
  // Extract messages from the request body (conversation history)
  const { messages } = req.body;

  // Stream text response from the OpenAI model
  const result = await streamText({
    // Your primary OpenAI model
    model: openai('gpt-4-turbo'), 
    // The conversation history
    messages,
    // Define the tools available to the OpenAI model
    tools: {
      // Define a 'research' tool
      research: tool({
        // A description that helps the OpenAI model understand when to use this tool
        description: 'Performs in-depth research on a given topic using Perplexity.',
        // Define the input parameters for the research tool using Zod for schema validation
        parameters: z.object({
          query: z.string().describe('The research query.'),
          searchRecency: z.string().optional().describe('Timeframe for search (e.g., day, week).'),
        }),
        // The execute function is called when the OpenAI model decides to use this tool
        execute: async ({ query, searchRecency }) => {
          try {
            // Call the Perplexity API via the AI SDK within the tool's execute function
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

            // Return the research content and sources. This will be fed back to the OpenAI model.
            return {
              content: text,
              sources: sources.map(s => s.url || s.title),
            };

          } catch (error) {
            console.error('Perplexity tool execution error:', error);
            // Return an error message if research fails
            return { error: `Failed to perform research: ${error.message}` };
          }
        },
      }),
    },
  });

  // Convert the streamed result to a Vercel AI Stream response
  return result.toAIStreamResponse();
}
```

**Explanation of Tool Calling:**
- **`tools: { research: tool(...) }`**: This is where you define your custom tools. `research` is the name of the tool.
- **`description`**: A human-readable description that helps the OpenAI model understand what the tool does and when to use it.
- **`parameters`**: A Zod schema defining the expected input for the tool. This is crucial for the OpenAI model to know what arguments to provide when calling the tool.
- **`execute`**: This is the asynchronous function that gets called when the OpenAI model decides to use the `research` tool. Inside this function, you make the actual call to the Perplexity API using the `@ai-sdk/perplexity` provider.
- **Return Value**: The `execute` function's return value is sent back to the OpenAI model, which then uses this information to generate its final response to the user.

## 3. Key Considerations and Best Practices

When implementing Option B, keep the following in mind:

### 3.1. Model Selection

Always use officially documented Perplexity models (e.g., `sonar`, `sonar-pro`, `sonar-deep-research`, `sonar-reasoning`, `sonar-reasoning-pro`). Avoid `llama-3.1-sonar-small-128k-online` as it's not officially supported for direct API access and may lead to issues.

### 3.2. Error Handling and User Feedback

Implement robust error handling in both your backend and frontend. Provide clear and informative messages to the user if research fails. Consider logging detailed errors on your backend for debugging purposes.

### 3.3. API Key Security

Never expose your Perplexity API key in your frontend code. Always handle API calls from your backend, where the API key can be securely stored as an environment variable.

### 3.4. Rate Limiting and Usage

Be mindful of Perplexity API's rate limits and your usage tiers. Implement retry mechanisms with exponential backoff for transient errors if necessary. Monitor your API usage to stay within your plan limits.

### 3.5. Asynchronous Operations

Since API calls are asynchronous, ensure your frontend and backend code correctly handles `async/await` patterns to prevent blocking the UI or server processes.

### 3.6. Scalability

As your application scales, consider implementing caching mechanisms for research results that don't require real-time updates to reduce API calls and improve performance.

### 3.7. User Experience

Provide visual feedback to the user when research is in progress (e.g., loading spinners). Display sources clearly so users can verify information.

By following this detailed guide, you should be able to successfully integrate the Perplexity API using the Vercel AI SDK, enhancing your AI agent's capabilities with real-time research functionality. This approach aligns with modern AI application development practices and provides a solid foundation for future expansions.

