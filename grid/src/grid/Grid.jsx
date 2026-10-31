import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { generateValidGrid, submitGuesss, getBattlers } from '../api/grid_api'
import GridBoard from './GridBoard'
import RemainingGuesses from './RemainingGuesses'
import './grid.css'
import SearchModal from './SearchModal'


//MAIN COMPONENT
export default function Grid() {
  const [grid, setGrid] = useState(null)
  const[battlerList, setBattlerList]= useState([])
  const [gameState, setGameState] = useState(null)
  const [guesses, setGuesses] = useState(4)

  return (
    <>
      <h2>Play immaculate grid</h2>
      <section>
          <h3>GRID #0000</h3>
          <Link>Previous grids</Link>
          <Link>Todays Results</Link>
          <Link>Rules</Link>
            <RemainingGuesses />

            <GridBoard />
            <SearchModal />
      </section>
    </>
  )
}
