import React, { useEffect } from 'react'
import { useGame } from '../GameContext/GameContext'




export default function Score() {

  const {calcScore, score}= useGame()
  useEffect(()=>{
    calcScore()
  },[])
  return (
    <>
    <h3>You Scored <span>{score}</span></h3>
    </>
  )
}
