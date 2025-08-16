import api from './api'

export interface Conversation {
  id: string
  title: string
  userId: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  audioUrl?: string
  audioDuration?: number
  metadata?: any
  createdAt: string
}

class ConversationService {
  // Get all conversations for the current user
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await api.get<Conversation[]>('/conversations')
      return response.data
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  }

  // Get a single conversation with messages
  async getConversation(id: string): Promise<Conversation> {
    try {
      const response = await api.get<Conversation>(`/conversations/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching conversation:', error)
      throw error
    }
  }

  // Create a new conversation
  async createConversation(title: string): Promise<Conversation> {
    try {
      const response = await api.post<Conversation>('/conversations', { title })
      return response.data
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }

  // Update conversation title
  async updateConversation(id: string, title: string): Promise<Conversation> {
    try {
      const response = await api.patch<Conversation>(`/conversations/${id}`, { title })
      return response.data
    } catch (error) {
      console.error('Error updating conversation:', error)
      throw error
    }
  }

  // Delete a conversation
  async deleteConversation(id: string): Promise<void> {
    try {
      await api.delete(`/conversations/${id}`)
    } catch (error) {
      console.error('Error deleting conversation:', error)
      throw error
    }
  }

  // Add a message to a conversation
  async addMessage(
    conversationId: string,
    content: string,
    role: 'user' | 'assistant' = 'user'
  ): Promise<Message> {
    try {
      const response = await api.post<Message>(
        `/conversations/${conversationId}/messages`,
        { content, role }
      )
      return response.data
    } catch (error) {
      console.error('Error adding message:', error)
      throw error
    }
  }

  // Get messages for a conversation (with pagination)
  async getMessages(
    conversationId: string,
    limit = 50,
    cursor?: string
  ): Promise<{ messages: Message[]; hasMore: boolean; nextCursor: string | null }> {
    try {
      const params: any = { limit }
      if (cursor) params.cursor = cursor

      const response = await api.get<{ messages: Message[]; hasMore: boolean; nextCursor: string | null }>(
        `/conversations/${conversationId}/messages`,
        { params }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
  }

  // Update a message (for adding audio URL after generation)
  async updateMessage(
    conversationId: string,
    messageId: string,
    updates: {
      audioUrl?: string
      audioDuration?: number
      metadata?: any
    }
  ): Promise<Message> {
    try {
      const response = await api.patch<Message>(
        `/conversations/${conversationId}/messages/${messageId}`,
        updates
      )
      return response.data
    } catch (error) {
      console.error('Error updating message:', error)
      throw error
    }
  }
}

export default new ConversationService()