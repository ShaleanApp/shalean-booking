// Polyfills for server-side rendering
// This ensures that globalThis.self is defined for compatibility with browser-only code

if (typeof globalThis.self === 'undefined') {
  (globalThis as any).self = globalThis
}
