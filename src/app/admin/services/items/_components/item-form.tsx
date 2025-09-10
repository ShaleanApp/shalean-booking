'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ServiceItem, ServiceCategory } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

const itemSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  base_price: z.number().min(0, 'Price must be non-negative').max(9999.99, 'Price must be less than $10,000'),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').max(1440, 'Duration must be less than 24 hours'),
  is_active: z.boolean().default(true),
  sort_order: z.number().min(0, 'Sort order must be non-negative').default(0)
})

type ItemFormData = z.infer<typeof itemSchema>

interface ItemFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<ServiceItem, 'id' | 'created_at' | 'updated_at' | 'category'>) => void
  item?: ServiceItem | null
  categories: ServiceCategory[]
  isSubmitting: boolean
}

export function ItemForm({
  isOpen,
  onClose,
  onSubmit,
  item,
  categories,
  isSubmitting
}: ItemFormProps) {
  const [isActive, setIsActive] = useState(true)
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      category_id: '',
      name: '',
      description: '',
      base_price: 0,
      duration_minutes: 60,
      is_active: true,
      sort_order: 0
    }
  })

  const watchedIsActive = watch('is_active')
  const watchedCategoryId = watch('category_id')

  // Reset form when item changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          category_id: item.category_id,
          name: item.name,
          description: item.description || '',
          base_price: item.base_price,
          duration_minutes: item.duration_minutes,
          is_active: item.is_active,
          sort_order: item.sort_order
        })
        setIsActive(item.is_active)
      } else {
        reset({
          category_id: '',
          name: '',
          description: '',
          base_price: 0,
          duration_minutes: 60,
          is_active: true,
          sort_order: 0
        })
        setIsActive(true)
      }
    }
  }, [isOpen, item, reset])

  const handleFormSubmit = (data: ItemFormData) => {
    onSubmit(data)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Service Item' : 'Create New Service Item'}
          </DialogTitle>
          <DialogDescription>
            {item 
              ? 'Update the service item information below.'
              : 'Fill in the details to create a new service item.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Category *</Label>
              <Select
                value={watchedCategoryId}
                onValueChange={(value) => setValue('category_id', value, { shouldDirty: true })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-red-600">{errors.category_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Deep Cleaning"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of this service item..."
              rows={3}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_price">Base Price ($) *</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                min="0"
                max="9999.99"
                {...register('base_price', { valueAsNumber: true })}
                placeholder="0.00"
                disabled={isSubmitting}
              />
              {errors.base_price && (
                <p className="text-sm text-red-600">{errors.base_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
              <Input
                id="duration_minutes"
                type="number"
                min="1"
                max="1440"
                {...register('duration_minutes', { valueAsNumber: true })}
                placeholder="60"
                disabled={isSubmitting}
              />
              {errors.duration_minutes && (
                <p className="text-sm text-red-600">{errors.duration_minutes.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                {...register('sort_order', { valueAsNumber: true })}
                placeholder="0"
                min="0"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                Lower numbers appear first in lists
              </p>
              {errors.sort_order && (
                <p className="text-sm text-red-600">{errors.sort_order.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="is_active"
                  checked={watchedIsActive}
                  onCheckedChange={(checked) => {
                    setValue('is_active', checked, { shouldDirty: true })
                    setIsActive(checked)
                  }}
                  disabled={isSubmitting}
                />
                <Label htmlFor="is_active">
                  Active
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                Inactive items won't be shown to customers
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {item ? 'Update Item' : 'Create Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
