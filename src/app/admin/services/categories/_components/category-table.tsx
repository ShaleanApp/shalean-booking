'use client'

import { ServiceCategory } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  MoreHorizontal,
  Calendar,
  Hash
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CategoryTableProps {
  categories: ServiceCategory[]
  onEdit: (category: ServiceCategory) => void
  onDelete: (category: ServiceCategory) => void
  onToggleStatus: (category: ServiceCategory) => void
  isUpdating: boolean
  isDeleting: boolean
  isToggling: boolean
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  onToggleStatus,
  isUpdating,
  isDeleting,
  isToggling
}: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Hash className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
        <p className="text-gray-500 mb-4">
          Get started by creating your first service category.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {category.name}
                  </h3>
                  <Badge 
                    variant={category.is_active ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {category.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                {category.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created {new Date(category.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Order: {category.sort_order}
                  </div>
                  {category.icon && (
                    <div className="flex items-center gap-1">
                      <span>Icon: {category.icon}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleStatus(category)}
                  disabled={isToggling}
                  className="shrink-0"
                >
                  {category.is_active ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(category)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(category)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
