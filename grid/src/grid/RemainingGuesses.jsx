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
    <>
       <h3>Guesses remaining: <span>{guesses}</span></h3>   
       {gameState==="END"
        ?
        <button onClick={()=>{setSummaryActive(true)}}>Score Summary</button>
        :
      <button className='give-up' onClick={handleClick}>Give up?</button>
       }   
    </>
  )
}
