"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>正在跳转到仪表盘...</p>
    </div>
  )
}
