'use client'

import { ServiceExtra } from '@/types'
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
import { Loader2, AlertTriangle, DollarSign, Star } from 'lucide-react'

interface DeleteExtraDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  extra: ServiceExtra | null
  isDeleting: boolean
}

export function DeleteExtraDialog({
  isOpen,
  onClose,
  onConfirm,
  extra,
  isDeleting
}: DeleteExtraDialogProps) {
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
              <AlertDialogTitle>Delete Service Extra</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete the service extra{' '}
            <span className="font-semibold text-gray-900">
              "{extra?.name}"
            </span>?
          </p>
          
          {extra && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>${extra.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>Add-on Service</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This service extra cannot be deleted if it has associated bookings. 
              You may need to cancel or reassign those bookings first.
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
            Delete Extra
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
