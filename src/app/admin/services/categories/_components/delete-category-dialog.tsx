'use client'

import { ServiceCategory } from '@/types'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, AlertTriangle } from 'lucide-react'

interface DeleteCategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  category: ServiceCategory | null
  isDeleting: boolean
}

export function DeleteCategoryDialog({
  isOpen,
  onClose,
  onConfirm,
  category,
  isDeleting
}: DeleteCategoryDialogProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  const handleClose = () => {
    if (!isDeleting) {
      onClose()
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-3">
            Are you sure you want to delete the category{' '}
            <span className="font-semibold text-gray-900">
              "{category?.name}"
            </span>?
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This category cannot be deleted if it has associated service items. 
              You may need to delete or reassign those items first.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Delete Category
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
