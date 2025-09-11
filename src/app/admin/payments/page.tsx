'use client'

import dynamicImport from 'next/dynamic'

const PaymentsClient = dynamicImport(() => import('./_components/PaymentsClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  )
})

export default function AdminPaymentsPage() {
  return <PaymentsClient />
}
