// Centralized URL configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

// Helper function to get URL with proper fallback
const getUrl = (envVar, devDefault, name) => {
  if (isDevelopment) {
    return process.env[envVar] || devDefault;
  }
  
  const url = process.env[envVar];
  if (!url) {
    console.error(`❌ ${name} (${envVar}) is required in production but not set!`);
    throw new Error(`${envVar} environment variable is required in production`);
  }
  return url;
};

// Export configured URLs
export const urls = {
  frontend: getUrl('FRONTEND_URL', 'http://localhost:5173', 'Frontend URL'),
  backend: getUrl('BACKEND_URL', 'http://localhost:3000', 'Backend URL'),
  client: getUrl('CLIENT_URL', 'http://localhost:5173', 'Client URL'),
};

// Log configuration on startup
export const logUrlConfig = () => {
  console.log('🔗 URL Configuration:');
  console.log(`   Environment: ${isDevelopment ? 'development' : 'production'}`);
  console.log(`   Frontend: ${urls.frontend}`);
  console.log(`   Backend: ${urls.backend}`);
  console.log(`   Client: ${urls.client}`);
};

export default urls;