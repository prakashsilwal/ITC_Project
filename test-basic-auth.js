const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body ? JSON.parse(body) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body,
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAuthentication() {
  console.log('\n🧪 Testing Basic Authentication Flow\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Signup
    console.log('\n1️⃣  Testing Signup...');
    const signupData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: `test.user.${Date.now()}@example.com`,
      password: 'SecurePass123!@#',
      country: 'United States',
      countryCode: '+1',
      phoneNumber: '5551234567',
    };

    const signupResponse = await makeRequest('POST', '/api/v1/auth/signup', signupData);
    console.log(`   Status: ${signupResponse.status}`);

    if (signupResponse.status === 201) {
      console.log('   ✅ Signup successful');
      console.log(`   User ID: ${signupResponse.data.data.id}`);
      console.log(`   Email: ${signupResponse.data.data.email}`);
      console.log(`   Role: ${signupResponse.data.data.role}`);
    } else {
      console.log('   ❌ Signup failed');
      console.log(`   Error: ${JSON.stringify(signupResponse.data, null, 2)}`);
      return;
    }

    // Test 2: Login
    console.log('\n2️⃣  Testing Login...');
    const loginData = {
      email: signupData.email,
      password: signupData.password,
    };

    const loginResponse = await makeRequest('POST', '/api/v1/auth/login', loginData);
    console.log(`   Status: ${loginResponse.status}`);

    let token;
    if (loginResponse.status === 200) {
      console.log('   ✅ Login successful');
      token = loginResponse.data.data.token;
      console.log(`   Token received: ${token.substring(0, 20)}...`);
      console.log(`   User: ${loginResponse.data.data.user.firstName} ${loginResponse.data.data.user.lastName}`);
    } else {
      console.log('   ❌ Login failed');
      console.log(`   Error: ${JSON.stringify(loginResponse.data, null, 2)}`);
      return;
    }

    // Test 3: Get Current User (/me)
    console.log('\n3️⃣  Testing /me endpoint (protected route)...');

    const meResponse = await new Promise((resolve, reject) => {
      const url = new URL('/api/v1/auth/me', BASE_URL);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(body),
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: body,
            });
          }
        });
      });

      req.on('error', reject);
      req.end();
    });

    console.log(`   Status: ${meResponse.status}`);

    if (meResponse.status === 200) {
      console.log('   ✅ /me endpoint working');
      console.log(`   User ID: ${meResponse.data.data.id}`);
      console.log(`   Email: ${meResponse.data.data.email}`);
      console.log(`   Role: ${meResponse.data.data.role}`);
    } else {
      console.log('   ❌ /me endpoint failed');
      console.log(`   Error: ${JSON.stringify(meResponse.data, null, 2)}`);
      return;
    }

    // Test 4: Health check
    console.log('\n4️⃣  Testing Health endpoint...');
    const healthResponse = await makeRequest('GET', '/health');
    console.log(`   Status: ${healthResponse.status}`);

    if (healthResponse.status === 200) {
      console.log('   ✅ Health check passed');
      console.log(`   Status: ${healthResponse.data.data.status}`);
    } else {
      console.log('   ❌ Health check failed');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ All authentication tests passed!\n');

  } catch (error) {
    console.log('\n' + '='.repeat(50));
    console.log('❌ Test failed with error:');
    console.error(error);
    console.log('');
    process.exit(1);
  }
}

testAuthentication();
