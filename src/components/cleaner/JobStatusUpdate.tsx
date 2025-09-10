'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  User,
  Loader2
} from 'lucide-react'
import { CleanerJob } from '@/hooks/useCleanerJobs'

interface JobStatusUpdateProps {
  job: CleanerJob
  onStatusUpdate: (jobId: string, newStatus: string) => Promise<boolean>
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    nextStatus: 'on_my_way',
    nextLabel: 'On My Way'
  },
  on_my_way: {
    label: 'On My Way',
    color: 'bg-blue-100 text-blue-800',
    icon: MapPin,
    nextStatus: 'arrived',
    nextLabel: 'Mark as Arrived'
  },
  arrived: {
    label: 'Arrived',
    color: 'bg-purple-100 text-purple-800',
    icon: User,
    nextStatus: 'in_progress',
    nextLabel: 'Start Cleaning'
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-orange-100 text-orange-800',
    icon: Clock,
    nextStatus: 'completed',
    nextLabel: 'Mark as Completed'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    nextStatus: null,
    nextLabel: null
  }
}

export function JobStatusUpdate({ job, onStatusUpdate }: JobStatusUpdateProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const config = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.pending

  const handleStatusUpdate = async () => {
    if (!config.nextStatus) return

    setIsUpdating(true)
    try {
      const success = await onStatusUpdate(job.id, config.nextStatus)
      if (!success) {
        // Handle error - you might want to show a toast notification
        console.error('Failed to update job status')
      }
    } catch (error) {
      console.error('Error updating job status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const Icon = config.icon

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 text-gray-500" />
        <div>
          <p className="font-medium">{job.services[0]?.service_item.name || 'Cleaning Service'}</p>
          <p className="text-sm text-gray-500">
            {new Date(job.service_date).toLocaleDateString()} at {job.service_time}
          </p>
          <p className="text-sm text-gray-500">
            {job.address.street_address}, {job.address.city}
          </p>
          <p className="text-sm text-gray-500">
            Customer: {job.customer_name}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Badge className={config.color}>
          {config.label}
        </Badge>
        {config.nextStatus && (
          <Button
            onClick={handleStatusUpdate}
            disabled={isUpdating}
            size="sm"
            className="whitespace-nowrap"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              config.nextLabel
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
