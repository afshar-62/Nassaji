import { apiClient } from './client';

export interface AiConsultResponse {
  reply: string;
  provider: string;
}

export const aiService = {
  async consult(prompt: string): Promise<AiConsultResponse> {
    return apiClient<AiConsultResponse>('/ai/consult', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },
};
