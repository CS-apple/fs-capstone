import React, { useEffect } from 'react'
import { useState } from 'react'
import SearchModal from './SearchModal'
import { submitGuesss, getBattlersById} from "../api/grid_api";



//search modal should be child of cell, less prop drilling

export default function GridCell({rowCategoryId, colCategoryId, battlerList, openSearchModal, onOpen, onClose}){
  // const [searchModal, setSearchModal] = useState(false)
  const [selectedBattler, setSelectedBattler] = useState(null)
  const [correctBattler, setCorrectBattler] = useState(null)
  // const [cellState, setCellState] = useState({battlerId: null, isCorrect: null })
// const handleClick= () => {console.log(`${rowCategoryId}x${colCategoryId}`)}

  const handleGuessSubmit = async (battler) => {
    console.log("battler", battler)
    const guess = { rowCategoryId, colCategoryId, battlerId:battler.id}
    console.log("submit guess", guess)
    const isCorrect = await submitGuesss(guess)
    console.log("isCorrect", isCorrect)
    if (isCorrect.correct === true){
      setSelectedBattler(battler)
      console.log("true")
      onClose()
      return true

    }
    console.log(false)
    onClose()
    return false
  }

    
  return(
    // <div }>
    <div>
      {selectedBattler ? 
      (<h5>{selectedBattler.name}</h5>)
      : 
      (<button onClick={onOpen}>🫥</button>
      )}
      {openSearchModal && (<SearchModal 
          cell={{rowCategoryId, colCategoryId}}
          onClose={onClose} 
          onSubmit={handleGuessSubmit}
          battlerList={battlerList}
        />)
      }
    </div>
  )
}
