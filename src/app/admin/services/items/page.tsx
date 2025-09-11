'use client'

import { useState } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search,
  Filter,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { ServiceItem, ServiceCategory } from '@/types'
import { ItemForm } from './_components/item-form'
import { ItemTable } from './_components/item-table'
import { DeleteItemDialog } from './_components/delete-item-dialog'
import { useItems } from './_hooks/use-items'
import { useCategories } from '../categories/_hooks/use-categories'

export default function ServiceItemsPage() {
  const { profile, loading } = useProfile()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<ServiceItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const { 
    items, 
    isLoading, 
    error, 
    createItem, 
    updateItem, 
    deleteItem,
    toggleItemStatus 
  } = useItems()

  const { categories } = useCategories()

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

  const handleCreateItem = async (data: Omit<ServiceItem, 'id' | 'created_at' | 'updated_at' | 'category'> & { description?: string | undefined }) => {
    try {
      await createItem.mutateAsync({
        ...data,
        description: data.description || undefined
      })
      setIsFormOpen(false)
    } catch (error) {
      console.error('Error creating item:', error)
    }
  }

  const handleUpdateItem = async (data: Omit<ServiceItem, 'id' | 'created_at' | 'updated_at' | 'category'> & { description?: string | undefined }) => {
    if (!editingItem) return
    
    try {
      await updateItem.mutateAsync({ 
        id: editingItem.id, 
        data: {
          ...data,
          description: data.description || undefined
        }
      })
      setEditingItem(null)
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const handleDeleteItem = async () => {
    if (!deletingItem) return
    
    try {
      await deleteItem.mutateAsync(deletingItem.id)
      setDeletingItem(null)
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleToggleStatus = async (item: ServiceItem) => {
    try {
      await toggleItemStatus.mutateAsync({
        id: item.id,
        is_active: !item.is_active
      })
    } catch (error) {
      console.error('Error toggling item status:', error)
    }
  }

  // Filter items based on search and category
  const filteredItems = items?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory
    return matchesSearch && matchesCategory
  }) || []

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
          <h1 className="text-3xl font-bold text-gray-900">Service Items</h1>
          <p className="mt-2 text-gray-600">
            Manage individual service items and their pricing
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Categories</option>
                  {categories?.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Item
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {filteredItems.length} items
            </Badge>
            {items && (
              <Badge variant="outline" className="text-sm">
                {items.filter(i => i.is_active).length} active
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="outline" className="text-sm">
                {categories?.find(c => c.id === selectedCategory)?.name} category
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>All Service Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading items...
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">Error loading items</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <ItemTable
                items={filteredItems}
                onEdit={setEditingItem}
                onDelete={setDeletingItem}
                onToggleStatus={handleToggleStatus}
                isUpdating={updateItem.isPending}
                isDeleting={deleteItem.isPending}
                isToggling={toggleItemStatus.isPending}
              />
            )}
          </CardContent>
        </Card>

        {/* Forms and Dialogs */}
        <ItemForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreateItem}
          categories={categories || []}
          isSubmitting={createItem.isPending}
        />

        <ItemForm
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={handleUpdateItem}
          item={editingItem}
          categories={categories || []}
          isSubmitting={updateItem.isPending}
        />

        <DeleteItemDialog
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDeleteItem}
          item={deletingItem}
          isDeleting={deleteItem.isPending}
        />
      </div>
    </div>
  )
}
