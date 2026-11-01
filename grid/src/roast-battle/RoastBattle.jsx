import React from 'react'
import {Link} from 'react-router'
import Grid from '../grid/Grid'

export default function RoastBattle() {
  return (
    <div className="min-h-screen poster-gradient text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="glass-card max-w-md w-full p-8 flex flex-col items-center text-center shadow-2xl animate-fade-in">
        
        {/* Accent Tag */}
        <span className="slanted-red px-4 py-1 text-xs mb-4 tracking-wider">
          New York City
        </span>

        {/* Display Header */}
        <h1 className="font-display text-5xl tracking-wide uppercase mb-2 text-white">
          Roast Battle League
        </h1>

        <p className="font-accent text-sm text-gray-400 mb-8">
          Test your comedy trivia knowledge against the ultimate daily grid.
        </p>

        {/* Action Link styled with theme states */}
        <Link 
          to="/grid" 
          className="w-full py-4 px-6 bg-brand-red text-white font-display uppercase tracking-wider rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
        >
          Play Today's Grid
        </Link>
        
      </div>
    </div>
  )
}