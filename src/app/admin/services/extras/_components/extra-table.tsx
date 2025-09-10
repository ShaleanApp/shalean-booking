'use client'

import { ServiceExtra } from '@/types'
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
  DollarSign,
  Star
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ExtraTableProps {
  extras: ServiceExtra[]
  onEdit: (extra: ServiceExtra) => void
  onDelete: (extra: ServiceExtra) => void
  onToggleStatus: (extra: ServiceExtra) => void
  isUpdating: boolean
  isDeleting: boolean
  isToggling: boolean
}

export function ExtraTable({
  extras,
  onEdit,
  onDelete,
  onToggleStatus,
  isUpdating,
  isDeleting,
  isToggling
}: ExtraTableProps) {
  if (extras.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Star className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No service extras yet</h3>
        <p className="text-gray-500 mb-4">
          Get started by creating your first service extra.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {extras.map((extra) => (
        <Card key={extra.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {extra.name}
                  </h3>
                  <Badge 
                    variant={extra.is_active ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {extra.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                {extra.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {extra.description}
                  </p>
                )}
                
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">${extra.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>Add-on Service</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created {new Date(extra.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Order: {extra.sort_order}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleStatus(extra)}
                  disabled={isToggling}
                  className="shrink-0"
                >
                  {extra.is_active ? (
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
                    <DropdownMenuItem onClick={() => onEdit(extra)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(extra)}
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
