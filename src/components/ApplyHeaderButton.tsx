'use client'

import Link from 'next/link'
import { ExternalLink } from '@/components/icons'

interface ApplyHeaderButtonProps {
  user: {
    id: string
  } | null
}

export default function ApplyHeaderButton({
  user,
}: ApplyHeaderButtonProps) {



  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="inline-flex items-center justify-center bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold px-6 py-3 rounded-full transition-colors text-[15px] shadow-sm cursor-pointer"
        >
          Sign in with Google to Apply
        </Link>
        <p className="text-[12px] text-[#86868b] mt-2 text-center sm:text-right">
          Account required to apply
        </p>
      </>
    )
  }

  return (
    <a
      href="#apply-section"
      className="inline-flex items-center justify-center bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold px-6 py-3 rounded-full transition-colors text-[15px] shadow-sm cursor-pointer gap-2"
    >
      <span>Apply on Official Site</span>
      <ExternalLink className="w-4 h-4" />
    </a>
  )
}
