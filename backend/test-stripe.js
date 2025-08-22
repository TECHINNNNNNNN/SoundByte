const API_URL = 'http://localhost:3000';

// Simple test runner
async function testEndpoint(name, fn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    const result = await fn();
    console.log('✅ Success:', result);
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Stripe endpoint tests...\n');
  
  // Test 1: Health check
  await testEndpoint('Health Check', async () => {
    const response = await fetch(`${API_URL}/health`);
    return await response.json();
  });

  // Test 2: Subscription status (will fail without auth)
  await testEndpoint('Subscription Status (no auth)', async () => {
    const response = await fetch(`${API_URL}/api/payments/subscription-status`);
    if (!response.ok) throw new Error(`Status ${response.status}: ${response.statusText}`);
    return await response.json();
  });

  // Test 3: Create checkout (will fail without auth)
  await testEndpoint('Create Checkout (no auth)', async () => {
    const response = await fetch(`${API_URL}/api/payments/create-checkout-session`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    });
    if (!response.ok) throw new Error(`Status ${response.status}: ${response.statusText}`);
    return await response.json();
  });

  console.log('\n📝 Note: Auth failures are expected - this confirms endpoints are protected');
  console.log('💡 To test with auth, login via frontend first, then grab JWT from cookies');
}

// Instructions
console.log('═══════════════════════════════════════════');
console.log('           STRIPE BACKEND TEST');
console.log('═══════════════════════════════════════════');
console.log('\nPrerequisites:');
console.log('1. Start backend: npm start');
console.log('2. Keep Stripe CLI running: stripe listen --forward-to localhost:3000/api/webhooks/stripe');
console.log('\n');

runTests();