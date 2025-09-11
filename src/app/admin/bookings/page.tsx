import dynamicImport from 'next/dynamic'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BookingsClient = dynamicImport(() => import('./_components/BookingsClient'))

export default async function AdminBookingsPage() {
  return <BookingsClient />
}
