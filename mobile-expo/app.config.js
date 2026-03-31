const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

function loadEnvIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override: false });
  }
}

loadEnvIfExists(path.resolve(__dirname, '.env'));
loadEnvIfExists(path.resolve(__dirname, '../.env'));

module.exports = ({ config }) => {
  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.VITE_API_URL ||
    config?.extra?.apiUrl ||
    'http://localhost:4000';

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
