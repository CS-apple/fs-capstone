import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'

export default function Navbar() {

  const {token, logout} = useAuth()

const navLinkClasses = ({ isActive }) =>
    `font-accent text-sm tracking-wide uppercase px-3 py-1.5 rounded-md transition-all duration-200 ${
      isActive
        ? 'text-white bg-white/10 border border-white/20'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`

  return (
    <>
<header className="w-full bg-[#050505] border-b border-border-glass sticky top-0 z-40 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">

        <div className="flex items-center gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display text-xl sm:text-2xl uppercase tracking-wider text-white group-hover:text-gray-200 transition-colors">
              Roast Battle <span className="text-brand-red">NY</span>
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-2 sm:gap-6 shrink-0">
            <NavLink to="/grid" className={navLinkClasses}>Grid</NavLink>
            {token && <NavLink to="/account" className={navLinkClasses}>Account</NavLink>}
            {!token ? (
              <NavLink to="/login" className={navLinkClasses}>Login</NavLink>
            ) : (
              <button 
                onClick={logout} 
                className="font-accent text-sm tracking-wide uppercase px-3 py-1.5 text-gray-400 hover:text-brand-red hover:bg-white/5 rounded-md transition-all duration-200 cursor-pointer"
              >
                Logout
              </button>
            )}
        </nav>
        
      </div>  
    </header>
    </>
  )
}
