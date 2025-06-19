import axios from 'axios';

interface TokenResponse {
  accessToken: string;
}

/**
 * Fetches an OAuth2 access token from the backend
 * @returns {Promise<string>} The access token
 * @throws {Error} If token retrieval fails
 */
export async function getAccessToken(): Promise<string> {
  try {
    const response = await axios.get<TokenResponse>('/api/auth/token');
    return response.data.accessToken;
  } catch (error) {
    console.error('Failed to get access token:', error);
    throw new Error('Failed to get access token');
  }
}

/**
 * Checks if the current access token is valid
 * @param token The access token to check
 * @returns {Promise<boolean>} Whether the token is valid
 */
export async function isTokenValid(token: string): Promise<boolean> {
  try {
    // Make a test request to validate the token
    await axios.get('https://www.googleapis.com/oauth2/v1/tokeninfo', {
      params: { access_token: token }
    });
    return true;
  } catch (error) {
    return false;
  }
} 