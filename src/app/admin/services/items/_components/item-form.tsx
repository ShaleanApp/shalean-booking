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
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit must be less than 20 characters'),
  is_quantity_based: z.boolean(),
  min_quantity: z.number().min(1, 'Minimum quantity must be at least 1'),
  max_quantity: z.number().min(1, 'Maximum quantity must be at least 1'),
  is_active: z.boolean()
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
      unit: 'hour',
      is_quantity_based: false,
      min_quantity: 1,
      max_quantity: 10,
      is_active: true
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
          unit: item.unit,
          is_quantity_based: item.is_quantity_based,
          min_quantity: item.min_quantity,
          max_quantity: item.max_quantity,
          is_active: item.is_active
        })
        setIsActive(item.is_active)
      } else {
        reset({
          category_id: '',
          name: '',
          description: '',
          base_price: 0,
          unit: 'hour',
          is_quantity_based: false,
          min_quantity: 1,
          max_quantity: 10,
          is_active: true
        })
        setIsActive(true)
      }
    }
  }, [isOpen, item, reset])

  const handleFormSubmit = (data: ItemFormData) => {
    onSubmit({
      ...data,
      description: data.description || null
    })
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
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                {...register('unit')}
                placeholder="e.g., hour, room, sq ft"
                disabled={isSubmitting}
              />
              {errors.unit && (
                <p className="text-sm text-red-600">{errors.unit.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_quantity_based"
                  checked={watch('is_quantity_based')}
                  onCheckedChange={(checked) => setValue('is_quantity_based', checked, { shouldDirty: true })}
                  disabled={isSubmitting}
                />
                <Label htmlFor="is_quantity_based">
                  Quantity-based pricing
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                Enable if customers can select different quantities
              </p>
            </div>

            {watch('is_quantity_based') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_quantity">Minimum Quantity</Label>
                  <Input
                    id="min_quantity"
                    type="number"
                    min="1"
                    {...register('min_quantity', { valueAsNumber: true })}
                    placeholder="1"
                    disabled={isSubmitting}
                  />
                  {errors.min_quantity && (
                    <p className="text-sm text-red-600">{errors.min_quantity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_quantity">Maximum Quantity</Label>
                  <Input
                    id="max_quantity"
                    type="number"
                    min="1"
                    {...register('max_quantity', { valueAsNumber: true })}
                    placeholder="10"
                    disabled={isSubmitting}
                  />
                  {errors.max_quantity && (
                    <p className="text-sm text-red-600">{errors.max_quantity.message}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
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
