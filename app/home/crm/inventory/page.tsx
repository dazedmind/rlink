import React from 'react'
import DashboardHeader from '@/components/layout/DashboardHeader'
import Image from 'next/image'
import arcoeResidenceLogo from '@/public/project-logo/ar-logo.png'
import arcoeEstatesLogo from '@/public/project-logo/ae-logo.png'

function Inventory() {
  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
    <div className="mx-auto p-8">
       <DashboardHeader title='Inventory' description='Manage your inventory here.' />
       
       {/* Content Goes Here */}
       <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="flex items-center justify-center hover:scale-95 transition-all duration-300 cursor-pointer h-auto aspect-video rounded-xl border bg-white shadow-sm">
            <Image src={arcoeResidenceLogo} alt="Inventory" width={150} height={150} />
          </div>
          <div className="flex items-center justify-center hover:scale-95 transition-all duration-300 cursor-pointer h-auto aspect-video rounded-xl border bg-white shadow-sm">
            <Image src={arcoeEstatesLogo} alt="Inventory" width={150} height={150} />
          </div>
       </div>
    </div>
  </main>
);
}

export default Inventory;