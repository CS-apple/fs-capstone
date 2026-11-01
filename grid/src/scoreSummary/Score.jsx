import React, { useEffect } from 'react'
import { useGame } from '../GameContext/GameContext'




export default function Score() {

  const {calcScore, score}= useGame()
  useEffect(()=>{
    calcScore()
  },[])
return (
    <div className="flex flex-col items-center justify-center gap-1 py-1">
      <span className="font-accent text-xs uppercase tracking-widest text-gray-400">
        Game Completed
      </span>
      <h3 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-white flex items-center gap-2">
        You Scored <span className="text-brand-red">{score}</span>
      </h3>
    </div>
  )
}
