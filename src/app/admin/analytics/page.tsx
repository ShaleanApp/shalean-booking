import dynamicImport from 'next/dynamic'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AnalyticsClient = dynamicImport(() => import('./_components/AnalyticsClient'))

export default async function AdminAnalyticsPage() {
  return <AnalyticsClient />
}
