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
  this_month_jobs: number
  this_month_earnings: number
}

interface CleanerWithStats extends Profile {
  stats: CleanerStats
  is_online: boolean
  last_seen: string
  is_active: boolean
}

interface CleanersClientProps {
  data?: CleanerWithStats[] | null
}

export default function CleanersClient({ data: initialData }: CleanersClientProps) {
  const { profile, loading } = useProfile()
  const [cleaners, setCleaners] = useState<CleanerWithStats[]>(initialData || [])
  const [filteredCleaners, setFilteredCleaners] = useState<CleanerWithStats[]>(initialData || [])
  const [loadingCleaners, setLoadingCleaners] = useState(!initialData)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [stats, setStats] = useState({
    totalCleaners: 0,
    activeCleaners: 0,
    onlineCleaners: 0,
    averageRating: 0
  })

  useEffect(() => {
    if (profile?.role === 'admin' && !initialData) {
      fetchCleaners()
    }
  }, [profile, initialData])

  useEffect(() => {
    filterCleaners()
  }, [cleaners, searchTerm, statusFilter, ratingFilter])

  const fetchCleaners = async () => {
    try {
      setLoadingCleaners(true)
      
      const supabase = createSupabaseBrowser()
      
      // Fetch cleaners with their stats
      const { data: cleanersData, error: cleanersError } = await supabase
        .from('profiles')
        .select(`
          *,
          bookings!bookings_cleaner_id_fkey(
            id,
            status,
            total_price,
            created_at
          )
        `)
        .eq('role', 'cleaner')
        .order('created_at', { ascending: false })

      if (cleanersError) throw cleanersError

      const safeCleanersData = Array.isArray(cleanersData) ? cleanersData : []
      
      // Calculate stats for each cleaner
      const cleanersWithStats = safeCleanersData.map(cleaner => {
        const safeBookings = Array.isArray(cleaner.bookings) ? cleaner.bookings : []
        const completedBookings = safeBookings.filter((b: any) => b?.status === 'completed')
        const thisMonth = new Date()
        thisMonth.setMonth(thisMonth.getMonth() - 1)
        
        const thisMonthBookings = safeBookings.filter((b: any) => 
          b?.status === 'completed' && new Date(b.created_at) >= thisMonth
        )

        const totalEarnings = completedBookings.reduce((sum: number, booking: any) => 
          sum + (booking?.total_price || 0), 0
        )
        
        const thisMonthEarnings = thisMonthBookings.reduce((sum: number, booking: any) => 
          sum + (booking?.total_price || 0), 0
        )

        // Calculate average rating (placeholder for now)
        const averageRating = 4.2 + Math.random() * 0.8

        return {
          ...cleaner,
          stats: {
            total_jobs: safeBookings.length,
            completed_jobs: completedBookings.length,
            average_rating: averageRating,
            total_earnings: totalEarnings,
            this_month_jobs: thisMonthBookings.length,
            this_month_earnings: thisMonthEarnings
          },
          is_online: Math.random() > 0.3, // Placeholder
          last_seen: new Date(Date.now() - Math.random() * 86400000).toISOString()
        }
      })

      setCleaners(cleanersWithStats)
      calculateStats(cleanersWithStats)
    } catch (error) {
      console.error('Error fetching cleaners:', error)
    } finally {
      setLoadingCleaners(false)
    }
  }

  const calculateStats = (cleanersData: CleanerWithStats[]) => {
    const safeCleanersData = Array.isArray(cleanersData) ? cleanersData : []
    
    const totalCleaners = safeCleanersData.length
    const activeCleaners = safeCleanersData.filter(c => c.stats.completed_jobs > 0).length
    const onlineCleaners = safeCleanersData.filter(c => c.is_online).length
    const averageRating = safeCleanersData.length > 0 
      ? safeCleanersData.reduce((sum, c) => sum + c.stats.average_rating, 0) / safeCleanersData.length
      : 0

    setStats({
      totalCleaners,
      activeCleaners,
      onlineCleaners,
      averageRating
    })
  }

  const filterCleaners = () => {
    const safeCleaners = Array.isArray(cleaners) ? cleaners : []
    let filtered = safeCleaners

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cleaner => 
        cleaner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cleaner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cleaner?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'active':
          filtered = filtered.filter(cleaner => cleaner.stats.completed_jobs > 0)
          break
        case 'online':
          filtered = filtered.filter(cleaner => cleaner.is_online)
          break
        case 'offline':
          filtered = filtered.filter(cleaner => !cleaner.is_online)
          break
      }
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter)
      filtered = filtered.filter(cleaner => cleaner.stats.average_rating >= minRating)
    }

    setFilteredCleaners(filtered)
  }

  const toggleCleanerStatus = async (cleanerId: string, isActive: boolean) => {
    try {
      const supabase = createSupabaseBrowser()
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', cleanerId)

      if (error) throw error

      // Update local state
      setCleaners(prev => prev.map(cleaner => 
        cleaner.id === cleanerId 
          ? { ...cleaner, is_active: isActive }
          : cleaner
      ))
    } catch (error) {
      console.error('Error updating cleaner status:', error)
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

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-yellow-600'
    if (rating >= 3.0) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStatusColor = (isActive: boolean, isOnline: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-800'
    if (isOnline) return 'bg-green-100 text-green-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = (isActive: boolean, isOnline: boolean) => {
    if (!isActive) return 'Inactive'
    if (isOnline) return 'Online'
    return 'Offline'
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cleaners Management</h1>
              <p className="mt-2 text-gray-600">
                Manage cleaner profiles, monitor performance, and track earnings
              </p>
            </div>
            
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Cleaner
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cleaners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCleaners}</div>
              <p className="text-xs text-muted-foreground">
                Registered cleaners
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cleaners</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCleaners}</div>
              <p className="text-xs text-muted-foreground">
                With completed jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Now</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.onlineCleaners}</div>
              <p className="text-xs text-muted-foreground">
                Currently available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Out of 5.0 stars
              </p>
            </CardContent>
          </Card>
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
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.0">3.0+ Stars</SelectItem>
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
        <div className="space-y-4">
          {loadingCleaners ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (filteredCleaners || []).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cleaners found</h3>
                <p className="text-gray-500">Try adjusting your filters or add new cleaners.</p>
              </CardContent>
            </Card>
          ) : (
            (filteredCleaners || []).map((cleaner) => (
              <Card key={cleaner.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {cleaner.full_name || 'Unknown Cleaner'}
                          </h3>
                          <p className="text-sm text-gray-600">{cleaner.email}</p>
                          <p className="text-xs text-gray-500">{cleaner.phone}</p>
                        </div>
                        <Badge className={getStatusColor(cleaner.is_active, cleaner.is_online)}>
                          {getStatusText(cleaner.is_active, cleaner.is_online)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Total Jobs</p>
                          <p className="text-2xl font-bold text-gray-900">{cleaner.stats.total_jobs}</p>
                          <p className="text-xs text-gray-500">
                            {cleaner.stats.completed_jobs} completed
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900">Rating</p>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className={`text-2xl font-bold ${getRatingColor(cleaner.stats.average_rating)}`}>
                              {cleaner.stats.average_rating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">out of 5.0</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900">Total Earnings</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(cleaner.stats.total_earnings)}
                          </p>
                          <p className="text-xs text-gray-500">
                            This month: {formatCurrency(cleaner.stats.this_month_earnings)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900">This Month</p>
                          <p className="text-2xl font-bold text-gray-900">{cleaner.stats.this_month_jobs}</p>
                          <p className="text-xs text-gray-500">jobs completed</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={cleaner.is_active}
                              onCheckedChange={(checked) => toggleCleanerStatus(cleaner.id, checked)}
                            />
                            <span className="text-sm text-gray-600">
                              {cleaner.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>Last seen: {formatDate(cleaner.last_seen)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            View Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="mr-2 h-4 w-4" />
                            View Reviews
                          </DropdownMenuItem>
                          {cleaner.is_active ? (
                            <DropdownMenuItem 
                              onClick={() => toggleCleanerStatus(cleaner.id, false)}
                              className="text-red-600"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => toggleCleanerStatus(cleaner.id, true)}
                              className="text-green-600"
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
