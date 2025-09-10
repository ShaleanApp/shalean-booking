'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Clock, 
  User, 
  Phone,
  DollarSign,
  FileText,
  Star
} from 'lucide-react'
import { CleanerJob } from '@/hooks/useCleanerJobs'

interface JobDetailsProps {
  job: CleanerJob
}

export function JobDetails({ job }: JobDetailsProps) {
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    on_my_way: { label: 'On My Way', color: 'bg-blue-100 text-blue-800' },
    arrived: { label: 'Arrived', color: 'bg-purple-100 text-purple-800' },
    in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' }
  }

  const config = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.pending

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Job Details</CardTitle>
          <Badge className={config.color}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Information */}
        <div>
          <h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center">
            <User className="h-4 w-4 mr-2" />
            Customer Information
          </h4>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Name:</span> {job.customer_name}
            </p>
            {job.customer_phone && (
              <p className="text-sm flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span className="font-medium">Phone:</span> {job.customer_phone}
              </p>
            )}
          </div>
        </div>

        {/* Service Information */}
        <div>
          <h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Service Information
          </h4>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Date:</span> {new Date(job.service_date).toLocaleDateString()}
            </p>
            <p className="text-sm">
              <span className="font-medium">Time:</span> {job.service_time}
            </p>
            <p className="text-sm">
              <span className="font-medium">Total Price:</span> ₦{job.total_price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Address */}
        <div>
          <h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Service Address
          </h4>
          <div className="text-sm">
            <p>{job.address.street_address}</p>
            <p>{job.address.city}, {job.address.state} {job.address.postal_code}</p>
            <p className="text-gray-500 capitalize">{job.address.address_type}</p>
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-medium text-sm text-gray-900 mb-3">Services</h4>
          <div className="space-y-2">
            {job.services.map((service, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">{service.service_item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {service.quantity}</p>
                </div>
                <p className="text-sm font-medium">
                  ₦{(service.service_item.price * service.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Extras */}
        {job.extras.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-3">Extras</h4>
            <div className="space-y-2">
              {job.extras.map((extra, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">{extra.service_extra.name}</p>
                    <p className="text-xs text-gray-500">{extra.service_extra.description}</p>
                  </div>
                  <p className="text-sm font-medium">
                    ₦{extra.service_extra.price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {job.notes && (
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Special Instructions
            </h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {job.notes}
            </p>
          </div>
        )}

        {/* Review */}
        {job.rating && job.review && (
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Customer Review
            </h4>
            <div className="bg-gray-50 p-3 rounded">
              <div className="flex items-center mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < job.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">{job.rating}/5</span>
              </div>
              <p className="text-sm text-gray-700">{job.review}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
