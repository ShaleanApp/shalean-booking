import { useState, useEffect } from 'react'
import { ServiceItem } from '@/types'

interface CreateItemData {
  category_id: string
  name: string
  description?: string
  base_price: number
  duration_minutes: number
  is_active?: boolean
  sort_order?: number
}

interface UpdateItemData {
  id: string
  data: Partial<CreateItemData>
}

interface ToggleStatusData {
  id: string
  is_active: boolean
}

interface ApiResponse<T> {
  data?: T
  error?: string
}

interface ItemsResponse {
  items: ServiceItem[]
}

interface ItemResponse {
  item: ServiceItem
}

export function useItems() {
  const [items, setItems] = useState<ServiceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch items
  const fetchItems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/services/items')
      const result: ApiResponse<ItemsResponse> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch items')
      }
      
      setItems(result.data?.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching items:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Create item
  const createItem = {
    isPending: false,
    mutateAsync: async (data: CreateItemData): Promise<ServiceItem> => {
      const response = await fetch('/api/services/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result: ApiResponse<ItemResponse> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create item')
      }
      
      const newItem = result.data?.item
      if (newItem) {
        setItems(prev => [newItem, ...prev])
      }
      
      return newItem!
    }
  }

  // Update item
  const updateItem = {
    isPending: false,
    mutateAsync: async ({ id, data }: UpdateItemData): Promise<ServiceItem> => {
      const response = await fetch(`/api/services/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result: ApiResponse<ItemResponse> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update item')
      }
      
      const updatedItem = result.data?.item
      if (updatedItem) {
        setItems(prev => 
          prev.map(item => item.id === id ? updatedItem : item)
        )
      }
      
      return updatedItem!
    }
  }

  // Delete item
  const deleteItem = {
    isPending: false,
    mutateAsync: async (id: string): Promise<void> => {
      const response = await fetch(`/api/services/items/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const result: ApiResponse<{ message: string }> = await response.json()
        throw new Error(result.error || 'Failed to delete item')
      }
      
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  // Toggle item status
  const toggleItemStatus = {
    isPending: false,
    mutateAsync: async ({ id, is_active }: ToggleStatusData): Promise<ServiceItem> => {
      const response = await fetch(`/api/services/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active }),
      })
      
      const result: ApiResponse<ItemResponse> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update item status')
      }
      
      const updatedItem = result.data?.item
      if (updatedItem) {
        setItems(prev => 
          prev.map(item => item.id === id ? updatedItem : item)
        )
      }
      
      return updatedItem!
    }
  }

  // Load items on mount
  useEffect(() => {
    fetchItems()
  }, [])

  return {
    items,
    isLoading,
    error,
    refetch: fetchItems,
    createItem,
    updateItem,
    deleteItem,
    toggleItemStatus,
  }
}
