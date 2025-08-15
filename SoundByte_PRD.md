# News Audio Agent - Product Requirements Document

## "Your news, in bytes of sound"

## Executive Summary

**Project Name**: News Audio Agent  
**Timeline**: 1 Week MVP  
**Tech Stack**: React (Frontend), Node.js (Backend), Vercel (Deployment)  
**Primary Goal**: Create a portfolio-quality full-stack application demonstrating end-to-end development skills

## Problem Statement

News consumption is increasingly fragmented and time-consuming. Users want to stay informed about specific topics but lack time to read lengthy articles. Audio consumption offers a hands-free, multitasking-friendly alternative that fits modern lifestyles.

## Target Users

**Primary**: Busy professionals and general news consumers who:
- Commute regularly or have hands-free time
- Want curated, topic-specific news updates
- Prefer audio content for efficiency
- Are comfortable with AI-generated summaries

## Product Vision

A personalized news audio service where users can request topic-specific news summaries delivered as high-quality audio content, enabling effortless news consumption.

## Core Features (MVP - Week 1)

### 1. User Authentication
- **Registration/Login**: Email + password
- **Session Management**: JWT-based authentication
- **Protected Routes**: Secure user dashboard access

### 2. News Request Interface
- **Chat-Style Input**: Simple text input for news topics
- **Request Examples**: "AI news today", "crypto updates this week"
- **Loading States**: Clear feedback during API processing

### 3. AI-Powered Research
- **Perplexity Integration**: Automated news research and summarization
- **Topic Processing**: Parse user requests for relevant search terms
- **Content Curation**: Generate concise, audio-friendly summaries

### 4. Audio Generation
- **Google Text-to-Speech**: Convert summaries to natural speech
- **Audio Player**: In-browser playback with standard controls
- **Download Option**: Allow users to save audio files

### 5. User Dashboard
- **Request History**: List of previous news requests
- **Audio Library**: Access to generated audio summaries
- **Basic Profile**: User information management

## Technical Architecture

### Frontend (React)
```
src/
├── components/
│   ├── Auth/
│   ├── Chat/
│   ├── AudioPlayer/
│   └── Dashboard/
├── hooks/
├── services/
└── utils/
```

### Backend (Node.js + Express)
```
server/
├── routes/
│   ├── auth.js
│   ├── news.js
│   └── audio.js
├── middleware/
├── models/
├── services/
└── utils/
```

### Database Schema (MongoDB/PostgreSQL)
- **Users**: id, email, password_hash, created_at
- **Requests**: id, user_id, topic, summary, audio_url, created_at

### External APIs
- **Perplexity AI**: News research and summarization
- **Google Text-to-Speech**: Audio generation
- **Authentication**: JWT + bcrypt

## Development Phases

### Phase 1: Foundation (Days 1-2)
- [ ] Set up React app with authentication UI
- [ ] Create Node.js server with auth endpoints
- [ ] Implement user registration/login
- [ ] Set up database schema

### Phase 2: Core Functionality (Days 3-5)
- [ ] Build news request interface
- [ ] Integrate Perplexity API for news research
- [ ] Integrate Google TTS for audio generation
- [ ] Create audio playback component

### Phase 3: Polish & Deploy (Days 6-7)
- [ ] Implement request history
- [ ] Add error handling and loading states
- [ ] Style and responsive design
- [ ] Deploy to Vercel
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

### Perplexity AI
```javascript
POST https://api.perplexity.ai/chat/completions
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "model": "llama-3.1-sonar-small-128k-online",
  "messages": [
    {
      "role": "user", 
      "content": "Summarize today's AI news in 2-3 paragraphs"
    }
  ]
}
```

### Google Text-to-Speech
```javascript
POST https://texttospeech.googleapis.com/v1/text:synthesize
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "input": {"text": "News summary text"},
  "voice": {"languageCode": "en-US", "name": "en-US-Journey-F"},
  "audioConfig": {"audioEncoding": "MP3"}
}
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
- React 18+
- MongoDB/PostgreSQL database
- Perplexity AI API key
- Google Cloud account with TTS enabled

### Quick Start Commands
```bash
# Backend setup
npm init && npm install express mongoose bcryptjs jsonwebtoken cors dotenv

# Frontend setup
npx create-react-app news-audio-frontend
cd news-audio-frontend && npm install axios react-router-dom

# Environment variables
PERPLEXITY_API_KEY=your_key_here
GOOGLE_TTS_API_KEY=your_key_here
JWT_SECRET=your_secret_here
DATABASE_URL=your_db_url_here
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