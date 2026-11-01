import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col poster-gradient text-white font-sans antialiased selection:bg-brand-red selection:text-white">
    <Navbar/>
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
      <Outlet />
    </main>
    </div>
  )
}
