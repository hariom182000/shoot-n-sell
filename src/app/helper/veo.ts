import axios from 'axios';

interface VideoResponse {
  bytesBase64Encoded: string;
  mimeType: string;
}

interface VeoOperationResponse {
  name: string;
  done: boolean;
  response?: {
    '@type': string;
    raiMediaFilteredCount: number;
    videos: VideoResponse[];
  };
  error?: {
    code: number;
    message: string;
  };
}

export const pollVeoOperation = async (operationName: string, accessToken: string): Promise<VeoOperationResponse> => {
  const pollingInterval = 5000; // 5 seconds

  const fetchOperation = async (): Promise<VeoOperationResponse> => {
    try {
      const response = await axios.post<VeoOperationResponse>(
        'https://us-central1-aiplatform.googleapis.com/v1/projects/crack-meridian-463319-a6/locations/us-central1/publishers/google/models/veo-2.0-generate-001:fetchPredictOperation',
        {
          operationName
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching VEO operation:', error);
      throw error;
    }
  };

  const poll = async (): Promise<VeoOperationResponse> => {
    const result = await fetchOperation();
    
    if (result.done || result.error) {
      return result;
    }

    await new Promise(resolve => setTimeout(resolve, pollingInterval));
    return poll();
  };

  return poll();
};

export const isVeoOperationSuccessful = (response: VeoOperationResponse): boolean => {
  return response.done && !!response.response?.videos && response.response.videos.length > 0;
}; 