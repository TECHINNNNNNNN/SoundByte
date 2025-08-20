const API_URL = 'http://localhost:3000/api';
let cookies = '';

// Test credentials - update these with your actual test user
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

// Helper to make authenticated requests
async function api(method, path, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    credentials: 'include'
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_URL}${path}`, options);
  
  // Save cookies from response
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    cookies = setCookie;
  }
  
  const data = await response.text();
  const result = {
    ok: response.ok,
    status: response.status,
    data: data ? JSON.parse(data) : null,
    headers: response.headers
  };
  
  if (!response.ok) {
    throw result;
  }
  
  return result;
}

async function runTests() {
  try {
    console.log('🧪 Testing Digest API Endpoints\n');
    
    // 1. Login first
    console.log('1️⃣ Logging in...');
    const loginResponse = await api('POST', '/auth/login', TEST_USER);
    console.log('✅ Login successful\n');
    
    // 2. Create a digest
    console.log('2️⃣ Creating a new digest...');
    const createResponse = await api('POST', '/digests', {
      title: 'AI News Daily',
      searchQuery: 'artificial intelligence latest breakthroughs',
      frequency: 'daily',
      audioLength: 5,
      useDefaultEmail: true
    });
    
    const createdDigest = createResponse.data;
    console.log('✅ Digest created:', {
      id: createdDigest.id,
      title: createdDigest.title,
      frequency: createdDigest.frequency,
      audioLength: createdDigest.audioLength,
      nextGenerationAt: createdDigest.nextGenerationAt
    });
    console.log();
    
    // 3. Get all digests
    console.log('3️⃣ Fetching all digests...');
    const getResponse = await api('GET', '/digests');
    console.log(`✅ Found ${getResponse.data.length} digest(s)\n`);
    
    // 4. Update the digest
    console.log('4️⃣ Updating digest...');
    const updateResponse = await api('PUT', `/digests/${createdDigest.id}`, {
      audioLength: 10,
      frequency: 'weekly'
    });
    console.log('✅ Digest updated:', {
      audioLength: updateResponse.data.audioLength,
      frequency: updateResponse.data.frequency,
      nextGenerationAt: updateResponse.data.nextGenerationAt
    });
    console.log();
    
    // 5. Test validation
    console.log('5️⃣ Testing validation...');
    try {
      await api('POST', '/digests', {
        title: 'Invalid Digest',
        searchQuery: 'test',
        frequency: 'hourly', // Invalid
        audioLength: 7 // Invalid
      });
      console.log('❌ Validation failed - should have rejected invalid values');
    } catch (error) {
      console.log('✅ Validation working:', error.data.error);
    }
    console.log();
    
    // 6. Delete the digest
    console.log('6️⃣ Deleting digest...');
    const deleteResponse = await api('DELETE', `/digests/${createdDigest.id}`);
    console.log('✅ Digest deleted:', deleteResponse.data.message);
    console.log();
    
    console.log('🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.data || error.message || error);
    if (error.status === 401) {
      console.log('\n⚠️  Make sure you have a test user created with these credentials:');
      console.log('   Email:', TEST_USER.email);
      console.log('   Password:', TEST_USER.password);
    }
  }
}

// Run the tests
console.log('Starting digest API tests...');
console.log('Make sure the backend server is running on http://localhost:3000\n');
runTests();