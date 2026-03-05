import React from 'react'
import Link from 'next/link'

function Footer() {
  return (
    <div className="flex items-center justify-end gap-2 p-2 ">
        <p className="text-xs text-neutral-500">v.0.0.5</p>
          <p className="text-xs text-neutral-500">Powered by <Link href="https://rlink.com" className="text-blue-600 hover:underline">RLink</Link></p>
          <p className="text-xs text-neutral-500">Copyright © 2026 RLink</p>
    </div>
  )
}

export default Footer