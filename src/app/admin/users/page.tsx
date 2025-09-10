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
  User, 
  Mail, 
  Phone, 
  Calendar,
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

interface UserStats {
  total_bookings: number
  completed_bookings: number
  total_spent: number
  last_activity: string
}

export default function AdminUsersPage() {
  const { profile, loading } = useProfile()
  const [users, setUsers] = useState<(Profile & { stats?: UserStats })[]>([])
  const [filteredUsers, setFilteredUsers] = useState<(Profile & { stats?: UserStats })[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const supabase = createClient()

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchUsers()
    }
  }, [profile])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Fetch stats for each user
      const usersWithStats = await Promise.all(
        (usersData || []).map(async (user) => {
          const stats = await getUserStats(user.id, user.role)
          return { ...user, stats }
        })
      )

      setUsers(usersWithStats)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const getUserStats = async (userId: string, role: string): Promise<UserStats> => {
    try {
      if (role === 'customer') {
        // Get customer stats
        const { count: totalBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        const { count: completedBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'completed')

        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed')
          .in('booking_id', 
            (await supabase
              .from('bookings')
              .select('id')
              .eq('user_id', userId)
            ).data?.map(b => b.id) || []
          )

        const totalSpent = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

        return {
          total_bookings: totalBookings || 0,
          completed_bookings: completedBookings || 0,
          total_spent: totalSpent,
          last_activity: new Date().toISOString()
        }
      } else if (role === 'cleaner') {
        // Get cleaner stats
        const { count: totalBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('cleaner_id', userId)

        const { count: completedBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('cleaner_id', userId)
          .eq('status', 'completed')

        return {
          total_bookings: totalBookings || 0,
          completed_bookings: completedBookings || 0,
          total_spent: 0,
          last_activity: new Date().toISOString()
        }
      }

      return {
        total_bookings: 0,
        completed_bookings: 0,
        total_spent: 0,
        last_activity: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return {
        total_bookings: 0,
        completed_bookings: 0,
        total_spent: 0,
        last_activity: new Date().toISOString()
      }
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Status filter (active/inactive based on recent activity)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        const isActive = user.stats?.total_bookings && user.stats.total_bookings > 0
        return statusFilter === 'active' ? isActive : !isActive
      })
    }

    setFilteredUsers(filtered)
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // This would update a status field in the profiles table
      // For now, we'll just update the local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, is_active: isActive }
            : user
        )
      )
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      // Remove from local state
      setUsers(prev => prev.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'cleaner':
        return 'bg-blue-100 text-blue-800'
      case 'customer':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-2 text-gray-600">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="cleaner">Cleaners</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

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

              <Button onClick={fetchUsers} variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">Try adjusting your filters or check back later.</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {user.full_name || 'Unknown'}
                          </h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={user.is_active !== false}
                                onCheckedChange={(checked) => toggleUserStatus(user.id, checked)}
                              />
                              <span className="text-sm text-gray-600">
                                {user.is_active !== false ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Phone</p>
                            <p className="text-sm text-gray-600">{user.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Joined</p>
                            <p className="text-sm text-gray-600">{formatDate(user.created_at)}</p>
                          </div>
                        </div>
                        
                        {user.role === 'customer' && user.stats && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Total Spent</p>
                              <p className="text-sm text-gray-600">{formatCurrency(user.stats.total_spent)}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stats for customers and cleaners */}
                      {(user.role === 'customer' || user.role === 'cleaner') && user.stats && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900">
                              {user.stats.total_bookings}
                            </p>
                            <p className="text-xs text-gray-500">Total Bookings</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900">
                              {user.stats.completed_bookings}
                            </p>
                            <p className="text-xs text-gray-500">Completed</p>
                          </div>
                          {user.role === 'customer' && (
                            <div className="text-center">
                              <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(user.stats.total_spent)}
                              </p>
                              <p className="text-xs text-gray-500">Total Spent</p>
                            </div>
                          )}
                        </div>
                      )}
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
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          {user.role !== 'admin' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => toggleUserStatus(user.id, !user.is_active)}
                              >
                                {user.is_active ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteUser(user.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </>
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
