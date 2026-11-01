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
    <>
      <h2>Play immaculate grid</h2>
      <section>
          {/* <h3>GRID #0000</h3>
          <Link>Previous grids</Link>
          <Link>Todays Results</Link> */}
          <Link>Rules</Link>
            <RemainingGuesses />
            <GridBoard />
            <SearchModal />
            <ScoreSummary />
      </section>
    </>
  )
}
