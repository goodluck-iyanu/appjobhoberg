'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, Clock, Sparkles, X, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Return dummy fallbacks if outside provider
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    }
  }
  return context
}

// Global Toast helper accessible everywhere
export let showGlobalToast: (type: ToastType, title: string, message?: string) => void = () => {}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, title, message }])

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  showGlobalToast = addToast

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Handle URL query-based toast triggers (e.g. ?signed_out=true or ?upgraded=true)
  useEffect(() => {
    if (searchParams.get('signed_out') === 'true') {
      addToast('info', 'Signed Out', 'You have been safely signed out.')
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('signed_out')
      router.replace(pathname + (newParams.toString() ? '?' + newParams.toString() : ''))
    } else if (searchParams.get('upgraded') === 'true') {
      addToast('success', 'Founding Member Activated!', 'Unlimited job applications are now active.')
    } else if (searchParams.get('toast') === 'login_success') {
      addToast('success', 'Welcome back!', 'Signed in successfully with Google.')
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('toast')
      router.replace(pathname + (newParams.toString() ? '?' + newParams.toString() : ''))
    }
  }, [searchParams, pathname, router, addToast])

  const contextValue: ToastContextType = {
    toast: addToast,
    success: (title, message) => addToast('success', title, message),
    error: (title, message) => addToast('error', title, message),
    warning: (title, message) => addToast('warning', title, message),
    info: (title, message) => addToast('info', title, message),
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border transition-all duration-300 transform translate-y-0 opacity-100 animate-in slide-in-from-top-4 backdrop-blur-md ${
                t.type === 'success'
                  ? 'bg-[#18181b]/95 text-white border-emerald-500/50'
                  : t.type === 'error'
                  ? 'bg-[#18181b]/95 text-white border-red-500/50'
                  : t.type === 'warning'
                  ? 'bg-[#18181b]/95 text-white border-amber-500/50'
                  : 'bg-[#18181b]/95 text-white border-blue-500/50'
              }`}
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {t.type === 'success' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
                {t.type === 'error' && (
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}
                {t.type === 'warning' && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                )}
                {t.type === 'info' && (
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-bold text-white leading-tight">{t.title}</h4>
                {t.message && (
                  <p className="text-[12px] text-gray-300 mt-0.5 leading-snug">{t.message}</p>
                )}
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

