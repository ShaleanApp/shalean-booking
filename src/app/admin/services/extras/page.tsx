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
  ArrowLeft,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { ServiceExtra } from '@/types'
import { ExtraForm } from './_components/extra-form'
import { ExtraTable } from './_components/extra-table'
import { DeleteExtraDialog } from './_components/delete-extra-dialog'
import { useExtras } from './_hooks/use-extras'

export default function ServiceExtrasPage() {
  const { profile, loading } = useProfile()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExtra, setEditingExtra] = useState<ServiceExtra | null>(null)
  const [deletingExtra, setDeletingExtra] = useState<ServiceExtra | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { 
    extras, 
    isLoading, 
    error, 
    createExtra, 
    updateExtra, 
    deleteExtra,
    toggleExtraStatus 
  } = useExtras()

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

  const handleCreateExtra = async (data: Omit<ServiceExtra, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createExtra.mutateAsync({
        ...data,
        description: data.description || undefined
      })
      setIsFormOpen(false)
    } catch (error) {
      console.error('Error creating extra:', error)
    }
  }

  const handleUpdateExtra = async (data: Omit<ServiceExtra, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingExtra) return
    
    try {
      await updateExtra.mutateAsync({ 
        id: editingExtra.id, 
        data: {
          ...data,
          description: data.description || undefined
        }
      })
      setEditingExtra(null)
    } catch (error) {
      console.error('Error updating extra:', error)
    }
  }

  const handleDeleteExtra = async () => {
    if (!deletingExtra) return
    
    try {
      await deleteExtra.mutateAsync(deletingExtra.id)
      setDeletingExtra(null)
    } catch (error) {
      console.error('Error deleting extra:', error)
    }
  }

  const handleToggleStatus = async (extra: ServiceExtra) => {
    try {
      await toggleExtraStatus.mutateAsync({
        id: extra.id,
        is_active: !extra.is_active
      })
    } catch (error) {
      console.error('Error toggling extra status:', error)
    }
  }

  // Filter extras based on search
  const filteredExtras = extras?.filter(extra => {
    const matchesSearch = extra.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         extra.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
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
          <h1 className="text-3xl font-bold text-gray-900">Service Extras</h1>
          <p className="mt-2 text-gray-600">
            Manage additional services and add-ons for your cleaning services
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
                  placeholder="Search extras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Extra
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {filteredExtras.length} extras
            </Badge>
            {extras && (
              <Badge variant="outline" className="text-sm">
                {extras.filter(e => e.is_active).length} active
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>All Service Extras</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading extras...
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">Error loading extras</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <ExtraTable
                extras={filteredExtras}
                onEdit={setEditingExtra}
                onDelete={setDeletingExtra}
                onToggleStatus={handleToggleStatus}
                isUpdating={updateExtra.isPending}
                isDeleting={deleteExtra.isPending}
                isToggling={toggleExtraStatus.isPending}
              />
            )}
          </CardContent>
        </Card>

        {/* Forms and Dialogs */}
        <ExtraForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreateExtra}
          isSubmitting={createExtra.isPending}
        />

        <ExtraForm
          isOpen={!!editingExtra}
          onClose={() => setEditingExtra(null)}
          onSubmit={handleUpdateExtra}
          extra={editingExtra}
          isSubmitting={updateExtra.isPending}
        />

        <DeleteExtraDialog
          isOpen={!!deletingExtra}
          onClose={() => setDeletingExtra(null)}
          onConfirm={handleDeleteExtra}
          extra={deletingExtra}
          isDeleting={deleteExtra.isPending}
        />
      </div>
    </div>
  )
}
