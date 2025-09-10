"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBooking } from '@/contexts/BookingContext'
import { Address } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Plus, Home, Building, Map, Check } from 'lucide-react'

export function AddressStep() {
  const { state, updateFormData } = useBooking()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(state.formData.address_id)
  const [showNewAddress, setShowNewAddress] = useState(!state.formData.address_id)
  const [loading, setLoading] = useState(true)

  // New address form state
  const [newAddress, setNewAddress] = useState({
    type: 'home' as 'home' | 'office' | 'other',
    name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  })

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false })

          if (error) throw error
          setAddresses(data || [])
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAddresses()
  }, [])

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    setShowNewAddress(false)
    updateFormData({ 
      address_id: addressId,
      new_address: undefined
    })
  }

  const handleNewAddressToggle = () => {
    setShowNewAddress(!showNewAddress)
    if (!showNewAddress) {
      setSelectedAddressId(undefined)
      updateFormData({ 
        address_id: undefined,
        new_address: undefined
      })
    }
  }

  const handleNewAddressChange = (field: string, value: string) => {
    const updated = { ...newAddress, [field]: value }
    setNewAddress(updated)
    updateFormData({ new_address: updated })
  }

  const isNewAddressValid = () => {
    return (
      newAddress.name.trim() !== '' &&
      newAddress.address_line_1.trim() !== '' &&
      newAddress.city.trim() !== '' &&
      newAddress.state.trim() !== '' &&
      newAddress.postal_code.trim() !== ''
    )
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4" />
      case 'office':
        return <Building className="w-4 h-4" />
      default:
        return <Map className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading addresses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Saved Addresses */}
      {addresses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Saved Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAddressId === address.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleAddressSelect(address.id)}
                >
                  <div className="flex items-start gap-3">
                    {getAddressIcon(address.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{address.name}</h4>
                        {address.is_default && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {address.address_line_1}
                        {address.address_line_2 && `, ${address.address_line_2}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Address Option */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {addresses.length > 0 ? 'Add New Address' : 'Service Address'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showNewAddress ? (
            <Button
              variant="outline"
              onClick={handleNewAddressToggle}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {addresses.length > 0 ? 'Add New Address' : 'Enter Address'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address-type">Address Type</Label>
                  <Select
                    value={newAddress.type}
                    onValueChange={(value) => handleNewAddressChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="address-name">Address Name</Label>
                  <Input
                    id="address-name"
                    placeholder="e.g., My Home, Office Building"
                    value={newAddress.name}
                    onChange={(e) => handleNewAddressChange('name', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address-line-1">Street Address</Label>
                <Input
                  id="address-line-1"
                  placeholder="123 Main Street"
                  value={newAddress.address_line_1}
                  onChange={(e) => handleNewAddressChange('address_line_1', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="address-line-2">Address Line 2 (Optional)</Label>
                <Input
                  id="address-line-2"
                  placeholder="Apartment, suite, unit, etc."
                  value={newAddress.address_line_2}
                  onChange={(e) => handleNewAddressChange('address_line_2', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => handleNewAddressChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => handleNewAddressChange('state', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input
                    id="postal-code"
                    placeholder="12345"
                    value={newAddress.postal_code}
                    onChange={(e) => handleNewAddressChange('postal_code', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleNewAddressToggle}
                  className="flex-1"
                >
                  Cancel
                </Button>
                {isNewAddressValid() && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>Address Complete</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Address Summary */}
      {(selectedAddressId || showNewAddress) && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Selected Address</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAddressId ? (
              (() => {
                const address = addresses.find(a => a.id === selectedAddressId)
                return address ? (
                  <div className="flex items-start gap-3">
                    {getAddressIcon(address.type)}
                    <div>
                      <h4 className="font-medium">{address.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {address.address_line_1}
                        {address.address_line_2 && `, ${address.address_line_2}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                    </div>
                  </div>
                ) : null
              })()
            ) : showNewAddress && newAddress.address_line_1 ? (
              <div className="flex items-start gap-3">
                {getAddressIcon(newAddress.type)}
                <div>
                  <h4 className="font-medium">{newAddress.name || 'New Address'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {newAddress.address_line_1}
                    {newAddress.address_line_2 && `, ${newAddress.address_line_2}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {newAddress.city}, {newAddress.state} {newAddress.postal_code}
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
