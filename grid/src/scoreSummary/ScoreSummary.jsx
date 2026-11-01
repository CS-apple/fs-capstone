import React from 'react'
import Score from './Score'
import { useGame } from '../GameContext/GameContext'

export default function ScoreSummary() {


    const {summaryActive, setSummaryActive } = useGame()
        if(!summaryActive) return(false)

  return (

    <>
        <button onClick={()=> {setSummaryActive(false)}}>❌</button>
        <h2>Game Summary</h2>
        <Score />   
        <h3>Grid info</h3>
        <p>Row categories</p>   
        <p>Column categories</p>    
        <h3>your guesses</h3> 
        <h3>solutions</h3>

    </>

)
}

