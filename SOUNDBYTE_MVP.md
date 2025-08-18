# SoundByte MVP - Focused Scope

## 🎯 MVP Vision (1 Week Build)
**A conversational AI that researches news and generates audio summaries on demand.**

## ✅ What the MVP DOES Include

### Core Features (Must Have)
1. **Smart News Chat**
   - User asks about any news topic
   - AI decides: needs research (Perplexity) or can answer directly
   - Maintains context for follow-up questions
   - Multiple topics in same conversation (let AI handle naturally)

2. **Audio Generation**
   - Every AI response gets converted to audio
   - 2-3 minute limit per response
   - Play directly in chat interface
   - Audio stored in S3 with URLs in database

3. **Conversation Memory**
   - Each chat maintains full context
   - Can ask follow-ups hours/days later
   - AI remembers what was discussed

### User Journey (MVP)
```
User: "What's new with AI today?"
SoundByte: [Researches via Perplexity] 
          "Here are today's top AI developments..." 
          [2-min audio auto-generated]
          
User: "Tell me more about OpenAI's announcement"
SoundByte: [Uses context, might research more]
          "OpenAI announced..." 
          [2-min audio]

User: "Also what about crypto?"
SoundByte: [Handles multiple topics naturally]
          "In crypto news today..."
          [2-min audio]
```

## ❌ What the MVP Does NOT Include (Future)

### Save for Later
- ❌ Scheduled/automated digests
- ❌ Email delivery
- ❌ User preferences/settings
- ❌ Subscription management
- ❌ Analytics/tracking
- ❌ Social features
- ❌ Audio download button (just streaming)

## 🏗️ Technical Implementation (MVP)

### Backend Architecture
```typescript
// Simple flow - no scheduling, no email
class AIOrchestrator {
  async processMessage(conversationId, message) {
    // 1. Get conversation context
    const context = await getContext(conversationId)
    
    // 2. Decide: research or respond
    const needsResearch = await checkIfNewsQuery(message, context)
    
    // 3. Generate response
    const response = needsResearch 
      ? await perplexity.research(message, context)
      : await openai.respond(message, context)
    
    // 4. Generate audio
    const audioUrl = await googleTTS.generate(response)
    
    // 5. Save and return
    return saveMessage(conversationId, response, audioUrl)
  }
}
```

### Database (What We Already Have)
```prisma
model Message {
  id             String       
  conversationId String
  role           String       // 'user' | 'assistant'
  content        String       
  audioUrl       String?      // S3 URL
  audioDuration  Int?         // Always ~2-3 min
  metadata       Json?        // Context, sources
  createdAt      DateTime     
}
```

### Frontend (Minimal Changes)
- Current chat interface works great
- Just add audio player to each message
- Show loading while generating audio
- That's it!

## 📅 MVP Development Plan (5-7 Days)

### Day 1-2: AI Orchestration
- [ ] Setup Vercel AI SDK
- [ ] Integrate OpenAI for orchestration
- [ ] Build decision engine (research vs respond)
- [ ] Connect Perplexity API

### Day 3: Audio Pipeline
- [ ] Google TTS integration
- [ ] S3 upload service
- [ ] 2-3 minute enforcement

### Day 4: Wire It Together
- [ ] Update message handler
- [ ] Add streaming support
- [ ] Error handling

### Day 5: Frontend Polish
- [ ] Add audio player component
- [ ] Loading states
- [ ] Error messages

### Day 6-7: Testing & Deploy
- [ ] End-to-end testing
- [ ] Fix bugs
- [ ] Deploy to production

## 🎮 What Makes This MVP Special

1. **It Actually Works** - Real news, real audio, real value
2. **Smart Context** - Remembers conversation, handles follow-ups
3. **Multiple Topics** - Natural conversation flow
4. **Quality Audio** - 2-3 min summaries, not robotic
5. **Fast** - Streaming responses, quick audio generation

## 🚀 Success Metrics for MVP

- [ ] Can research any news topic
- [ ] Generates listenable 2-3 min audio
- [ ] Handles follow-up questions
- [ ] Works reliably without crashes
- [ ] Deploys successfully

## 💡 Key Decisions Made

1. **No Scheduling** - Everything on-demand for MVP
2. **No Email** - Just in-app experience
3. **No Preferences** - AI handles everything naturally
4. **2-3 Minutes Max** - Consistent, digestible audio
5. **Stream Everything** - Better UX, modern feel

## 🎯 The "Wow" Factor

Even in MVP, users can:
- Have a real conversation about news
- Get audio summaries instantly
- Ask about multiple topics naturally
- Come back later and continue the conversation

**This is enough to impress!**

## Next Steps After MVP

Once MVP is working and deployed:
1. Add scheduled digests (Phase 2)
2. Add email delivery (Phase 2)
3. Add user preferences (Phase 3)
4. Add subscription management (Phase 3)

But for now - **FOCUS ON MVP!**