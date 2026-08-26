'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Menu, X } from '@/components/icons'

interface NavLink {
  label: string
  href: string
}

const navLinks: NavLink[] = [
  { label: 'Find Jobs', href: '/jobs' },
  { label: 'Categories', href: '/categories' },
  { label: 'Premium', href: '/premium' },
]

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(() => setIsOpen(false), [])

  // Lock body scroll when the menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKey)
    }
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, close])

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg
                   text-[#1d1d1f]/70 hover:text-[#1d1d1f] hover:bg-black/5
                   transition-colors duration-200"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Full-screen overlay */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={close}
        />

        {/* Menu panel */}
        <div
          className={`absolute inset-y-0 right-0 w-full max-w-sm bg-[#fbfbfd]
                      shadow-2xl transition-transform duration-300 ease-out ${
                        isOpen ? 'translate-x-0' : 'translate-x-full'
                      }`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 h-14 border-b border-black/5">
            <span className="font-semibold text-[15px] tracking-tight text-[#1d1d1f]">
              Menu
            </span>
            <button
              onClick={close}
              className="flex items-center justify-center w-9 h-9 rounded-lg
                         text-[#1d1d1f]/70 hover:text-[#1d1d1f] hover:bg-black/5
                         transition-colors duration-200"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="px-6 py-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="block px-4 py-3 rounded-xl text-[16px] font-medium
                           text-[#1d1d1f] hover:bg-black/[0.03]
                           transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="mx-6 border-t border-black/5" />

          {/* Auth actions */}
          <div className="px-6 py-6 space-y-3">
            <Link
              href="/login"
              onClick={close}
              className="block w-full text-center px-4 py-3 rounded-xl text-[15px]
                         font-medium text-[#1d1d1f] border border-black/10
                         hover:bg-black/[0.03] transition-colors duration-200"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={close}
              className="block w-full text-center px-4 py-3 rounded-xl text-[15px]
                         font-medium text-white bg-[#0066cc] hover:bg-[#0077ed]
                         transition-colors duration-200"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
