'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ServiceCategory } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  icon: z.string().max(50, 'Icon must be less than 50 characters').optional(),
  is_active: z.boolean(),
  sort_order: z.number().min(0, 'Sort order must be non-negative')
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>) => void
  category?: ServiceCategory | null
  isSubmitting: boolean
}

export function CategoryForm({
  isOpen,
  onClose,
  onSubmit,
  category,
  isSubmitting
}: CategoryFormProps) {
  const [isActive, setIsActive] = useState(true)
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      is_active: true,
      sort_order: 0
    }
  })

  const watchedIsActive = watch('is_active')

  // Reset form when category changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          description: category.description || '',
          icon: category.icon || '',
          is_active: category.is_active,
          sort_order: category.sort_order
        })
        setIsActive(category.is_active)
      } else {
        reset({
          name: '',
          description: '',
          icon: '',
          is_active: true,
          sort_order: 0
        })
        setIsActive(true)
      }
    }
  }, [isOpen, category, reset])

  const handleFormSubmit = (data: CategoryFormData) => {
    const transformedData = {
      ...data,
      description: data.description || null,
      icon: data.icon || null
    }
    onSubmit(transformedData)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
          <DialogDescription>
            {category 
              ? 'Update the category information below.'
              : 'Fill in the details to create a new service category.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Residential Cleaning"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of this category..."
              rows={3}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              {...register('icon')}
              placeholder="e.g., home, office, car"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Icon name or identifier (optional)
            </p>
            {errors.icon && (
              <p className="text-sm text-red-600">{errors.icon.message}</p>
            )}
          </div>

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
            Inactive categories won't be shown to customers
          </p>

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
              {category ? 'Update Category' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
