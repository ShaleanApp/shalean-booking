import { useState, useEffect } from 'react'
import { ServiceCategory } from '@/types'

interface CreateCategoryData {
  name: string
  description?: string
  icon?: string
  is_active?: boolean
  sort_order?: number
}

interface UpdateCategoryData {
  id: string
  data: Partial<CreateCategoryData>
}

interface ToggleStatusData {
  id: string
  is_active: boolean
}

interface ApiResponse<T> {
  data?: T
  error?: string
}

interface CategoriesResponse {
  categories: ServiceCategory[]
}

interface CategoryResponse {
  category: ServiceCategory
}

export function useCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/services/categories')
      const result: ApiResponse<CategoriesResponse> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch categories')
      }
      
      setCategories(result.data?.categories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching categories:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Create category
  const createCategory = {
    isPending: false,
    mutateAsync: async (data: CreateCategoryData): Promise<ServiceCategory> => {
      const response = await fetch('/api/services/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result: ApiResponse<CategoryResponse> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create category')
      }
      
      const newCategory = result.data?.category
      if (newCategory) {
        setCategories(prev => [newCategory, ...prev])
      }
      
      return newCategory!
    }
  }

  // Update category
  const updateCategory = {
    isPending: false,
    mutateAsync: async ({ id, data }: UpdateCategoryData): Promise<ServiceCategory> => {
      const response = await fetch(`/api/services/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result: ApiResponse<CategoryResponse> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update category')
      }
      
      const updatedCategory = result.data?.category
      if (updatedCategory) {
        setCategories(prev => 
          prev.map(cat => cat.id === id ? updatedCategory : cat)
        )
      }
      
      return updatedCategory!
    }
  }

  // Delete category
  const deleteCategory = {
    isPending: false,
    mutateAsync: async (id: string): Promise<void> => {
      const response = await fetch(`/api/services/categories/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const result: ApiResponse<{ message: string }> = await response.json()
        throw new Error(result.error || 'Failed to delete category')
      }
      
      setCategories(prev => prev.filter(cat => cat.id !== id))
    }
  }

  // Toggle category status
  const toggleCategoryStatus = {
    isPending: false,
    mutateAsync: async ({ id, is_active }: ToggleStatusData): Promise<ServiceCategory> => {
      const response = await fetch(`/api/services/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active }),
      })
      
      const result: ApiResponse<CategoryResponse> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update category status')
      }
      
      const updatedCategory = result.data?.category
      if (updatedCategory) {
        setCategories(prev => 
          prev.map(cat => cat.id === id ? updatedCategory : cat)
        )
      }
      
      return updatedCategory!
    }
  }

  // Load categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
  }
}
