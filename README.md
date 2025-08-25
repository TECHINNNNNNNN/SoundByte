# 🎙️ SoundByte

**Transform overwhelming news into engaging AI podcasts – because reading 50 articles a day isn't sustainable.**

I built SoundByte after falling in love with Google's NotebookLM and its ability to turn dense information into digestible podcasts. But I wanted something more – automated, personalized, and focused on daily news. This is the result: an AI system that researches, curates, and narrates the news that matters to you, delivered as natural multi-speaker conversations.

## 🌟 Live Demo

**[Experience SoundByte →](https://sound-byte-kappa.vercel.app/)**

Watch the terminal demo on the landing page, or create an account to generate your first AI podcast.

![SoundByte](https://drive.google.com/file/d/1rUO5Hy7KIvjLgtV6Gy0EICH3J4Iff_F_/view?usp=sharing)

## 💭 Why I Built This

I'm someone who learns best through audio. Podcasts transformed my commute from dead time into learning time. But there was a gap – breaking news and daily updates don't come in podcast form. They come as endless articles, newsletters, and feeds that pile up faster than anyone can read.

After discovering NotebookLM's approach to audio synthesis, I realized I could solve this problem. Not just text-to-speech, but actual conversational podcasts with multiple speakers discussing topics naturally. The kind of content you'd actually *want* to listen to.

SoundByte is my answer to information overload. It's not about consuming more content – it's about consuming the *right* content in the *right* format.

## 🏗️ Technical Architecture

<details>
<summary><b>View Complete System Design</b></summary>

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React 19 + TypeScript] --> B[TanStack Query]
        B --> C[Axios Interceptors]
        C --> D[JWT Management]
        A --> E[GSAP Animations]
        A --> F[Tailwind CSS]
    end
    
    subgraph "API Gateway"
        G[Express.js Server] --> H[Rate Limiter]
        H --> I[CORS Handler]
        I --> J[Auth Middleware]
        J --> K[Route Controllers]
    end
    
    subgraph "AI Services"
        L[AI Agent Controller] --> M{Tool Selection}
        M -->|News Query| N[Perplexity API]
        M -->|Audio Request| O[Audio Pipeline]
        O --> P[Content Parser]
        P --> Q[Google TTS Multi-Voice]
        Q --> R[Audio Merger]
        R --> S[WAV Encoder]
    end
    
    subgraph "Storage & Data"
        T[(PostgreSQL)] --> U[Prisma ORM]
        U --> V[Type-Safe Queries]
        W[AWS S3] --> X[Audio Files]
        Y[Redis Cache] --> Z[Session Store]
    end
    
    subgraph "Background Jobs"
        AA[Node-Cron Scheduler] --> AB[Digest Generator]
        AB --> AC[Batch Processor]
        AC --> AD[Email Queue]
    end
    
    subgraph "Payment System"
        AE[Stripe Checkout] --> AF[Webhook Handler]
        AF --> AG[Idempotency Check]
        AG --> AH[Subscription Manager]
        AH --> AI[Usage Tracker]
    end
    
    subgraph "Auth System"
        AJ[Passport.js] --> AK[Local Strategy]
        AJ --> AL[OAuth Google]
        AJ --> AM[OAuth GitHub]
        AK --> AN[Bcrypt + Salt]
    end
    
    C --> G
    K --> L
    K --> T
    S --> W
    AF --> T
    AA --> L
```

</details>

## ✨ Core Features & Technical Implementation

### 🤖 AI Agent with Intelligent Tool Selection

The heart of SoundByte is an AI agent that knows when to search for news versus when to generate audio. This isn't a simple if-else – it's a sophisticated tool-calling system using OpenAI's function calling:

```javascript
// AI decides whether to search news or generate audio based on context
const searchNewsTool = tool({
  description: ENHANCED_TOOL_DESCRIPTION,
  inputSchema: z.object({
    query: z.string().describe('The news topic or question to research'),
    timeframe: z.string().optional().describe('How recent: today, week, or month')
  }),
  execute: async ({ query, timeframe }) => {
    // Perplexity API integration for real-time news
    const result = await perplexityService.researchNews(query, timeframe)
    return result.content
  }
})

// Multi-step conversation with tool usage tracking
const result = await generateText({
  model: openai('gpt-5'),
  system: ENHANCED_SYSTEM_PROMPT,
  messages: conversationHistory,
  tools: { searchNews, generateAudio },
  toolChoice: 'auto',
  stopWhen: stepCountIs(5)  // Prevent infinite loops
})
```

The AI maintains conversation state, tracks tool usage, and ensures responses are contextually appropriate.

### 🎧 Multi-Speaker Audio Synthesis Pipeline

This was the most challenging feature. Creating natural conversations between AI voices requires:

1. **Intelligent Dialogue Parsing**: The system identifies speaker turns and maintains conversational flow
2. **Voice Assignment**: Different voices for Host/Guest with consistent mapping
3. **Audio Processing**: Real-time synthesis with proper pacing and intonation
4. **Buffer Management**: Handling base64 audio streams and converting to WAV format

```javascript
// Multi-speaker synthesis with Google Cloud TTS
export const generateMultiSpeakerAudio = async (content, speakers) => {
  const segments = parseDialogue(content)
  const audioBuffers = []
  
  for (const segment of segments) {
    const voice = speakers.find(s => s.name === segment.speaker)
    const audio = await synthesizeSpeech({
      text: segment.text,
      voice: voice.id,
      speakingRate: 1.0,
      pitch: voice.pitch
    })
    audioBuffers.push(audio)
  }
  
  // Merge audio segments with proper timing
  const merged = await mergeAudioBuffers(audioBuffers)
  const wav = encodeWAV(merged, { sampleRate: 24000, channels: 1 })
  
  // Upload to S3 with proper content headers
  const url = await s3Service.uploadAudio(wav, messageId, 'audio/wav')
  return { audioContent: wav, url }
}
```

### 📅 Intelligent Digest Scheduler

The scheduler isn't just a cron job – it's a timezone-aware system that generates content at optimal times:

```javascript
// Timezone-aware scheduling with job queuing
export const scheduleDigest = async (digest) => {
  const userTime = convertToUserTimezone(digest.preferredHour, digest.timezone)
  const utcTime = convertToUTC(userTime)
  
  // Calculate next generation time considering frequency
  const nextRun = calculateNextRun(utcTime, digest.frequency)
  
  // Prevent duplicate generation with database locks
  const lock = await acquireLock(`digest-${digest.id}`)
  if (!lock) return
  
  try {
    // Check if already generated recently
    if (digest.lastGeneratedAt && 
        isWithinWindow(digest.lastGeneratedAt, 23)) {
      return // Prevent duplicate within 23 hours
    }
    
    // Generate and deliver
    const audio = await generateDigestAudio(digest)
    await deliverDigest(digest, audio)
    
    // Update next run time
    await updateDigest(digest.id, {
      lastGeneratedAt: new Date(),
      nextGenerationAt: nextRun
    })
  } finally {
    await releaseLock(lock)
  }
}
```

### 💳 Production-Grade Payment System

Stripe integration with complete subscription lifecycle management:

```javascript
// Webhook handler with signature verification and idempotency
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature']
  
  // Verify webhook signature
  const event = stripe.webhooks.constructEvent(
    req.rawBody, 
    sig, 
    process.env.STRIPE_WEBHOOK_SECRET
  )
  
  // Idempotency check to prevent duplicate processing
  const processed = await checkWebhookEvent(event.id)
  if (processed) return res.json({ received: true })
  
  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      await createSubscription(event.data.object)
      break
    case 'customer.subscription.updated':
      await updateSubscriptionStatus(event.data.object)
      break
    case 'invoice.payment_failed':
      await handleFailedPayment(event.data.object)
      break
  }
  
  // Mark as processed
  await markWebhookProcessed(event.id)
  res.json({ received: true })
}
```

### 🔐 Secure Authentication System

Multi-strategy authentication with OAuth and local auth:

```javascript
// Passport configuration with multiple strategies
passport.use(new LocalStrategy(async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return done(null, false)
  
  // Bcrypt with salt rounds for password hashing
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return done(null, false)
  
  return done(null, user)
}))

// OAuth with account linking
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  // Find or create user with OAuth account linking
  let user = await prisma.user.findUnique({
    where: { email: profile.emails[0].value }
  })
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.emails[0].value,
        name: profile.displayName,
        provider: 'google',
        providerId: profile.id,
        emailVerified: true
      }
    })
  }
  
  // Link OAuth account if not already linked
  await linkOAuthAccount(user.id, 'google', profile.id)
  return done(null, user)
}))
```

### 🚀 Database Design & Optimization

Complex relational schema with Prisma ORM:

```prisma
model Digest {
  id               String    @id @default(cuid())
  userId           String
  title            String
  searchQuery      String
  frequency        String    // "daily" | "weekly" | "monthly"
  audioLength      Int       // 2, 5, or 10 minutes
  timezone         String    @default("UTC")
  preferredHour    Int       @default(8)
  isActive         Boolean   @default(true)
  nextGenerationAt DateTime? // Indexed for efficient querying
  lastGeneratedAt  DateTime?
  
  user             User      @relation(fields: [userId], references: [id])
  deliveries       DigestDelivery[]
  
  @@index([userId])
  @@index([isActive, nextGenerationAt]) // Compound index for scheduler
  @@map("digests")
}

// Optimized query with selective loading
const upcomingDigests = await prisma.digest.findMany({
  where: {
    isActive: true,
    nextGenerationAt: { lte: new Date() }
  },
  include: {
    user: { select: { email: true, name: true } },
    deliveries: { 
      take: 1, 
      orderBy: { createdAt: 'desc' } 
    }
  }
})
```

## 📊 Performance & Scale Considerations

### Token Usage Optimization
- Implemented token counting before API calls
- Batch processing for multiple digests
- Caching of frequently requested topics
- Usage tracking per user with monthly limits

### Response Time Optimization
```javascript
// Parallel processing for independent operations
const [newsData, userPrefs, previousDigests] = await Promise.all([
  perplexityService.researchNews(query),
  getUserPreferences(userId),
  getPreviousDigests(userId, 5)
])

// Stream processing for large audio files
const audioStream = new PassThrough()
audioStream.pipe(s3Upload)
audioGenerator.pipe(audioStream)
```

### Database Query Optimization
- Selective field loading with Prisma select
- Compound indexes for common query patterns
- Connection pooling with PgBouncer ready config
- Batch updates for webhook processing

## 🔒 Security Implementation

### API Security
- **Rate Limiting**: 100 requests/15min in production
- **CORS**: Whitelisted origins with credentials support
- **SQL Injection**: Prevented via Prisma's parameterized queries
- **XSS Protection**: React's automatic escaping + Content Security Policy headers

### Authentication Security
- **JWT Tokens**: Short-lived (15min) with refresh token rotation
- **Session Management**: Secure, httpOnly, sameSite cookies
- **Password Security**: Bcrypt with 12 salt rounds
- **OAuth Security**: State parameter validation, PKCE flow ready

### Infrastructure Security
```javascript
// Environment validation at startup
const requiredEnvVars = [
  'DATABASE_URL', 'JWT_SECRET', 'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY', 'AWS_ACCESS_KEY_ID'
]

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`)
  }
})

// Webhook signature verification
const verifyWebhookSignature = (payload, signature) => {
  const expectedSig = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  )
}
```

## 💡 Challenges Solved

### Multi-Speaker Audio Synchronization
**Problem**: Merging multiple TTS outputs created unnatural gaps and overlaps.
**Solution**: Implemented a custom audio buffer with crossfade transitions and dynamic gap insertion based on sentence boundaries.

### AI Response Variability
**Problem**: GPT sometimes generated content in unexpected formats.
**Solution**: Created a robust parsing system with fallbacks and implemented strict output validation using Zod schemas.

### Managing API Costs
**Problem**: Unrestricted AI usage could lead to massive bills.
**Solution**: Implemented per-user token tracking, monthly limits, and smart caching of common queries.

### Railway Deployment Complexities
**Problem**: Initial deployment on Vercel couldn't handle long-running audio generation.
**Solution**: Migrated to Railway for better support of background jobs and websocket connections. Implemented proper health checks and graceful shutdowns.

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.1-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.14-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

### AI & Cloud
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--5-412991?style=for-the-badge&logo=openai&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-TTS-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-S3-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?style=for-the-badge&logo=stripe&logoColor=white)

## 🚀 Getting Started

### Prerequisites
```bash
node --version  # 20.0.0 or higher
postgresql --version  # 15.0 or higher
```

### Quick Setup

1. **Clone & Install**
```bash
git clone https://github.com/TECHINNNNNNNN/SoundByte.git
cd SoundByte

# Install all dependencies
npm run install:all
```

2. **Environment Configuration**

Backend `.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/soundbyte"

# Security
JWT_SECRET="generate-a-long-random-string"
SESSION_SECRET="another-long-random-string"

# AI Services
OPENAI_API_KEY="sk-..."
PERPLEXITY_API_KEY="pplx-..."
GOOGLE_APPLICATION_CREDENTIALS="./google-credentials.json"

# AWS
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
S3_BUCKET_NAME="soundbyte-audio"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."

# OAuth (Optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# URLs
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

Frontend `.env`:
```env
VITE_API_URL="http://localhost:3000"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

3. **Database Setup**
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed  # Optional: Add sample data
```

4. **Launch Development**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

Visit `http://localhost:5173` 🚀

## 📈 What's Next

- **🎵 Voice Marketplace**: Let users choose from a library of AI voices
- **🌍 Multilingual Support**: Generate podcasts in 20+ languages
- **📱 Mobile App**: React Native app with offline playback
- **🤝 Team Digests**: Shared audio briefings for organizations
- **📊 Analytics Dashboard**: Listening patterns and topic insights
- **🎯 Smart Recommendations**: ML-based content suggestions
- **⚡ Real-time Streaming**: WebSocket-based live audio generation
- **🔊 Voice Commands**: "Hey SoundByte, what's happening in tech today?"

## 🤝 Connect

Built with passion by **Techin Chompooborisuth** – a third-year ICE student at Chulalongkorn University who believes in making information accessible through audio.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/techin-chompooborisuth-396b19268)

---

**Have ideas for making news consumption even better?** I'd love to hear your thoughts on where SoundByte could go next. This project started as a solution to my own problem, but I believe it could help millions of people stay informed without the overwhelm.

*SoundByte is open for collaboration. Whether you're interested in the AI implementation, the audio processing pipeline, or just want to chat about the future of audio content – let's connect!*