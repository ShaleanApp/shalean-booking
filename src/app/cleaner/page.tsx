'use client'

import { useProfile } from '@/hooks/useProfile'
import { useCleanerStats } from '@/hooks/useCleanerStats'
import { useCleanerJobs } from '@/hooks/useCleanerJobs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Star,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { JobStatusUpdate } from '@/components/cleaner/JobStatusUpdate'
import { JobDetails } from '@/components/cleaner/JobDetails'

export default function CleanerPage() {
  const { profile, loading } = useProfile()
  const { stats, isLoading: statsLoading } = useCleanerStats()
  const { 
    jobs, 
    isLoading: jobsLoading, 
    updateJobStatus, 
    getTodaysJobs, 
    getUpcomingJobs, 
    getCompletedJobs 
  } = useCleanerJobs()

  if (loading || statsLoading || jobsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!profile || profile.role !== 'cleaner') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Access denied. Cleaner privileges required.</p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const todaysJobs = getTodaysJobs()
  const upcomingJobs = getUpcomingJobs()
  const completedJobs = getCompletedJobs()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cleaner Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your cleaning jobs and schedule
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Jobs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todaysJobs || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.completedToday || 0} completed, {stats?.remainingToday || 0} remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week's Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats?.weeklyEarnings?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.weeklyEarningsChange || 0}% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.averageRating || 0}</div>
              <p className="text-xs text-muted-foreground">
                Based on {stats?.totalReviews || 0} reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalJobsCompleted || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild className="w-full justify-start">
                  <Link href="/book">
                    <Plus className="mr-2 h-4 w-4" />
                    View Available Jobs
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="#schedule">
                    <Calendar className="mr-2 h-4 w-4" />
                    View My Schedule
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="#earnings">
                    <DollarSign className="mr-2 h-4 w-4" />
                    View Earnings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today's Jobs</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {todaysJobs.length > 0 ? (
                  <div className="space-y-4">
                    {todaysJobs.map((job) => (
                      <JobStatusUpdate
                        key={job.id}
                        job={job}
                        onStatusUpdate={updateJobStatus}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No jobs scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingJobs.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingJobs.map((job) => (
                      <JobDetails key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming jobs scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Completed Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {completedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {completedJobs.slice(0, 10).map((job) => (
                      <JobDetails key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No completed jobs yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {completedJobs.filter(job => job.rating && job.review).length > 0 ? (
                  <div className="space-y-4">
                    {completedJobs
                      .filter(job => job.rating && job.review)
                      .slice(0, 10)
                      .map((job) => (
                        <div key={job.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${
                                      i < (job.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(job.service_date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{job.review}</p>
                            <p className="text-xs text-gray-500">- {job.customer_name}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No reviews yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
