'use client'

import { ServiceItem } from '@/types'
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
  Clock,
  DollarSign,
  Tag
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ItemTableProps {
  items: ServiceItem[]
  onEdit: (item: ServiceItem) => void
  onDelete: (item: ServiceItem) => void
  onToggleStatus: (item: ServiceItem) => void
  isUpdating: boolean
  isDeleting: boolean
  isToggling: boolean
}

export function ItemTable({
  items,
  onEdit,
  onDelete,
  onToggleStatus,
  isUpdating,
  isDeleting,
  isToggling
}: ItemTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Tag className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No service items yet</h3>
        <p className="text-gray-500 mb-4">
          Get started by creating your first service item.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {item.name}
                  </h3>
                  <Badge 
                    variant={item.is_active ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                {item.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
                
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">${item.base_price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span>Unit: {item.unit}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Quantity: {item.min_quantity}-{item.max_quantity}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Quantity-based: {item.is_quantity_based ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleStatus(item)}
                  disabled={isToggling}
                  className="shrink-0"
                >
                  {item.is_active ? (
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
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(item)}
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
