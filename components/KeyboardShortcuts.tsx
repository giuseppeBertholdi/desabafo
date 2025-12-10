'use client'

import { useEffect } from 'react'
import { useKeyboardShortcuts } from '@/hooks/useAccessibility'

export default function KeyboardShortcuts() {
  useKeyboardShortcuts()
  return null
}

