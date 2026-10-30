import React, { useEffect } from "react";
import { useState } from "react";
import { submitGuesss } from "../api/grid_api";
import SearchModal from './SearchModal'
import GridCell from './GridCell'


//LAYOUT FOR Play space GRID CSS
export default function GridBoard({rowCategories =[], colCategories=[], battlerList=[]}){
const [activeCell, setActiveCell] = useState(null)
  ///Catergories are an array of objects so [0]is the first item, and you can pull the categories fromt here 
  //maybe unpack everything and use cssgrid to position 


  
  return(
    <article> {/*grid container 3x3 matrix*/}
    <div className='img-container'>
      <img src="../src/assets/logo.png"></img>
    </div>{/*placeholder for 1x1*/}
    
    {colCategories.map((colTitle)=>{
        return (<p key={colTitle.id}>{colTitle.name}</p>);
    })}

    {rowCategories.map((row)=>{
      return(<React.Fragment key={row.id}>
      <p key={row.id}>{row.name}</p>
          {colCategories.map((col)=>{
            const cellId = `${row.id}x${col.id}`
            return(
            <GridCell 
              key={cellId} 
              rowCategoryId={row.id} 
              colCategoryId={col.id}
              battlerList={battlerList}
              openSearchModal={activeCell === cellId} 
              onOpen={()=> setActiveCell(cellId)}
              onClose={()=> setActiveCell(null)}
              
              />
              
            )})}
      </React.Fragment>
      )})}
    </article>
  )
}