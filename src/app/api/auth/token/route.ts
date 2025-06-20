import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Set Node.js options for OpenSSL 3.0 compatibility
process.env.NODE_OPTIONS = '--openssl-legacy-provider';

export async function GET() {
  try {
    // Get and validate environment variables
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_PROJECT_ID;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !projectId || !privateKey) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    // Clean up private key - handle both JSON escaped and regular format
    privateKey = privateKey
      .replace(/\\n/g, '\n')
      .replace(/^"(.*)"$/, '$1'); // Remove surrounding quotes if present

    // Create a JWT client using the service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
        project_id: projectId,
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    // Get an access token
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    if (!token || !token.token) {
      console.error('No token received from auth client');
      return NextResponse.json(
        { error: 'Failed to generate access token' },
        { status: 500 }
      );
    }

    // Return the access token
    return NextResponse.json({ accessToken: token.token });
  } catch (error) {
    console.error('Error generating access token:', error);
    // Log additional details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to generate access token' },
      { status: 500 }
    );
  }
}