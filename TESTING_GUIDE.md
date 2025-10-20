# Testing Guide - Free Tier & Digest Token Tracking

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
npm run dev
```

Should see:
```
🚀 SoundByte API running on port 3000
📅 Scheduler started
🧹 Cleanup job started
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Open App
```
http://localhost:5173
```

---

## ✅ Test Checklist

### Test 1: Login Works ✓
- Go to login page
- Enter credentials
- Should login successfully (no more hanging!)

### Test 2: Profile Shows New Token Breakdown
- Go to Profile page
- You should see:
  - ✅ **Status:** Free or Pro
  - ✅ **Billing Period:** Oct 20, 2025 - Nov 19, 2025 (your dates)
  - ✅ **Token breakdown:**
    - Consumed: X tokens (blue bar)
    - Reserved: Y tokens (yellow bar)
    - Available: Z tokens (shown in green)
  - ✅ **Progress bar** with colors showing consumed vs reserved

### Test 3: Chat Feature Works for Free Users
- Go to Playground (Dashboard)
- Create a conversation
- Send a message
- Should work! Tokens tracked from 10K pool
- Check Profile → tokens consumed should increase

### Test 4: Free User Digest Restrictions
- Go to Digests page
- Try to create a digest:
  - **Monthly frequency** → ❌ Blocked: "Monthly digests require Pro"
  - **10-minute audio** → ❌ Blocked: "10-minute digests require Pro"
  - **2nd active digest** → ❌ Blocked: "Free tier allows only 1 active digest"
  - **Weekly 5-min** → ❌ Blocked: "Not enough tokens. Need 32,000, have 10,000"

### Test 5: Free User CAN Create Low-Cost Digest (if no allocation yet)
- If you have 10K tokens available:
- Create: Weekly 2-min digest
- Should calculate: 5,000 × 4 = 20,000 tokens needed
- If you have no other allocations: ❌ Blocked (20K > 10K)
- **Reality:** Free users get 10K tokens for chat + manual digest testing only

### Test 6: Manual Digest Generation (Free Tier)
- Create any digest (won't auto-generate)
- Click "Generate Now" button
- Should check: "Need 5,000-8,000 tokens, have X available"
- If sufficient: ✅ Generates and tracks usage
- If insufficient: ❌ Blocked with clear message

### Test 7: Pro User Experience
- Upgrade to Pro (use Stripe test card: 4242 4242 4242 4242)
- Profile should show:
  - Status: **Pro (Active)**
  - Token Limit: **500,000**
  - Billing period aligned with subscription date
- Try creating multiple digests:
  - Daily 5-min → ✅ Allocates 240,000 tokens
  - Weekly 2-min → ✅ Allocates 20,000 tokens
  - Shows remaining: 240,000 available

### Test 8: Token Allocation Display
- After creating digests, check Profile:
  - **Reserved:** Should show total allocation (e.g., 260,000)
  - **Available:** Should show limit - consumed - allocated
  - **Progress bar:** Yellow (reserved) + Blue (consumed)

### Test 9: Delete Digest Frees Tokens
- Delete a digest
- Check Profile → Reserved tokens should decrease
- Available tokens should increase

### Test 10: Period Reset
- To test period reset (optional):
  - Manually update `periodEnd` in database to yesterday
  - Make a request (chat or digest)
  - New period should auto-create with fresh tokens

---

## 🎨 What the Profile Page Should Look Like

```
┌─────────────────────────────────────┐
│  Status: Free                        │
│  Billing Period: Oct 20 - Nov 19    │
│                                      │
│  Token Usage: 5,000 / 10,000        │
│                                      │
│  • Consumed: 5,000                  │
│  • Reserved: 0                      │
│  • Available: 5,000                 │
│                                      │
│  [████████████░░░░░░░] 50%          │
│  ■ Consumed  ■ Reserved  □ Available│
│                                      │
│  [Upgrade to Pro ($19.99/month)]    │
└─────────────────────────────────────┘
```

For Pro users with digests:
```
┌─────────────────────────────────────┐
│  Status: Pro (Active)                │
│  Billing Period: Oct 15 - Nov 14    │
│                                      │
│  Token Usage: 285,000 / 500,000     │
│                                      │
│  • Consumed: 25,000                 │
│  • Reserved: 260,000                │
│  • Available: 215,000               │
│                                      │
│  [███████░░░░░░░░░░░░░] 57%         │
│  ■ Consumed  ■ Reserved  □ Available│
│                                      │
│  [Manage Subscription]              │
└─────────────────────────────────────┘
```

---

## 🐛 Common Issues

### "Unknown argument userId_periodStart"
- **Cause:** Prisma client not regenerated after migration
- **Fix:** `cd backend && rm -rf generated && npx prisma generate && npm run dev`

### Login hangs
- **Cause:** Zombie process on port 3000
- **Fix:** `lsof -i :3000` then `kill -9 PID`

### Server exits immediately after startup
- **Cause:** TypeScript syntax in .js files
- **Fix:** Already fixed - all .ts files converted to .js

### "Not enough tokens" for small digest
- **Expected:** Free tier calculations are strict
- **Example:** Weekly 2-min = 20K needed, only 10K available
- **Solution:** Free users should use manual generation only

---

## 📊 Expected Token Costs

### Chat Feature
- Short message: ~50-200 tokens
- Long conversation: ~500-2,000 tokens
- With tool use (search/audio): ~1,000-5,000 tokens

### Digest Generation (Manual)
- 2-min digest: ~5,000 tokens
- 5-min digest: ~8,000 tokens
- 10-min digest: ~15,000 tokens

### Digest Allocation (Automatic Recurring)
- Daily 2-min: 150,000/month
- Daily 5-min: 240,000/month
- Weekly 2-min: 20,000/month
- Weekly 5-min: 32,000/month
- Monthly 5-min: 8,000/month

---

## ✅ Success Criteria

After testing, you should be able to confirm:

- [x] Login works (no hanging)
- [x] Profile shows billing period dates
- [x] Profile shows token breakdown (consumed/reserved/available)
- [x] Progress bar visualizes usage correctly
- [x] Chat works for free users
- [x] Free tier restrictions enforced on digest creation
- [x] Manual digest generation checks tokens first
- [x] Pro users can create multiple digests
- [x] Token allocation prevents over-commitment
- [x] Deleting digest frees reserved tokens

---

**Happy testing!** 🎉

If anything doesn't work as expected, check the console for error messages and let me know!

