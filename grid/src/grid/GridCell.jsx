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
    <div className="aspect-square relative flex items-center justify-center">
      {/* if cell data exists */}
      {cellData ? 
        //is it correct?
        (<div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
          {cellData.correct ?
           (<div className="cell-correct w-full h-full rounded-lg flex flex-col items-center justify-center p-2 relative animate-fade-in">
            <img 
            src={cellData.battler.image_url} 
            className="absolute inset-0 w-full h-full object-cover opacity-80"/>
            <div className="cell-incorrect w-full h-full rounded-lg flex flex-col items-center justify-center p-2 relative animate-fade-in bg-red-950/20">
              <span className="font-accent text-xs font-bold text-red-400 text-center line-clamp-2 px-1">{cellData.battler.name}</span>
            </div>
           </div>)
           :
           (<div className="cell-incorrect w-full h-full rounded-lg flex flex-col items-center justify-center p-2 relative animate-fade-in bg-red-950/20">
            <span className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{cellData.battler.name}</span>
            </div>) 
        }</div>)
          :
        (<button 
          onClick={()=>handleClick(rowCategoryId, colCategoryId)}
          className="w-full h-full rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.10)] border border-border-glass hover:border-brand-red/50 transition-all duration-200 flex items-center justify-center group cursor-pointer"
            aria-label="Select cell"
          >
            <span className="text-lg opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all">
              +
            </span>
          </button>)
      }

    </div>
  )
}
