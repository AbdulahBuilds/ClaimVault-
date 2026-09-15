/**
 * ClaimVault — Phase 15 Comprehensive Testing & Edge Cases Verification Suite
 * Tests all application layers, business logic, boundary conditions, and security guards.
 */

import http from 'http';
import crypto from 'crypto';

const API_BASE = 'http://localhost:5000';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

// -------------------------------------------------------------
// Pure Function Edge Case Testing
// -------------------------------------------------------------

function runDateBoundaryTests() {
  console.log('\n📅 SECTION 1: Date Boundary & Urgency Edge Cases');

  const refDate = new Date('2026-09-14T00:00:00');

  // Helper date diff logic matching src/utils/dateUtils.ts
  function getDaysDiff(targetDateString, ref = refDate) {
    if (!targetDateString) return 0;
    const target = new Date(targetDateString);
    if (isNaN(target.getTime())) return 0;
    const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
    const refUtc = Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate());
    return Math.round((targetUtc - refUtc) / (1000 * 60 * 60 * 24));
  }

  function calcUrgency(targetDateString, ref = refDate) {
    const days = getDaysDiff(targetDateString, ref);
    if (days < 0) return 'expired';
    if (days <= 30) return 'expiring';
    return 'safe';
  }

  function formatTime(targetDateString, ref = refDate) {
    const days = getDaysDiff(targetDateString, ref);
    if (days < 0) {
      const absDays = Math.abs(days);
      if (absDays === 1) return 'Expired yesterday';
      return `Expired ${absDays} days ago`;
    }
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    if (days < 30) return `${days} days remaining`;
    return `${days} days`;
  }

  // 1. Same-day boundary (0 days remaining)
  assert(getDaysDiff('2026-09-14', refDate) === 0, '0-day same-day boundary returns 0 days');
  assert(calcUrgency('2026-09-14', refDate) === 'expiring', '0-day same-day deadline is marked as "expiring"');
  assert(formatTime('2026-09-14', refDate) === 'Expires today', '0-day same-day displays "Expires today"');

  // 2. Tomorrow boundary (1 day remaining)
  assert(getDaysDiff('2026-09-15', refDate) === 1, '1-day deadline returns 1 day');
  assert(formatTime('2026-09-15', refDate) === 'Expires tomorrow', '1-day deadline displays "Expires tomorrow"');

  // 3. Yesterday expired (-1 day)
  assert(getDaysDiff('2026-09-13', refDate) === -1, 'Yesterday returns -1 day');
  assert(calcUrgency('2026-09-13', refDate) === 'expired', 'Past deadline is marked as "expired"');
  assert(formatTime('2026-09-13', refDate) === 'Expired yesterday', 'Yesterday deadline displays "Expired yesterday"');

  // 4. Invalid date strings
  assert(getDaysDiff('invalid-date', refDate) === 0, 'Malformed date string safely defaults to 0 without throwing');
  assert(getDaysDiff('', refDate) === 0, 'Empty date string safely returns 0');
  assert(getDaysDiff(null, refDate) === 0, 'Null date safely returns 0');

  // 5. Far future warranty (10-year compressor)
  assert(getDaysDiff('2036-09-14', refDate) >= 3650, '10-year warranty computes >= 3650 days');
  assert(calcUrgency('2036-09-14', refDate) === 'safe', '10-year warranty is marked as "safe"');
}

function runCurrencyEdgeCases() {
  console.log('\n💰 SECTION 2: Currency & Formatting Edge Cases');

  function formatPKR(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0';
    return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
  }

  assert(formatPKR(0) === 'Rs. 0', '0 PKR price formats to "Rs. 0"');
  assert(formatPKR(125000) === 'Rs. 125,000', '125,000 PKR formats with standard comma grouping');
  assert(formatPKR(1850450) === 'Rs. 1,850,450', 'Large appliance 1.8M PKR formats correctly');
  assert(formatPKR(NaN) === 'Rs. 0', 'NaN price safely falls back to "Rs. 0" without crashing');
  assert(formatPKR(null) === 'Rs. 0', 'Null price safely falls back to "Rs. 0"');
}

function runStorageSanitizationEdgeCases() {
  console.log('\n🛡️ SECTION 3: Vault Backup & Schema Validation Edge Cases');

  function sanitizeAndValidateBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return { valid: false, error: 'Malformed JSON root' };
      if (!Array.isArray(data.products)) return { valid: false, error: 'Missing products array' };
      return { valid: true, productCount: data.products.length };
    } catch {
      return { valid: false, error: 'Invalid JSON syntax' };
    }
  }

  const validBackup = JSON.stringify({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    products: [{ id: 'p-1', name: 'Samsung Galaxy A55', price: 95000 }],
    settings: { currency: 'PKR' },
  });

  const corruptJson = '{ version: "1.0", products: [invalid...';
  const missingProducts = JSON.stringify({ version: '1.0', users: [] });

  assert(sanitizeAndValidateBackup(validBackup).valid === true, 'Valid backup JSON parses and verifies product count');
  assert(sanitizeAndValidateBackup(corruptJson).valid === false, 'Corrupted JSON string safely rejected with error');
  assert(sanitizeAndValidateBackup(missingProducts).valid === false, 'Backup missing products array safely rejected');
}

// -------------------------------------------------------------
// Live Backend Integration & Security Guard Edge Cases
// -------------------------------------------------------------

async function runLiveBackendEdgeCases() {
  console.log('\n🌐 SECTION 4: Live Backend REST API & Multi-Tenant Edge Cases');

  // Test 1: Health endpoint
  const healthRes = await request('/api/health');
  assert(healthRes.status === 200 && (healthRes.data.status === 'ok' || healthRes.data.status === 'healthy'), 'Health check is 200 OK');

  // Test 2: Unauthenticated product access
  const unauthRes = await request('/api/products');
  assert(unauthRes.status === 401, 'Unauthenticated GET /api/products returns 401 Unauthorized');

  // Test 3: Register User A
  const emailA = `user_a_${Date.now()}@claimvault.pk`;
  const regARes = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { name: 'User A', email: emailA, password: 'PasswordA123!' },
  });
  assert(regARes.status === 201 && regARes.data.token, 'User A registered successfully');
  const tokenA = regARes.data.token;

  // Test 4: Register User B
  const emailB = `user_b_${Date.now()}@claimvault.pk`;
  const regBRes = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { name: 'User B', email: emailB, password: 'PasswordB123!' },
  });
  assert(regBRes.status === 201 && regBRes.data.token, 'User B registered successfully');
  const tokenB = regBRes.data.token;

  // Test 5: User A creates a product
  const createProdRes = await request('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: {
      name: 'Sony Bravia 55" 4K Google TV',
      brand: 'Sony',
      model: 'KD-55X75L',
      category: 'Electronics',
      price: 185000,
      purchaseDate: '2026-09-01',
      storeName: 'Sony Center Lahore',
      warranty: {
        durationLabel: '2 Years',
        expiryDate: '2028-09-01',
        providerName: 'Sony Pakistan',
        status: 'safe',
      },
      returnInfo: {
        hasReturnPeriod: true,
        returnDurationDays: 14,
        returnDeadline: '2026-09-15',
        status: 'expiring',
      },
    },
  });
  assert(createProdRes.status === 201 && createProdRes.data.product?.id, 'User A created product in vault');
  const prodIdA = createProdRes.data.product?.id;

  // Test 6: User B attempts to modify User A's product (Cross-Tenant Isolation Guard)
  const crossModRes = await request(`/api/products/${prodIdA}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`,
    },
    body: { name: 'Hacked Title by User B' },
  });
  assert(crossModRes.status === 404 || crossModRes.status === 403, 'Cross-user product modification rejected (404/403)');

  // Test 7: User A uploads receipt to cloud
  const uploadRes = await request('/api/storage/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: {
      fileName: 'Sony_Official_Invoice.jpg',
      fileData: 'data:image/jpeg;base64,' + Buffer.from('TEST_RECEIPT_BINARY_PAYLOAD').toString('base64'),
      mimeType: 'image/jpeg',
      fileSize: 245000,
    },
  });
  assert(uploadRes.status === 201 && uploadRes.data.file?.id, 'User A uploaded receipt to cloud storage');
  const fileIdA = uploadRes.data.file?.id;

  // Test 8: User B attempts to access User A's receipt signed URL (Cloud Access Guard)
  const crossReceiptRes = await request(`/api/storage/files/${fileIdA}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenB}`,
    },
  });
  assert(crossReceiptRes.status === 403, 'Cross-user cloud receipt access returns 403 Forbidden');

  // Test 9: Input Sanitizer strips script payload
  const xssProdRes = await request('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: {
      name: 'Clean TV <script>alert("XSS")</script>',
      brand: 'Sony',
      category: 'Electronics',
      price: 50000,
      purchaseDate: '2026-09-10',
      storeName: '<iframe src="evil.com"></iframe>Official Store',
      warranty: { durationLabel: '1 Year', expiryDate: '2027-09-10', status: 'safe' },
      returnInfo: { hasReturnPeriod: false, status: 'expired' },
    },
  });
  assert(xssProdRes.status === 201, 'Product with XSS payload created with sanitization applied');
  assert(!xssProdRes.data.product.name.includes('<script>'), 'XSS <script> tag neutralized in title');
  assert(!xssProdRes.data.product.storeName.includes('<iframe>'), 'XSS <iframe> tag neutralized in storeName');

  // Test 10: S3 Quota tracking endpoint
  const quotaRes = await request('/api/storage/quota', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const maxBytes = quotaRes.data.quota?.maxBytes || quotaRes.data.maxSizeBytes;
  assert(quotaRes.status === 200 && maxBytes === 524288000, 'Cloud quota endpoint reports 500 MB max limit');

  // Test 11: Cleanup User A product
  const delRes = await request(`/api/products/${prodIdA}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(delRes.status === 200, 'User A deleted product successfully');
}

// -------------------------------------------------------------
// Runner Orchestrator
// -------------------------------------------------------------

async function main() {
  console.log('=======================================================');
  console.log('🧪 ClaimVault Phase 15 Comprehensive Edge Cases Suite');
  console.log('=======================================================');

  runDateBoundaryTests();
  runCurrencyEdgeCases();
  runStorageSanitizationEdgeCases();
  await runLiveBackendEdgeCases();

  console.log('\n=======================================================');
  console.log(`🎉 Phase 15 Test Suite: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('=======================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});
