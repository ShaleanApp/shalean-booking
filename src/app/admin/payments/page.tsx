import dynamicImport from 'next/dynamic'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PaymentsClient = dynamicImport(() => import('./_components/PaymentsClient'))

export default async function AdminPaymentsPage() {
  return <PaymentsClient />
}
