import http from 'http';

// We will run this script with node server/test-backend.mjs while server is running or spawn server
const BASE_URL = 'http://localhost:5000';

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Starting ClaimVault Backend Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extraInfo = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${extraInfo}`);
      failed++;
    }
  };

  try {
    // Test 1: Health Check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health returns 200 OK');

    // Test 2: Login Demo User
    const login = await request('POST', '/api/auth/login', {
      email: 'abdullah@claimvault.pk',
      password: 'password123',
    });
    assert(login.status === 200 && login.data.token, 'POST /api/auth/login issues valid JWT token');
    const token = login.data.token;

    // Test 3: Get User Profile
    const me = await request('GET', '/api/auth/me', null, token);
    assert(me.status === 200 && me.data.user.email === 'abdullah@claimvault.pk', 'GET /api/auth/me returns profile');

    // Test 4: Register New User
    const randomEmail = `test_${Date.now()}@claimvault.pk`;
    const reg = await request('POST', '/api/auth/register', {
      name: 'Fatima Ali',
      email: randomEmail,
      password: 'mypassword123',
    });
    assert(reg.status === 201 && reg.data.token, 'POST /api/auth/register creates new account');

    // Test 5: List Products
    const prods = await request('GET', '/api/products', null, token);
    assert(prods.status === 200 && Array.isArray(prods.data.products), 'GET /api/products returns products array');

    // Test 6: Create Product
    const newProd = await request(
      'POST',
      '/api/products',
      {
        name: 'Apple iPad Pro 13 M4',
        brand: 'Apple',
        model: '256GB Space Black Wi-Fi',
        category: 'Computing',
        price: 345000,
        currency: 'PKR',
        purchaseDate: '2026-09-15',
        storeName: 'iStore Pakistan Packages Mall',
        warrantyDurationMonths: 12,
        warrantyDurationLabel: '1 Year AppleCare',
        warrantyExpiryDate: '2027-09-15',
        hasReturnPeriod: true,
        returnDurationDays: 7,
        returnDeadline: '2026-09-22',
      },
      token
    );
    assert(newProd.status === 201 && newProd.data.product.id, 'POST /api/products creates product');
    const createdId = newProd.data.product.id;

    // Test 7: Get Single Product
    const getSingle = await request('GET', `/api/products/${createdId}`, null, token);
    assert(getSingle.status === 200 && getSingle.data.product.name === 'Apple iPad Pro 13 M4', 'GET /api/products/:id retrieves product');

    // Test 8: Patch Product
    const patchProd = await request(
      'PATCH',
      `/api/products/${createdId}`,
      {
        notes: 'Updated with official AppleCare+ registration number.',
      },
      token
    );
    assert(patchProd.status === 200 && patchProd.data.product.notes.includes('AppleCare+'), 'PATCH /api/products/:id updates product');

    // Test 9: Get Reminders
    const rems = await request('GET', '/api/reminders', null, token);
    assert(rems.status === 200 && Array.isArray(rems.data.reminders), 'GET /api/reminders computes deadlines');

    // Test 10: Get and Update Settings
    const settings = await request('GET', '/api/settings', null, token);
    assert(settings.status === 200 && settings.data.settings.currency === 'PKR', 'GET /api/settings returns settings');

    const updateSettings = await request('PATCH', '/api/settings', { currency: 'PKR', soundEnabled: false }, token);
    assert(updateSettings.status === 200 && updateSettings.data.settings.soundEnabled === false, 'PATCH /api/settings updates settings');

    // Test 11: Delete Product
    const del = await request('DELETE', `/api/products/${createdId}`, null, token);
    assert(del.status === 200, 'DELETE /api/products/:id removes product');

    console.log(`\n========================================`);
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (e) {
    console.error('Test execution error:', e);
    process.exit(1);
  }
}

runTests();
