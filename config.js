/**
 * Braze WebSDK Configuration
 *
 * Replace the placeholder values below with your actual Braze API Key
 * and SDK Endpoint before deploying to Vercel.
 *
 * IMPORTANT: Never commit a real API key to a public repository.
 * For production, load these values from environment variables:
 *   - BRAZE_API_KEY  → window.BrazeConfig.apiKey
 *   - BRAZE_ENDPOINT → window.BrazeConfig.endpoint
 *
 * @see https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=web
 */
window.BrazeConfig = {
  /**
   * Your Braze Web SDK API Key.
   * Found in: Braze Dashboard → Settings → API Keys
   * Example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
   * @type {string}
   */
  apiKey: '566e95da-966f-4e29-82c0-9c494be0dc8f',

  /**
   * Your Braze SDK endpoint URL.
   * Found in: Braze Dashboard → Settings → SDK Endpoint
   * Example: "sdk.iad-01.braze.com"
   * @type {string}
   */
  endpoint: 'sdk.iad-03.braze.com'
};
