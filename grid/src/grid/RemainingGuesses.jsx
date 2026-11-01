import React from 'react'
import{useEffect} from 'react'
import { useGame } from '../GameContext/GameContext'

export default function RemainingGuesses() {

const {guesses, gameState,gameOver, setSummaryActive} = useGame()

function handleClick() {
  console.log("clicked give up")
  gameOver()
}


useEffect(()=>{
  if (guesses <= 0 && gameState !== "END" ) {
      gameOver() 
  }
},[guesses, gameState, gameOver])

  return (
    <div className="flex items-center gap-4">
       <h3 className="font-accent text-sm text-gray-300 flex items-center gap-2">
        Guesses remaining: 
          <span className="slanted-red px-2.5 py-0.5 text-xs font-display tracking-wider text-white">
            {guesses}
          </span>
        </h3>   
       {gameState==="END"
        ?
        <button 
        onClick={()=>{setSummaryActive(true)}}
        className="font-accent text-xs uppercase tracking-wider px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white border border-border-glass transition-all duration-200 cursor-pointer shadow-md"
        >
          Score Summary
        </button>
        :
      <button className="give-up font-accent text-xs uppercase tracking-wider px-3 py-1.5 rounded-md text-red-400 hover:text-white hover:bg-red-950/40 border border-red-500/30 transition-all duration-200 cursor-pointer" 
      onClick={handleClick}
      >
        Give up?
      </button>
       }   
    </div>
  )
}
