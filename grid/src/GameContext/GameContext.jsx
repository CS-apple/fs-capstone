import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateValidGrid, submitGuesss, getBattlers } from '../api/grid_api'
import SearchModal from '../grid/SearchModal'
import ScoreSummary from '../scoreSummary/ScoreSummary';

const GameContext = createContext(null);

export function GameProvider({ children }) {
const [grid, setGrid] = useState(null)
const [battlerList, setBattlerList] = useState(null)
const [gameState, setGameState] = useState(null)
const [searchActive, setSearchActive]= useState(false)
const [activeCell, setActiveCell] = useState()
const [cellState,setCellState] = useState({})
const [guesses, setGuesses] = useState(4)
const [score, setScore] = useState(0)
const [summaryActive, setSummaryActive] = useState(false)
const [rulesActive, setRulesActive] = useState(false)

const plusScore = 25
const minusScore = 10
//initialize game board 
useEffect(() => {
  async function initialize() {
    //GENERATE NEW GRID
  const gridData = await generateValidGrid()
   console.log(gridData);
  setGrid(gridData)
    //GET BATTLERS FOR SEARCH
  const allBattlers= await getBattlers()
  // console.log("all",allBattlers)
  setBattlerList(allBattlers);
  // console.log(battlerList)

  setGameState("Pay")
  
}
  initialize()
}, []);

const handleGuessSubmit = async (guess) => {
    console.log("submit guess", guess)
    const isCorrect = await submitGuesss(guess)
    return isCorrect
    console.log("isCorrect", isCorrect)

  }

  const openSearchModal = (rowId, colId) => {
    setActiveCell({rowId, colId})
    setSearchActive(true)
  }

  const closeSearchModal = ()=>{
    setActiveCell(null)
    setSearchActive(false)
  }

  const selectBattler = async (rowId, colId, battler)=>{
    if(!activeCell)return
    const isValid = handleGuess(battler)
    if(!isValid){
        alert("you've already used this battler")
        return false
    }

    const guess = { rowCategoryId: rowId, colCategoryId:colId, battlerId:battler.id}

    const isCorrect = await handleGuessSubmit(guess)
    console.log("isCorrect", isCorrect)
    const cellKey= `${rowId},${colId}`
    console.log("battler", battler)

    setCellState((prev)=>({
        ...prev,
        [cellKey]:{correct:isCorrect.correct, battler:battler}
    }))
    closeSearchModal()
    return isCorrect.correct
}
const handleGuess = (battler)=>
{
    const battlerId = battler.id
    for(const key in cellState) {
        const cell = cellState[key]
        if(cell && cell.correct){
            if(battlerId === cell.battler.id){
                console.log(("this battler has been used"))
                return false
            }
        }
    }
    console.log("valid guess")
    setGuesses((prev)=> prev -1)
    return  true
}

const gameOver=() => {
    setGameState("END")
}

const calcScore = ()=>{
    let score = 0;
    for(const key in cellState) {
        const cell = cellState[key]
        if(cell && cell.correct){
                console.log(("score correct "))
                score += plusScore
            } else if(cell && cell.correct === false) {
                console.log("wrong answers")
                score -= minusScore
        }
    }
   if(score < 0){score = 0}
    console.log("final score", score)
    setScore(score)
    return 
}

//on game end save rows and columns & history to db for username


//game ends when guesses = 0 or when give up is pessed
//on change to game state end, calculate score and show to player, 
//should include a rules modal 

//i think we should save board and score and show it in a play history of sorts 

//then we need to style
  return (
    <GameContext.Provider
      value={{
        activeCell,
        grid,
        battlerList,
        cellState,
        handleGuessSubmit,
        openSearchModal,
        closeSearchModal,
        selectBattler,
        guesses,
        gameOver,
        gameState,
        calcScore,
        score,
        searchActive,
        rulesActive,
        summaryActive,
        setSummaryActive,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}