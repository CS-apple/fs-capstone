import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { generateValidGrid, submitGuesss, getBattlers } from '../api/grid_api'
import GridBoard from './GridBoard'
import RemainingGuesses from './RemainingGuesses'
import './grid.css'


//MAIN COMPONENT
export default function Grid() {
  const [grid, setGrid] = useState(null)
  const[battlerList, setBattlerList]= useState([])

useEffect(() => {
  async function initialize() {
    //GENERATE NEW GRID
  const gridData = await generateValidGrid()
  // console.log(gridData);
  setGrid(gridData)
    //GET BATTLERS FOR SEARCH
  const allBattlers= await getBattlers()
  // console.log("all",allBattlers)
  setBattlerList(allBattlers);
  // console.log(battlerList)
}
  initialize()
}, []);

if(!grid) return <div>Loading Grid</div>;

  return (
    <>
      <h2>Play immaculate grid</h2>
      <section>
          <h3>GRID #0000</h3>
          <Link>Previous grids</Link>
          <Link>Todays Results</Link>
          <Link>Rules</Link>
            <RemainingGuesses />

            <GridBoard 
              rowCategories = {grid.rowCategories}
              colCategories ={grid.colCategories}
              battlerList = {battlerList}
            />
      </section>
    </>
  )
}


// //LAYOUT FOR Play space GRID CSS
// function GridBoard({rowCategories =[], colCategories=[], battlerList=[]}){
//   const [activeCell, SetActiveCell]=useState(null)
//   //on click capture cell 
//   const handleCellClick = (rowCategoryId, colCategoryId)=> {
//     SetActiveCell({ rowCategoryId, colCategoryId });
//   }
//   //send guess to api return true or false
//   const handleGuessSubmit = async (guess) => {
//     console.log("submit guess", guess)
//     const iscorrect = await submitGuesss(guess)
//     console.log(iscorrect)
//   }

//   const closeModal = () =>{
//     SetActiveCell(null)
//   }
//   ///Catergories are an array of objects so [0]is the first item, and you can pull the categories fromt here 
//   //maybe unpack everything and use cssgrid to position 
//   return(
//     <article> {/*grid container 3x3 matrix*/}
//     <div className='img-container'>
//       <img src="../src/assets/logo.png"></img>
//     </div>{/*placeholder for 1x1*/}
    
//     {colCategories.map((colTitle)=>{
//         return (<p key={colTitle.id}>{colTitle.name}</p>);
//     })}

//     {rowCategories.map((row)=>{
//       return(<React.Fragment key={row.id}>
//       <p key={row.id}>{row.name}</p>
//           {colCategories.map((col)=>{
//             return(
//             <GridCell 
//               key={`${row.id}x${col.id}`} 
//               rowCategoryId={row.id} 
//               colCategoryId={col.id}
//               onSelect = {handleCellClick}/>
//             )})}
//       </React.Fragment>
//       )})}
//       {activeCell && (
//         <SearchModal 
//           cell={activeCell}
//           onClose={closeModal} 
//           onSubmit={handleGuessSubmit}
//           battlerList={battlerList}
//         />
//       )}
//     </article>
//   )
// }






//EACH GRID CELL IS A BUTTON 
// function GridCell({rowCategoryId, colCategoryId, onSelect}){
//   // const [cellState, setCellState] = useState({battlerId: null, isCorrect: null })
//   const [guessedBattler, setGuessedBattler] = useState(null)
// // const handleClick= () => {console.log(`${rowCategoryId}x${colCategoryId}`)}

//   return(
//     // <div }>
//     <div>
//       {guessedBattler ? (<span>{guessedBattler.name}</span>)
//       : (<button onClick={() => !guessedBattler && onSelect(rowCategoryId, colCategoryId)}>🫥</button>
//       )}
//     </div>
//   )
// }

// //SEARCH MODAL CREATION
// function SearchModal({cell, onClose, onSubmit, battlerList}){
//   const [battler, setBattler]= useState('')
//   // const [results, setResults] = useState([])
//   const [selectedBattler, setSelectedBattler] = useState(null)

//  let results = []
//  if(!battler.trim() || selectedBattler){
//   results = [];
//  }else{
//   results = battlerList.filter(b => b.name.toLowerCase().includes(battler.toLowerCase())).slice(0,5)
// }

//   function handleSelectedBattler(battler){
//     setSelectedBattler(battler)
//     setBattler(battler.name)
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
  
//     const targetId = selectedBattler ? selectedBattler.id: battler

//     onSubmit({
//       rowCategoryId: cell.rowCategoryId,
//       colCategoryId: cell.colCategoryId,
//       battlerId: targetId
//     })

//   onClose()
//   }

//   return(
//     <div onClick={onClose}>
//       <div onClick={(e) => e.stopPropagation()}>
//         <form onSubmit={handleSubmit}>
//           <label>
//             Search Battler {cell.rowCategoryId}x{cell.colCategoryId}
//             <input 
//             type="text" 
//             value={battler}
//             onChange={(e)=> {
//               setBattler(e.target.value)
//               setSelectedBattler(null)}}
//             placeholder=" Search a Roast Battler"
//             autoFocus 
//             ></input>
//           </label>
//             {results.length > 0 && (
//               <ul> 
//                 {results.map((battler)=>(
//                 <li
//                 key={battler.id}
//                 onClick={()=>handleSelectedBattler(battler)}
//                 >
//                   {battler.name}
//                 </li>
//                 ))}
//               </ul>
//               )}
//           <button type = "submit" >Submit</button>
//         </form>
//           <button type="button" onClick={onClose}>❌ Close</button>
//       </div>
//     </div>
//   )
// }