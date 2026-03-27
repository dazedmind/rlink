import React from 'react'
import Link from 'next/link'

function Footer() {
  return (
    <div className="flex items-center justify-end gap-2 p-2 ">
        <p className="text-xs text-neutral-500">v.0.0.14</p>
          <p className="text-xs text-neutral-500">Property of <Link href="https://rland.ph" className="text-blue-600 hover:underline">RLand Development Inc.</Link></p>
          <p className="text-xs text-neutral-500">Copyright © 2026 RLink</p>
    </div>
  )
}

export default Footer