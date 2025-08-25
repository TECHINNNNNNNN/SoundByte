/**
 * Google Cloud Platform Credentials Configuration
 * 
 * This module handles GCP credentials for both local development and production deployment.
 * - Local: Uses service account JSON file via GOOGLE_APPLICATION_CREDENTIALS env var
 * - Production (Vercel/AWS): Uses individual environment variables
 */

/**
 * Get Google Cloud credentials configuration
 * @returns {Object} Credentials configuration object for GCP client libraries
 */
export const getGCPCredentials = () => {
  // Production: Use individual environment variables (Vercel, AWS, etc.)
  if (process.env.GCP_PRIVATE_KEY) {
    console.log('Using GCP credentials from environment variables')
    return {
      credentials: {
        client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle escaped newlines
      },
      projectId: process.env.GCP_PROJECT_ID,
    }
  }
  
  // Local development: Use service account JSON file
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('Using GCP credentials from service account file')
    // Return empty object - the GCP client will automatically use GOOGLE_APPLICATION_CREDENTIALS
    return {}
  }
  
  // Fallback: Try Application Default Credentials (e.g., when running on Google Cloud)
  console.log('Using Application Default Credentials')
  return {}
}

/**
 * Validate that required GCP credentials are available
 * @throws {Error} If credentials are not properly configured
 */
export const validateGCPCredentials = () => {
  const hasEnvVars = process.env.GCP_PRIVATE_KEY && 
                     process.env.GCP_SERVICE_ACCOUNT_EMAIL && 
                     process.env.GCP_PROJECT_ID
  
  const hasCredFile = process.env.GOOGLE_APPLICATION_CREDENTIALS
  
  if (!hasEnvVars && !hasCredFile) {
    throw new Error(
      'Google Cloud credentials not configured. ' +
      'Either set GCP_* environment variables or GOOGLE_APPLICATION_CREDENTIALS'
    )
  }
  
  return true
}