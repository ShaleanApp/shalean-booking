'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Home, 
  Building, 
  Map,
  Check
} from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { Address } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const addressSchema = z.object({
  type: z.enum(['home', 'office', 'other']),
  name: z.string().min(1, 'Address name is required'),
  address_line_1: z.string().min(1, 'Address line 1 is required'),
  address_line_2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  is_default: z.boolean().optional()
})

type AddressFormData = z.infer<typeof addressSchema>

export function AddressManagement() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useProfile()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema)
  })

  const addressType = watch('type')

  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user])

  const fetchAddresses = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching addresses:', error)
        return
      }

      setAddresses(data || [])
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: AddressFormData) => {
    if (!user) return

    try {
      setIsSubmitting(true)

      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAddress.id)

        if (error) {
          console.error('Error updating address:', error)
          return
        }
      } else {
        // Create new address
        const { error } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            ...data
          })

        if (error) {
          console.error('Error creating address:', error)
          return
        }
      }

      // If this is set as default, unset other defaults
      if (data.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', editingAddress?.id || '')
      }

      await fetchAddresses()
      reset()
      setIsEditing(false)
      setEditingAddress(null)
    } catch (error) {
      console.error('Error saving address:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setValue('type', address.type)
    setValue('name', address.name)
    setValue('address_line_1', address.address_line_1)
    setValue('address_line_2', address.address_line_2 || '')
    setValue('city', address.city)
    setValue('state', address.state)
    setValue('postal_code', address.postal_code)
    setValue('country', address.country)
    setValue('is_default', address.is_default)
    setIsEditing(true)
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)

      if (error) {
        console.error('Error deleting address:', error)
        return
      }

      await fetchAddresses()
    } catch (error) {
      console.error('Error deleting address:', error)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      // Unset all other defaults
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user?.id || '')

      // Set this one as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)

      if (error) {
        console.error('Error setting default address:', error)
        return
      }

      await fetchAddresses()
    } catch (error) {
      console.error('Error setting default address:', error)
    }
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-5 w-5" />
      case 'office':
        return <Building className="h-5 w-5" />
      default:
        return <Map className="h-5 w-5" />
    }
  }

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case 'home':
        return 'bg-green-100 text-green-800'
      case 'office':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your addresses...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Address Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Address Type</Label>
                  <Select value={addressType} onValueChange={(value) => setValue('type', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select address type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Address Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., My Home, Office Building"
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line_1">Address Line 1</Label>
                <Input
                  id="address_line_1"
                  {...register('address_line_1')}
                  placeholder="Street address, building number"
                />
                {errors.address_line_1 && <p className="text-sm text-red-600">{errors.address_line_1.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
                <Input
                  id="address_line_2"
                  {...register('address_line_2')}
                  placeholder="Apartment, suite, unit, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="City"
                  />
                  {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...register('state')}
                    placeholder="State"
                  />
                  {errors.state && <p className="text-sm text-red-600">{errors.state.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    {...register('postal_code')}
                    placeholder="Postal code"
                  />
                  {errors.postal_code && <p className="text-sm text-red-600">{errors.postal_code.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register('country')}
                  placeholder="Country"
                  defaultValue="Nigeria"
                />
                {errors.country && <p className="text-sm text-red-600">{errors.country.message}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_default"
                  {...register('is_default')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_default">Set as default address</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditingAddress(null)
                    reset()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Addresses List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Saved Addresses
            </CardTitle>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
              <p className="text-gray-600 mb-4">
                Add your first address to make booking easier.
              </p>
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {getAddressIcon(address.type)}
                          <span className="font-medium">{address.name}</span>
                        </div>
                        <Badge className={getAddressTypeColor(address.type)}>
                          {address.type.toUpperCase()}
                        </Badge>
                        {address.is_default && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            DEFAULT
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>{address.address_line_1}</div>
                        {address.address_line_2 && <div>{address.address_line_2}</div>}
                        <div>
                          {address.city}, {address.state} {address.postal_code}
                        </div>
                        <div>{address.country}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!address.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(address)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
