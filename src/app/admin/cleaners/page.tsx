import dynamicImport from 'next/dynamic'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CleanersClient = dynamicImport(() => import('./_components/CleanersClient'))

export default async function AdminCleanersPage() {
  return <CleanersClient />
}
