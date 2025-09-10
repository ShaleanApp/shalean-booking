import { createClient } from '@/lib/supabase/client'
import type { Database, Profile, ServiceCategory, ServiceItem, ServiceExtra, Booking, Address, Payment } from '@/types'

// Client-side database utility functions
export class DatabaseClientService {
  private static getClient() {
    return createClient()
  }

  // Profile operations
  static async getProfile(userId: string): Promise<Profile | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    
    return data
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating profile:', error)
      return null
    }
    
    return data
  }

  // Service operations
  static async getServiceCategories(): Promise<ServiceCategory[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (error) {
      console.error('Error fetching service categories:', error)
      return []
    }
    
    return data || []
  }

  static async getServiceItems(categoryId?: string): Promise<ServiceItem[]> {
    const supabase = this.getClient()
    let query = supabase
      .from('service_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching service items:', error)
      return []
    }
    
    return data || []
  }

  static async getServiceExtras(): Promise<ServiceExtra[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('service_extras')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (error) {
      console.error('Error fetching service extras:', error)
      return []
    }
    
    return data || []
  }

  // Address operations
  static async getUserAddresses(userId: string): Promise<Address[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching addresses:', error)
      return []
    }
    
    return data || []
  }

  static async createAddress(userId: string, address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Address | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...address, user_id: userId })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating address:', error)
      return null
    }
    
    return data
  }

  static async updateAddress(addressId: string, updates: Partial<Address>): Promise<Address | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', addressId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating address:', error)
      return null
    }
    
    return data
  }

  static async deleteAddress(addressId: string): Promise<boolean> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
    
    if (error) {
      console.error('Error deleting address:', error)
      return false
    }
    
    return true
  }

  // Booking operations
  static async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating booking:', error)
      return null
    }
    
    return data
  }

  static async getUserBookings(userId: string): Promise<Booking[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_id', userId)
      .order('service_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching bookings:', error)
      return []
    }
    
    return data || []
  }

  static async getCleanerBookings(cleanerId: string): Promise<Booking[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('cleaner_id', cleanerId)
      .order('service_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching cleaner bookings:', error)
      return []
    }
    
    return data || []
  }

  static async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<boolean> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
    
    if (error) {
      console.error('Error updating booking status:', error)
      return false
    }
    
    return true
  }

  // Payment operations
  static async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating payment:', error)
      return null
    }
    
    return data
  }

  static async updatePaymentStatus(paymentId: string, status: Payment['status'], transactionId?: string): Promise<boolean> {
    const supabase = this.getClient()
    const updates: Partial<Payment> = { status }
    if (transactionId) {
      updates.transaction_id = transactionId
    }
    
    const { error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
    
    if (error) {
      console.error('Error updating payment status:', error)
      return false
    }
    
    return true
  }
}
