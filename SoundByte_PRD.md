# SoundByte - AI-Powered News Audio Agent

## "Your news, in bytes of sound"

## Executive Summary

**Project Name**: SoundByte  
**Timeline**: 1 Week MVP  
**Tech Stack**: React + Vite (Frontend), Node.js (Backend), AWS S3 (Storage), Neon PostgreSQL (Database), Prisma (ORM)  
**Primary Goal**: Create a portfolio-quality full-stack application demonstrating AI orchestration, real-time news synthesis, and audio generation

## Problem Statement

News consumption is increasingly fragmented and time-consuming. Users want to stay informed about specific topics but lack time to read lengthy articles. Audio consumption offers a hands-free, multitasking-friendly alternative that fits modern lifestyles. Current solutions lack conversational context and follow-up capabilities.

## Target Users

**Primary**: Busy professionals and general news consumers who:
- Commute regularly or have hands-free time
- Want curated, topic-specific news updates with conversational follow-ups
- Prefer audio content for efficiency
- Value contextual understanding in their news consumption
- Want to organize topics into separate conversation threads

## Product Vision

An AI-powered conversational news agent that maintains context across multiple chat threads, researches current news, and delivers personalized audio summaries with natural follow-up capabilities.

## Core Features (MVP - Week 1)

### 1. User Authentication ✅ (Completed)
- **Registration/Login**: Email + password with bcrypt
- **Session Management**: JWT-based authentication
- **Protected Routes**: Secure access to chat interface

### 2. Conversation Management
- **Multiple Chat Threads**: Users can create separate conversation topics
- **Thread Persistence**: Each thread maintains its own context and history
- **Thread Navigation**: Sidebar with list of active conversations
- **New Thread Creation**: Simple interface to start new topic threads

### 3. AI Agent Orchestration
- **Context Management**: Maintain conversation history per thread
- **Intelligent Routing**: Decide when to call Perplexity vs respond directly
- **Follow-up Handling**: Process contextual questions based on previous responses
- **Request Interpretation**: Parse user intent and optimize API calls

### 4. News Research & Synthesis
- **Perplexity Integration**: Real-time news research with online data
- **Dynamic Summarization**: Adjust summary length based on user preference (max 30 min)
- **Source Attribution**: Include relevant sources in text responses
- **Content Filtering**: Ensure audio-friendly formatting

### 5. Audio Generation & Storage
- **Google Text-to-Speech**: High-quality voice synthesis
- **AWS S3 Storage**: Persistent audio file storage with URLs
- **In-Chat Player**: Embedded audio player with controls
- **Playlist View**: Access all audio files within a conversation thread
- **Brief Text Summary**: Short text accompaniment to audio response

## Technical Architecture

### Frontend (React + Vite)
```
src/
├── components/
│   ├── Auth/          ✅ (Completed)
│   ├── Chat/
│   │   ├── ChatInterface.jsx
│   │   ├── MessageList.jsx
│   │   ├── MessageInput.jsx
│   │   └── AudioPlayer.jsx
│   ├── Conversations/
│   │   ├── ConversationList.jsx
│   │   ├── ConversationItem.jsx
│   │   └── NewConversation.jsx
│   └── Layout/
│       ├── Sidebar.jsx
│       └── MainLayout.jsx
├── hooks/
├── services/
│   ├── agent.service.js
│   ├── audio.service.js
│   └── conversation.service.js
└── utils/
```

### Backend (Node.js + Express)
```
server/
├── routes/
│   ├── auth.routes.js      ✅ (Completed)
│   ├── conversation.routes.js
│   ├── message.routes.js
│   └── audio.routes.js
├── middleware/
│   └── auth.middleware.js  ✅ (Completed)
├── services/
│   ├── agent.service.js    (AI orchestration)
│   ├── perplexity.service.js
│   ├── googleTTS.service.js
│   └── s3.service.js
├── prisma/
│   └── schema.prisma
└── utils/
```

### Database Schema (Neon PostgreSQL with Prisma)
```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  password      String
  name          String?
  conversations Conversation[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Conversation {
  id        String    @id @default(cuid())
  title     String
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  role           String       // 'user' | 'assistant'
  content        String
  audioUrl       String?      // S3 URL for audio files
  audioDuration  Int?         // Duration in seconds
  metadata       Json?        // Store sources, settings, etc.
  createdAt      DateTime     @default(now())
}
```

### External APIs & Services
- **AI Orchestration**: OpenAI/Anthropic API for agent logic and context management
- **Perplexity AI**: Real-time news research and summarization
- **Google Text-to-Speech**: High-quality audio generation
- **AWS S3**: Audio file storage and delivery
- **Authentication**: JWT + bcrypt ✅ (Completed)

## Development Phases

### Phase 1: Foundation ✅ (Completed)
- [x] Set up React + Vite app with authentication UI
- [x] Create Node.js server with auth endpoints
- [x] Implement user registration/login with JWT
- [x] Set up Neon PostgreSQL with Prisma ORM

### Phase 2: Conversation System (Day 1-2)
- [ ] Update Prisma schema for conversations and messages
- [ ] Create conversation management API endpoints
- [ ] Build conversation sidebar UI
- [ ] Implement chat interface with message history
- [ ] Set up real-time updates (optional: WebSockets)

### Phase 3: AI Agent Integration (Day 3-4)
- [ ] Implement AI orchestration service (OpenAI/Anthropic)
- [ ] Create context management for conversations
- [ ] Integrate Perplexity API for news research
- [ ] Build intelligent routing logic
- [ ] Handle follow-up questions with context

### Phase 4: Audio Generation & Storage (Day 5)
- [ ] Set up AWS S3 bucket and credentials
- [ ] Integrate Google Text-to-Speech API
- [ ] Implement audio upload to S3
- [ ] Create audio player component
- [ ] Build playlist view for conversation audio

### Phase 5: Polish & Deploy (Day 6-7)
- [ ] Add duration filter for audio generation
- [ ] Implement error handling and retry logic
- [ ] Style with modern UI (Tailwind CSS)
- [ ] Optimize performance and caching
- [ ] Deploy to Vercel/Railway
- [ ] Testing and bug fixes

## Success Criteria

### Technical Demonstraction
- [ ] Complete user authentication flow
- [ ] Successful API integrations (Perplexity + Google TTS)
- [ ] Responsive, polished UI
- [ ] Error handling for edge cases
- [ ] Live deployment on Vercel

### Portfolio Value
- [ ] Clean, readable code with proper structure
- [ ] Demonstrates full-stack capabilities
- [ ] Shows integration with modern APIs
- [ ] Includes user authentication implementation
- [ ] Unique project that stands out from typical portfolios

## API Integration Details

### AI Orchestration (OpenAI/Anthropic)
```javascript
// OpenAI Example
POST https://api.openai.com/v1/chat/completions
{
  "model": "gpt-4-turbo-preview",
  "messages": [
    {"role": "system", "content": "You are a news research assistant..."},
    {"role": "user", "content": "Tell me about AI developments"},
    {"role": "assistant", "content": "Previous response..."},
    {"role": "user", "content": "What about OpenAI specifically?"}
  ]
}
```

### Perplexity AI (Real-time News)
```javascript
POST https://api.perplexity.ai/chat/completions
{
  "model": "llama-3.1-sonar-large-128k-online",
  "messages": [
    {
      "role": "system",
      "content": "Generate an audio-friendly news summary. Target length: [user_specified] minutes."
    },
    {
      "role": "user", 
      "content": "Summarize today's AI news with focus on [specific_topic]"
    }
  ],
  "temperature": 0.2,
  "max_tokens": 4000
}
```

### Google Text-to-Speech
```javascript
POST https://texttospeech.googleapis.com/v1/text:synthesize
{
  "input": {"text": "News summary text"},
  "voice": {
    "languageCode": "en-US", 
    "name": "en-US-Journey-F"  // Premium voice
  },
  "audioConfig": {
    "audioEncoding": "MP3",
    "speakingRate": 1.0,
    "pitch": 0.0
  }
}
```

### AWS S3 Upload
```javascript
// Using AWS SDK
const params = {
  Bucket: 'soundbyte-audio',
  Key: `${userId}/${conversationId}/${messageId}.mp3`,
  Body: audioBuffer,
  ContentType: 'audio/mpeg',
  ACL: 'public-read'
};
await s3.upload(params).promise();
```

## Risk Mitigation

### Technical Risks
- **API Rate Limits**: Implement caching and request queuing
- **Authentication Security**: Use established patterns (bcrypt, JWT)
- **File Storage**: Temporary audio file cleanup strategy

### Timeline Risks
- **Scope Creep**: Stick to MVP features, document future enhancements
- **API Integration**: Test external APIs early in development
- **Deployment Issues**: Prepare Vercel configuration in advance

## Future Roadmap (Post-MVP)

### Phase 2: Automation
- Scheduled news updates (daily/weekly subscriptions)
- Multiple topic subscriptions per user
- Email notifications for new summaries

### Phase 3: Intelligence
- AI agent for follow-up questions
- Personalized news preferences
- Topic trend analysis

### Phase 4: Social
- Share audio summaries
- Community topic requests
- User feedback on summaries

## Development Environment Setup

### Prerequisites
- Node.js 18+
- React 18+ with Vite
- Neon PostgreSQL database
- Prisma ORM
- AI Orchestration API key (OpenAI/Anthropic)
- Perplexity AI API key
- Google Cloud account with TTS enabled
- AWS account with S3 access

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL="postgresql://..." # Neon connection string
JWT_SECRET="your_secret_here"
OPENAI_API_KEY="your_key_here"  # or ANTHROPIC_API_KEY
PERPLEXITY_API_KEY="your_key_here"
GOOGLE_TTS_API_KEY="your_key_here"
AWS_ACCESS_KEY_ID="your_key_here"
AWS_SECRET_ACCESS_KEY="your_key_here"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="soundbyte-audio"

# Frontend (.env)
VITE_API_URL="http://localhost:3000"
```

### Quick Start Commands
```bash
# Backend setup
cd server
npm install express prisma @prisma/client bcryptjs jsonwebtoken cors dotenv
npm install openai # or @anthropic-ai/sdk
npm install @aws-sdk/client-s3
npm install @google-cloud/text-to-speech
npx prisma init
npx prisma generate
npx prisma migrate dev

# Frontend setup (already done with Vite)
cd client
npm install axios react-router-dom
npm install @tailwindcss/forms @headlessui/react
npm install react-audio-player
```

## Measuring Success

### Quantitative Metrics
- Successful user registration/login flows
- Audio generation success rate (>95%)
- Average response time (<30 seconds)
- Zero security vulnerabilities

### Qualitative Goals
- Code quality suitable for senior developer review
- User experience that feels polished and professional
- Demonstrated mastery of full-stack development concepts
- Unique portfolio piece that generates interview interest