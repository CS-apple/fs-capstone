import React, { useEffect } from 'react'
import { useState } from 'react'
import SearchModal from './SearchModal'
import { submitGuesss, getBattlersById} from "../api/grid_api";
import { useGame } from '../GameContext/GameContext';


//search modal should be child of cell, less prop drilling

export default function GridCell({
  rowCategoryId, 
  colCategoryId}){

  const{openSearchModal, cellState } = useGame()

    const cellKey = `${rowCategoryId},${colCategoryId}`
    const cellData = cellState[cellKey]

  const handleClick=(rowId, colId)=>{
    openSearchModal(rowId,colId)
  }

  return(
    // <div }>
    <div>
      {/* if cell data exists */}
      {cellData ? 
        //is it correct?
        (<div>{cellData.correct ?
           (<div >
            <img src={cellData.battler.image_url} />
            <span>✅{cellData.battler.name}</span>
           </div>)
           :
           (<div>❌<p> {cellData.battler.name}</p></div>) 
        }</div>)
          :
        (<button onClick={()=>handleClick(rowCategoryId, colCategoryId)}>🫥</button>)
      }

    </div>
  )
}
