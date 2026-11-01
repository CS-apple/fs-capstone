import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { generateValidGrid, submitGuesss, getBattlers } from '../api/grid_api'
import GridBoard from './GridBoard'
import RemainingGuesses from './RemainingGuesses'
import './grid.css'
import SearchModal from './SearchModal'
import ScoreSummary from '../scoreSummary/ScoreSummary'
import {useGame} from '../GameContext/GameContext'


//MAIN COMPONENT
export default function Grid() {
const{gameState} = useGame()

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 py-4 animate-fade-in">
      <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-center text-white mb-6 animate-fade-in">
        Play immaculate grid
      </h2>
      <section className="glass-card max-w-4xl mx-auto p-4 sm:p-8 flex flex-col items-center gap-6 shadow-2xl">
          {/* <h3>GRID #0000</h3>
          <Link>Previous grids</Link>
          <Link>Todays Results</Link> */}
          <Link className="font-accent text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors border border-border-glass hover:border-white/30 px-3 py-1.5 rounded-md self-start">
          Rules
          </Link>
            <RemainingGuesses />
            <GridBoard />
            <SearchModal />
            <ScoreSummary />
      </section>
    </div>
  )
}
