import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { generateGrid } from '../api/grid_api'
import './grid.css'

import Cell from './cell/Cell'

//LAYOUT FOR GRID CSS
function MakeGrid({rowCategories =[], colCategories=[]}){
  const [activeCell, SetActiveCell]=useState(null)
  //on click capture cell 
  const handleCellClick = (rowId, colId)=> {
    SetActiveCell({ rowId, colId });
  }

  const handleGuessSubmit = (data) => {console.log("submit guess", data)}

  const closeModal = () =>{
    SetActiveCell(null)
  }
  ///Catergories are an array of objects so [0]is the first item, and you can pull the categories fromt here 
  //maybe unpack everything and use cssgrid to position 
  return(
    <article> {/*grid container 3x3 matrix*/}
    <div className='img-container'><img src="../src/assets/logo.png"></img></div>{/*placeholder for 1x1*/}
    
    {colCategories.map((colTitle)=>{
        return (<p key={colTitle.id}>{colTitle.name}</p>);
    })}

    {rowCategories.map((row)=>{
      return(<React.Fragment key={row.id}>
      <p key={row.id}>{row.name}</p>
          {colCategories.map((col)=>{
            return(
            <GridCell 
              key={`${row.id}x${col.id}`} 
              rowId={row.id} 
              colId={col.id}
              onSelect = {handleCellClick}/>
            )})}
      </React.Fragment>
      )})}
      {activeCell && (
        <SearchModal 
        cell={activeCell}
        onClose={closeModal} 
        onSubmit={handleGuessSubmit}/>
      )}
    </article>
  )
}

//EACH GRID CELL IS A BUTTON 
function GridCell({rowId, colId, onSelect}){
  // const [cellState, setCellState] = useState({battlerId: null, isCorrect: null })
  const [guessedBattler, setGuessedBattler] = useState(null)
// const handleClick= () => {console.log(`${rowId}x${colId}`)}

  return(
    // <div }>
    <div>
      {guessedBattler ? (<span>guessedBattler.name</span>)
      : (<button onClick={() => !guessedBattler && onSelect(rowId, colId)}>🫥</button>
      )}
    </div>
  )
}

//MODAL CREATION
function SearchModal({cell, onClose, onSubmit}){
  const [battler, setBattler]= useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

  if (!battler.trim()) return;

  onSubmit({
    rowId: cell.rowId,
    colId: cell.colId,
    battlerId: battler
  })

  onClose()
  }

  return(
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <label>Search Battler {cell.rowId}x{cell.colId}
            <input type="text" 
            value={battler}
            onChange={(e)=> setBattler(e.target.value)}
            placeholder="Roast Battler"
            autoFocus></input>
          </label>
          <button type = "submit" >Submit</button>
        </form>
        <div>
          
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

//RENDER FUNCTION
export default function Grid() {
  const [grid, setGrid] = useState(null)

useEffect(() => {
  async function createGrid() {
  const gridData = await generateGrid()
  console.log(gridData);
  setGrid(gridData)
}
  createGrid()
},[]);

if(!grid) return <div>Loading Grid</div>;

  return (
    <>
    <h2>Play immaculate grid</h2>
    <section>
        <h3>GRID #0000</h3>
        <Link>Previous grids</Link>
        <Link>Todays Results</Link>
        <Link>Rules</Link>

        <h3>Guesses remaining: <span>4</span></h3>
        
        <button className='give-up'>Give up?</button>
          <MakeGrid 
            rowCategories = {grid.rowCategories}
            colCategories ={grid.colCategories}
          />

    </section>

    </>
  )
}
