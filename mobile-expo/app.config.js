const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

function loadEnvIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override: false, quiet: true });
  }
}

loadEnvIfExists(path.resolve(__dirname, '.env'));
loadEnvIfExists(path.resolve(__dirname, '../.env'));

module.exports = ({ config }) => {
  const apiUrlRaw =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.VITE_API_URL ||
    config?.extra?.apiUrl ||
    'https://pompiers-connect.vercel.app';
  const apiUrl = String(apiUrlRaw).trim().replace(/\/$/, '');

  const isLocalhostApi =
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(apiUrl);
  if (process.env.EAS_BUILD === 'true' && isLocalhostApi) {
    throw new Error(
      `Invalid EXPO_PUBLIC_API_URL for EAS build: ${apiUrl}. ` +
      'Use a public HTTPS URL (or LAN IP for local device tests), not localhost.',
    );
  }

  const apiPrefix =
    process.env.EXPO_PUBLIC_API_PREFIX ||
    process.env.VITE_API_PREFIX ||
    config?.extra?.apiPrefix ||
    '';

  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      apiUrl,
      apiPrefix,
      eas: {
        ...(config.extra?.eas || {}),
      },
    },
  };
};
