import React, { useEffect } from "react";
import { useState } from "react";
import { submitGuesss } from "../api/grid_api";
import SearchModal from './SearchModal'
import GridCell from './GridCell'
import { useGame } from "../GameContext/GameContext";


//LAYOUT FOR Play space GRID CSS
export default function GridBoard(){

    const{grid}=useGame();
  ///Catergories are an array of objects so [0]is the first item, and you can pull the categories fromt here 
  //maybe unpack everything and use cssgrid to position 

 if(!grid) return <div>Loading Grid</div>;
  
  return(
    <article className="grid grid-cols-4 gap-2.5 max-w-2xl mx-auto p-4 glass-card animate-fade-in"> {/*grid container 3x3 matrix*/}
      <div classNamse="img-container aspect-square bg-surface-card rounded-md flex items-center justify-center p-2 border border-border-glass">
        <img 
        src="../src/assets/logo.png" 
        className="w-12 h-12 object-contain opacity-80">
        </img>
        
      </div>{/*placeholder for 1x1*/}
    
      {grid.colCategories.map((colTitle)=>{
        return (
        <div key={colTitle.id} className="aspect-square bg-surface-card rounded-md p-2 flex items-center justify-center text-center border border-border-glass">
          <p className="font-display text-sm sm:text-base uppercase tracking-wider text-white line-clamp-3">
            {colTitle.name}
          </p>
        </div>);
      })}

      {grid.rowCategories.map((row)=>{
        return(<React.Fragment key={row.id}>
        <div key={row.id} 
        className="aspect-square bg-surface-card rounded-md p-2 flex items-center justify-center text-center border border-border-glass">
          <p key={row.id}
          className="font-display text-sm sm:text-base uppercase tracking-wider text-white line-clamp-3">
          {row.name}
          </p>
        </div>
            {grid.colCategories.map((col)=>{
              const cellId = `${row.id}x${col.id}`
              return(
              <GridCell 
                key={cellId} 
                rowCategoryId={row.id} 
                colCategoryId={col.id}
                />
              
            )})}
      </React.Fragment>
      )})}
    </article>
  )
}