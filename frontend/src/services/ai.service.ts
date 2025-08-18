import api from './api'

// AI response from backend
export interface AIResponse {
  content: string
  messageId: string
  audioUrl: string | null
  usedSearchTool: boolean
}

class AIService {
  // Send message to AI and get response (with optional audio)
  async sendMessage(conversationId: string, message: string): Promise<AIResponse> {
    const response = await api.post<AIResponse>(
      '/ai/message',
      { conversationId, message },
      { timeout: 0 } // Unlimited timeout for development
    )
    return response.data
  }
}

export default new AIService()