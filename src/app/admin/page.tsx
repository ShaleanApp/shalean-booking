import dynamicImport from 'next/dynamic'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AdminClient = dynamicImport(() => import('./_components/AdminClient'))

export default async function AdminPage() {
  return <AdminClient />
}
