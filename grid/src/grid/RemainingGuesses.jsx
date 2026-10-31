import React from 'react'
import { useGame } from '../GameContext/GameContext'

export default function RemainingGuesses() {

const {guesses} = useGame()

function handleCLick(){
  console.log("clicked give up")
 
}
 

  return (
    <>
       <h3>Guesses remaining: <span>{guesses}</span></h3>      
      <button className='give-up' onClick={handleCLick}>Give up?</button>
    </>
  )
}
