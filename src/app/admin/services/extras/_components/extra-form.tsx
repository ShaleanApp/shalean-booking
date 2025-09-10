'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ServiceExtra } from '@/types'
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

const extraSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  price: z.number().min(0, 'Price must be non-negative').max(9999.99, 'Price must be less than $10,000'),
  is_active: z.boolean(),
  sort_order: z.number().min(0, 'Sort order must be non-negative')
})

type ExtraFormData = z.infer<typeof extraSchema>

interface ExtraFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<ServiceExtra, 'id' | 'created_at' | 'updated_at'>) => void
  extra?: ServiceExtra | null
  isSubmitting: boolean
}

export function ExtraForm({
  isOpen,
  onClose,
  onSubmit,
  extra,
  isSubmitting
}: ExtraFormProps) {
  const [isActive, setIsActive] = useState(true)
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<ExtraFormData>({
    resolver: zodResolver(extraSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      is_active: true,
      sort_order: 0
    }
  })

  const watchedIsActive = watch('is_active')

  // Reset form when extra changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (extra) {
        reset({
          name: extra.name,
          description: extra.description || '',
          price: extra.price,
          is_active: extra.is_active,
          sort_order: (extra as any).sort_order || 0
        })
        setIsActive(extra.is_active)
      } else {
        reset({
          name: '',
          description: '',
          price: 0,
          is_active: true,
          sort_order: 0
        })
        setIsActive(true)
      }
    }
  }, [isOpen, extra, reset])

  const handleFormSubmit = (data: ExtraFormData) => {
    const transformedData = {
      ...data,
      description: data.description || null
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
            {extra ? 'Edit Service Extra' : 'Create New Service Extra'}
          </DialogTitle>
          <DialogDescription>
            {extra 
              ? 'Update the service extra information below.'
              : 'Fill in the details to create a new service extra.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Window Cleaning, Deep Oven Cleaning"
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
              placeholder="Brief description of this service extra..."
              rows={3}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                max="9999.99"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
                disabled={isSubmitting}
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
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
            Inactive extras won't be shown to customers
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
              {extra ? 'Update Extra' : 'Create Extra'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
