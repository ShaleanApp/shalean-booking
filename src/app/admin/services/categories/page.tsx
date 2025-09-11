'use client'

import { useState } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { ServiceCategory } from '@/types'
import { CategoryForm } from './_components/category-form'
import { CategoryTable } from './_components/category-table'
import { DeleteCategoryDialog } from './_components/delete-category-dialog'
import { useCategories } from './_hooks/use-categories'

// Export runtime and dynamic for Next.js
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function ServiceCategoriesPage() {
  const { profile, loading } = useProfile()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<ServiceCategory | null>(null)
  
  const { 
    categories, 
    isLoading, 
    error, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    toggleCategoryStatus 
  } = useCategories()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Access denied. Admin privileges required.</p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleCreateCategory = async (data: Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const transformedData = {
        ...data,
        description: data.description || undefined,
        icon: data.icon || undefined
      }
      await createCategory.mutateAsync(transformedData)
      setIsFormOpen(false)
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleUpdateCategory = async (data: Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingCategory) return
    
    try {
      const transformedData = {
        ...data,
        description: data.description || undefined,
        icon: data.icon || undefined
      }
      await updateCategory.mutateAsync({ id: editingCategory.id, data: transformedData })
      setEditingCategory(null)
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return
    
    try {
      await deleteCategory.mutateAsync(deletingCategory.id)
      setDeletingCategory(null)
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleToggleStatus = async (category: ServiceCategory) => {
    try {
      await toggleCategoryStatus.mutateAsync({
        id: category.id,
        is_active: !category.is_active
      })
    } catch (error) {
      console.error('Error toggling category status:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Service Categories</h1>
          <p className="mt-2 text-gray-600">
            Manage service categories for your cleaning services
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {categories?.length || 0} categories
            </Badge>
            {categories && (
              <Badge variant="outline" className="text-sm">
                {categories.filter(c => c.is_active).length} active
              </Badge>
            )}
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading categories...
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">Error loading categories</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <CategoryTable
                categories={categories || []}
                onEdit={setEditingCategory}
                onDelete={setDeletingCategory}
                onToggleStatus={handleToggleStatus}
                isUpdating={updateCategory.isPending}
                isDeleting={deleteCategory.isPending}
                isToggling={toggleCategoryStatus.isPending}
              />
            )}
          </CardContent>
        </Card>

        {/* Forms and Dialogs */}
        <CategoryForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreateCategory}
          isSubmitting={createCategory.isPending}
        />

        <CategoryForm
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          onSubmit={handleUpdateCategory}
          category={editingCategory}
          isSubmitting={updateCategory.isPending}
        />

        <DeleteCategoryDialog
          isOpen={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          onConfirm={handleDeleteCategory}
          category={deletingCategory}
          isDeleting={deleteCategory.isPending}
        />
      </div>
    </div>
  )
}
