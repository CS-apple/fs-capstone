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
    <article> {/*grid container 3x3 matrix*/}
    <div className='img-container'>
      <img src="../src/assets/logo.png"></img>
    </div>{/*placeholder for 1x1*/}
    
    {grid.colCategories.map((colTitle)=>{
        return (<p key={colTitle.id}>{colTitle.name}</p>);
    })}

    {grid.rowCategories.map((row)=>{
      return(<React.Fragment key={row.id}>
      <p key={row.id}>{row.name}</p>
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