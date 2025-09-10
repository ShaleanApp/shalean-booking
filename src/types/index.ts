// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'customer' | 'cleaner' | 'admin'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'cleaner' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'cleaner' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      service_items: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          base_price: number
          unit: string
          is_quantity_based: boolean
          min_quantity: number
          max_quantity: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          base_price: number
          unit?: string
          is_quantity_based?: boolean
          min_quantity?: number
          max_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          base_price?: number
          unit?: string
          is_quantity_based?: boolean
          min_quantity?: number
          max_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      service_extras: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          customer_id: string
          cleaner_id: string | null
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          service_date: string
          service_time: string
          duration_hours: number
          total_price: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          cleaner_id?: string | null
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          service_date: string
          service_time: string
          duration_hours: number
          total_price: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          cleaner_id?: string | null
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          service_date?: string
          service_time?: string
          duration_hours?: number
          total_price?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      booking_services: {
        Row: {
          id: string
          booking_id: string
          service_item_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          service_item_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          service_item_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      booking_extras: {
        Row: {
          id: string
          booking_id: string
          service_extra_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          service_extra_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          service_extra_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          type: 'home' | 'office' | 'other'
          name: string
          address_line_1: string
          address_line_2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'home' | 'office' | 'other'
          name: string
          address_line_1: string
          address_line_2?: string | null
          city: string
          state: string
          postal_code: string
          country: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'home' | 'office' | 'other'
          name?: string
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method: string
          transaction_id: string | null
          paystack_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method: string
          transaction_id?: string | null
          paystack_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: string
          transaction_id?: string | null
          paystack_reference?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Application Types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
export type ServiceItem = Database['public']['Tables']['service_items']['Row']
export type ServiceExtra = Database['public']['Tables']['service_extras']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingService = Database['public']['Tables']['booking_services']['Row']
export type BookingExtra = Database['public']['Tables']['booking_extras']['Row']
export type Address = Database['public']['Tables']['addresses']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']

// Extended types with relationships
export interface BookingWithDetails extends Booking {
  customer: Profile
  cleaner?: Profile
  services: (BookingService & { service_item: ServiceItem })[]
  extras: (BookingExtra & { service_extra: ServiceExtra })[]
  address: Address
  payment?: Payment
}

export interface ServiceItemWithCategory extends ServiceItem {
  category: ServiceCategory
}

// Form types
export interface BookingFormData {
  services: {
    service_item_id: string
    quantity: number
  }[]
  extras: {
    service_extra_id: string
    quantity: number
  }[]
  service_date: string
  service_time: string
  address_id?: string
  new_address?: {
    type: 'home' | 'office' | 'other'
    name: string
    address_line_1: string
    address_line_2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  notes?: string
  frequency?: 'once' | 'weekly' | 'biweekly' | 'monthly'
  selected_days?: string[]
}

// User roles
export type UserRole = 'customer' | 'cleaner' | 'admin'

// Booking status
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

// Payment status
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
