import api from './api'

export interface Digest {
  id: string
  title: string
  searchQuery: string
  frequency: string
  audioLength: number
  timezone: string
  preferredHour: number
  isActive: boolean
  nextGenerationAt: string
  lastGeneratedAt?: string
  deliveries?: DigestDelivery[]
  _count?: { deliveries: number }
}

export interface DigestDelivery {
  id: string
  digestId: string
  audioUrl: string
  transcript: string
  delivered: boolean
  deliveredAt?: string
  createdAt: string
}

export interface CreateDigestDto {
  title: string
  searchQuery: string
  frequency: string
  audioLength: number
  timezone: string
  preferredHour: number
  useDefaultEmail: boolean
}

class DigestService {
  async getDigests(): Promise<Digest[]> {
    const { data } = await api.get<Digest[]>('/digests')
    return data
  }

  async getDigest(id: string): Promise<Digest> {
    const { data } = await api.get<Digest>(`/digests/${id}`)
    return data
  }

  async createDigest(digest: CreateDigestDto): Promise<Digest> {
    const { data } = await api.post<Digest>('/digests', digest)
    return data
  }

  async updateDigest(id: string, updates: Partial<Digest>): Promise<Digest> {
    const { data } = await api.put<Digest>(`/digests/${id}`, updates)
    return data
  }

  async deleteDigest(id: string): Promise<void> {
    await api.delete(`/digests/${id}`)
  }

  async generateDigest(id: string): Promise<{ message: string; audioUrl: string; deliveryId: string }> {
    // No timeout for generation - let it take as long as needed
    const { data } = await api.post(`/digests/${id}/generate`, {}, {
      timeout: 0 // Unlimited timeout for development
    })
    return data
  }
}

export default new DigestService()