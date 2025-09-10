declare module '@paystack/inline-js' {
  interface PaystackConfig {
    reference: string
    email: string
    amount: number
    publicKey: string
    metadata?: Record<string, any>
    onSuccess?: (response: any) => void
    onCancel?: () => void
    onClose?: () => void
  }

  interface PaystackInstance {
    openIframe: () => void
  }

  interface PaystackPop {
    setup: (config: PaystackConfig) => PaystackInstance
  }

  const PaystackPop: PaystackPop
  export default PaystackPop
}
