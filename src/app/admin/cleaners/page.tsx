'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle,
  XCircle,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  User,
  Calendar
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { createSupabaseBrowser } from '@/lib/supabase/browser'
import { Profile, BookingWithDetails } from '@/types'

interface CleanerStats {
  total_jobs: number
  completed_jobs: number
  average_rating: number
  total_earnings: number
}

export default function AdminCleanersPage() {
  const { profile, loading } = useProfile()
  const [cleaners, setCleaners] = useState<(Profile & { stats?: CleanerStats })[]>([])
  const [filteredCleaners, setFilteredCleaners] = useState<(Profile & { stats?: CleanerStats })[]>([])
  const [loadingCleaners, setLoadingCleaners] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [selectedCleaner, setSelectedCleaner] = useState<(Profile & { stats?: CleanerStats }) | null>(null)
  const [cleanerProfileOpen, setCleanerProfileOpen] = useState(false)
  const [cleanerJobs, setCleanerJobs] = useState<BookingWithDetails[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)

  const supabase = createSupabaseBrowser()

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchCleaners()
    }
  }, [profile])

  useEffect(() => {
    filterCleaners()
  }, [cleaners, searchTerm, statusFilter, ratingFilter])

  const fetchCleaners = async () => {
    try {
      setLoadingCleaners(true)
      
      // Fetch cleaners with their stats
      const { data: cleanersData, error: cleanersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'cleaner')
        .order('created_at', { ascending: false })

      if (cleanersError) throw cleanersError

      // Fetch stats for each cleaner
      const cleanersWithStats = await Promise.all(
        (cleanersData || []).map(async (cleaner) => {
          const stats = await getCleanerStats(cleaner.id)
          return { ...cleaner, stats }
        })
      )

      setCleaners(cleanersWithStats)
    } catch (error) {
      console.error('Error fetching cleaners:', error)
    } finally {
      setLoadingCleaners(false)
    }
  }

  const getCleanerStats = async (cleanerId: string): Promise<CleanerStats> => {
    try {
      // Get total jobs
      const { count: totalJobs } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('cleaner_id', cleanerId)

      // Get completed jobs
      const { count: completedJobs } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('cleaner_id', cleanerId)
        .eq('status', 'completed')

      // Get average rating (placeholder - would need a ratings table)
      const averageRating = 4.5 // This would come from a ratings table

      // Get total earnings
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .in('booking_id', 
          (await supabase
            .from('bookings')
            .select('id')
            .eq('cleaner_id', cleanerId)
            .eq('status', 'completed')
          ).data?.map(b => b.id) || []
        )

      const totalEarnings = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      return {
        total_jobs: totalJobs || 0,
        completed_jobs: completedJobs || 0,
        average_rating: averageRating,
        total_earnings: totalEarnings
      }
    } catch (error) {
      console.error('Error fetching cleaner stats:', error)
      return {
        total_jobs: 0,
        completed_jobs: 0,
        average_rating: 0,
        total_earnings: 0
      }
    }
  }

  const filterCleaners = () => {
    let filtered = cleaners

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cleaner => 
        cleaner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cleaner.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter (active/inactive based on some criteria)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cleaner => {
        // For now, we'll use a simple active/inactive based on recent activity
        const isActive = cleaner.stats?.total_jobs && cleaner.stats.total_jobs > 0
        return statusFilter === 'active' ? isActive : !isActive
      })
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(cleaner => {
        const rating = cleaner.stats?.average_rating || 0
        switch (ratingFilter) {
          case 'excellent':
            return rating >= 4.5
          case 'good':
            return rating >= 3.5 && rating < 4.5
          case 'average':
            return rating >= 2.5 && rating < 3.5
          case 'poor':
            return rating < 2.5
          default:
            return true
        }
      })
    }

    setFilteredCleaners(filtered)
  }

  const toggleCleanerStatus = async (cleanerId: string, isActive: boolean) => {
    try {
      // This would update a status field in the profiles table
      // For now, we'll just update the local state
      setCleaners(prev => 
        prev.map(cleaner => 
          cleaner.id === cleanerId 
            ? { ...cleaner, is_active: isActive }
            : cleaner
        )
      )
    } catch (error) {
      console.error('Error updating cleaner status:', error)
    }
  }

  const assignJob = async (cleanerId: string, bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ cleaner_id: cleanerId })
        .eq('id', bookingId)

      if (error) throw error

      // Refresh cleaners to update stats
      fetchCleaners()
    } catch (error) {
      console.error('Error assigning job:', error)
    }
  }

  const openCleanerProfile = async (cleaner: Profile & { stats?: CleanerStats }) => {
    setSelectedCleaner(cleaner)
    setCleanerProfileOpen(true)
    await fetchCleanerJobs(cleaner.id)
  }

  const fetchCleanerJobs = async (cleanerId: string) => {
    try {
      setLoadingJobs(true)
      
      const { data: jobsData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:profiles!bookings_customer_id_fkey(*),
          address:addresses(*),
          payment:payments(*),
          services:booking_services(
            *,
            service_item:service_items(*)
          ),
          extras:booking_extras(
            *,
            service_extra:service_extras(*)
          )
        `)
        .eq('cleaner_id', cleanerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCleanerJobs(jobsData || [])
    } catch (error) {
      console.error('Error fetching cleaner jobs:', error)
    } finally {
      setLoadingJobs(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cleaners Management</h1>
          <p className="mt-2 text-gray-600">
            Manage cleaner accounts, monitor performance, and assign jobs
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search cleaners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="excellent">4.5+ Stars</SelectItem>
                  <SelectItem value="good">3.5-4.4 Stars</SelectItem>
                  <SelectItem value="average">2.5-3.4 Stars</SelectItem>
                  <SelectItem value="poor">Below 2.5 Stars</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={fetchCleaners} variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cleaners List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingCleaners ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredCleaners.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No cleaners found</h3>
                  <p className="text-gray-500">Try adjusting your filters or check back later.</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredCleaners.map((cleaner) => (
              <Card key={cleaner.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cleaner.full_name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-500">{cleaner.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={true}
                        onCheckedChange={(checked) => toggleCleanerStatus(cleaner.id, checked)}
                      />
                      <Badge variant="default">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {cleaner.stats?.total_jobs || 0}
                      </p>
                      <p className="text-xs text-gray-500">Total Jobs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {cleaner.stats?.completed_jobs || 0}
                      </p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center space-x-1">
                    {renderStars(cleaner.stats?.average_rating || 0)}
                    <span className="ml-2 text-sm text-gray-600">
                      ({cleaner.stats?.average_rating?.toFixed(1) || '0.0'})
                    </span>
                  </div>

                  {/* Earnings */}
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(cleaner.stats?.total_earnings || 0)}
                    </p>
                    <p className="text-xs text-gray-500">Total Earnings</p>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    {cleaner.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{cleaner.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>Joined {formatDate(cleaner.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign Job
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openCleanerProfile(cleaner)}>
                          <User className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => toggleCleanerStatus(cleaner.id, false)}
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Cleaner Profile Modal */}
        <Dialog open={cleanerProfileOpen} onOpenChange={setCleanerProfileOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedCleaner?.full_name}</h2>
                  <p className="text-sm text-gray-500">{selectedCleaner?.email}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {selectedCleaner && (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedCleaner.stats?.total_jobs || 0}
                    </p>
                    <p className="text-sm text-gray-500">Total Jobs</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedCleaner.stats?.completed_jobs || 0}
                    </p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      {renderStars(selectedCleaner.stats?.average_rating || 0)}
                    </div>
                    <p className="text-sm text-gray-500">Average Rating</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedCleaner.stats?.total_earnings || 0)}
                    </p>
                    <p className="text-sm text-gray-500">Total Earnings</p>
                  </div>
                </div>

                {/* Job History */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Job History</h3>
                  {loadingJobs ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : cleanerJobs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No jobs assigned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cleanerJobs.map((job) => (
                        <div key={job.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium">Booking #{job.id.slice(-8)}</h4>
                              <Badge className={getStatusColor(job.status)}>
                                {job.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {formatDate(job.service_date)} at {job.service_time}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">Customer</p>
                              <p className="text-gray-600">{job.customer?.full_name || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Location</p>
                              <p className="text-gray-600">{job.address?.name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Amount</p>
                              <p className="text-gray-600">{formatCurrency(job.total_price || 0)}</p>
                            </div>
                          </div>
                          {job.notes && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                <strong>Notes:</strong> {job.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
