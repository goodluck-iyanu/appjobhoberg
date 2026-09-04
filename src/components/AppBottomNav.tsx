'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Briefcase, FileText, CheckCircle, User } from '@/components/icons'

export default function AppBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/app', label: 'Home', icon: Home, active: pathname === '/app' || pathname === '/dashboard' },
    { href: '/jobs', label: 'Jobs', icon: Briefcase, active: pathname.startsWith('/jobs') },
    { href: '/app/tracker', label: 'Tracker', icon: CheckCircle, active: pathname.startsWith('/app/tracker') },
    { href: '/app/cv', label: 'My CV', icon: FileText, active: pathname.startsWith('/app/cv') },
    { href: '/app/profile', label: 'Profile', icon: User, active: pathname.startsWith('/app/profile') || pathname.startsWith('/profile') },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/[0.08] px-2 py-2">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                item.active
                  ? 'text-[#e02424] font-semibold bg-red-50/70'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

