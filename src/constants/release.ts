/**
 * ClaimVault Production Release Metadata & Legal Information
 */

export const RELEASE_INFO = {
  appName: 'ClaimVault',
  appTagline: 'Never lose track of what you bought.',
  version: '1.0.0',
  buildNumber: 100,
  releaseDate: '2026-09-15',
  packageId: 'com.claimvault.app',
  developer: 'ClaimVault Engineering Team',
  supportEmail: 'support@claimvault.pk',
  website: 'https://claimvault.pk',
  storageQuotaMb: 500,
  encryptionStandard: 'AES-256 Cloud Vault Encryption',
  consumerRightsJurisdiction: 'Pakistan Consumer Protection Acts (Punjab, Sindh, KPK, Islamabad)',
};

export const PRIVACY_POLICY_SUMMARY = `
# ClaimVault Privacy Policy (v1.0.0)

Last Updated: September 15, 2026

## 1. What Information We Collect
- **Product Information**: Names, brands, models, purchase dates, prices, and warranties you add.
- **Receipts & Documents**: Photos and scans of official purchase receipts stored securely in your private vault.
- **User Credentials**: Encrypted password hashes, email address, and notification preferences.

## 2. How We Protect Your Data
- **AES-256 Encryption**: All cloud receipt attachments are stored in an isolated, encrypted namespace.
- **Zero-Trust Multi-Tenancy**: Only you have access to your private purchase vault. Cross-user access is blocked at the API level.
- **No Third-Party Ad Tracking**: ClaimVault will never sell or rent your personal receipt data to advertisers or retailers.

## 3. Data Ownership & Vault Zeroization
You own 100% of your data. You can export your complete vault to JSON at any time or trigger full Zeroization to permanently delete all records.
`;

export const TERMS_OF_SERVICE_SUMMARY = `
# ClaimVault Terms of Service (v1.0.0)

Last Updated: September 15, 2026

## 1. Independent Service
ClaimVault is a personal purchase and warranty management tool. ClaimVault operates independently and does not require manufacturer participation to store and organize records.

## 2. Warranty Claims & Deadlines
ClaimVault calculates reminders based on the dates and durations you provide. Users should verify official manufacturer terms when filing claims.

## 3. AI Receipt Extraction
AI OCR features are provided for convenience to accelerate data entry. Extracted fields should always be reviewed before saving.
`;
