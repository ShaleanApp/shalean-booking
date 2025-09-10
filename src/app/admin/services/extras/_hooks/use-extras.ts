import { useState, useEffect } from 'react'
import { ServiceExtra } from '@/types'

interface CreateExtraData {
  name: string
  description?: string
  price: number
  is_active?: boolean
  sort_order?: number
}

interface UpdateExtraData {
  id: string
  data: Partial<CreateExtraData>
}

interface ToggleStatusData {
  id: string
  is_active: boolean
}

interface ApiResponse<T> {
  data?: T
  error?: string
}

interface ExtrasResponse {
  extras: ServiceExtra[]
}

interface ExtraResponse {
  extra: ServiceExtra
}

export function useExtras() {
  const [extras, setExtras] = useState<ServiceExtra[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch extras
  const fetchExtras = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/services/extras')
      const result: ApiResponse<ExtrasResponse> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch extras')
      }
      
      setExtras(result.data?.extras || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching extras:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Create extra
  const createExtra = {
    isPending: false,
    mutateAsync: async (data: CreateExtraData): Promise<ServiceExtra> => {
      const response = await fetch('/api/services/extras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result: ApiResponse<ExtraResponse> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create extra')
      }
      
      const newExtra = result.data?.extra
      if (newExtra) {
        setExtras(prev => [newExtra, ...prev])
      }
      
      return newExtra!
    }
  }

  // Update extra
  const updateExtra = {
    isPending: false,
    mutateAsync: async ({ id, data }: UpdateExtraData): Promise<ServiceExtra> => {
      const response = await fetch(`/api/services/extras/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result: ApiResponse<ExtraResponse> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update extra')
      }
      
      const updatedExtra = result.data?.extra
      if (updatedExtra) {
        setExtras(prev => 
          prev.map(extra => extra.id === id ? updatedExtra : extra)
        )
      }
      
      return updatedExtra!
    }
  }

  // Delete extra
  const deleteExtra = {
    isPending: false,
    mutateAsync: async (id: string): Promise<void> => {
      const response = await fetch(`/api/services/extras/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const result: ApiResponse<{ message: string }> = await response.json()
        throw new Error(result.error || 'Failed to delete extra')
      }
      
      setExtras(prev => prev.filter(extra => extra.id !== id))
    }
  }

  // Toggle extra status
  const toggleExtraStatus = {
    isPending: false,
    mutateAsync: async ({ id, is_active }: ToggleStatusData): Promise<ServiceExtra> => {
      const response = await fetch(`/api/services/extras/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active }),
      })
      
      const result: ApiResponse<ExtraResponse> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update extra status')
      }
      
      const updatedExtra = result.data?.extra
      if (updatedExtra) {
        setExtras(prev => 
          prev.map(extra => extra.id === id ? updatedExtra : extra)
        )
      }
      
      return updatedExtra!
    }
  }

  // Load extras on mount
  useEffect(() => {
    fetchExtras()
  }, [])

  return {
    extras,
    isLoading,
    error,
    refetch: fetchExtras,
    createExtra,
    updateExtra,
    deleteExtra,
    toggleExtraStatus,
  }
}
