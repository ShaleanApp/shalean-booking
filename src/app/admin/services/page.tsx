'use client'

import { useProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Tag, 
  Star, 
  ArrowLeft,
  BarChart3,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import { useCategories } from './categories/_hooks/use-categories'
import { useItems } from './items/_hooks/use-items'
import { useExtras } from './extras/_hooks/use-extras'

export default function ServiceManagementPage() {
  const { profile, loading } = useProfile()
  const { categories, isLoading: categoriesLoading } = useCategories()
  const { items, isLoading: itemsLoading } = useItems()
  const { extras, isLoading: extrasLoading } = useExtras()

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

  const activeCategories = categories?.filter(c => c.is_active).length || 0
  const activeItems = items?.filter(i => i.is_active).length || 0
  const activeExtras = extras?.filter(e => e.is_active).length || 0

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
          <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your cleaning service categories, items, and extras
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Categories</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {activeCategories} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Items</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {activeItems} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Extras</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{extras?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {activeExtras} active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Categories
                </CardTitle>
                <Badge variant="outline">
                  {categories?.length || 0} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Organize your services into categories like "Residential Cleaning" or "Commercial Services".
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/admin/services/categories">
                    <Eye className="h-4 w-4 mr-2" />
                    Manage Categories
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/services/categories">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Category
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Service Items
                </CardTitle>
                <Badge variant="outline">
                  {items?.length || 0} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Define specific services with pricing and duration. Each item belongs to a category.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/admin/services/items">
                    <Eye className="h-4 w-4 mr-2" />
                    Manage Items
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/services/items">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Item
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Extras */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Service Extras
                </CardTitle>
                <Badge variant="outline">
                  {extras?.length || 0} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Add optional services and upgrades that customers can select with their bookings.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/admin/services/extras">
                    <Eye className="h-4 w-4 mr-2" />
                    Manage Extras
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/services/extras">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Extra
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/admin/services/categories">
                  <Tag className="h-6 w-6 mb-2" />
                  <span className="font-medium">Categories</span>
                  <span className="text-xs text-gray-500">Manage service categories</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/admin/services/items">
                  <Settings className="h-6 w-6 mb-2" />
                  <span className="font-medium">Items</span>
                  <span className="text-xs text-gray-500">Manage service items</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/admin/services/extras">
                  <Star className="h-6 w-6 mb-2" />
                  <span className="font-medium">Extras</span>
                  <span className="text-xs text-gray-500">Manage service extras</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/admin">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="font-medium">Analytics</span>
                  <span className="text-xs text-gray-500">View service analytics</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
