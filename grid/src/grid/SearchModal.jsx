import React from 'react'
import { useState } from 'react'

export default function SearchModal({cell, onClose, onSubmit, battlerList}){
  const [battler, setBattler]= useState('')
  // const [results, setResults] = useState([])
  const [selectedBattler, setSelectedBattler] = useState(null)


 let results = []
 if(!battler.trim() || selectedBattler){
  results = [];
 }else{
  results = battlerList.filter(b => b.name.toLowerCase().includes(battler.toLowerCase())).slice(0,5)
}

  function handleSelectedBattler(battler){
    setSelectedBattler(battler)
    setBattler(battler.name)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
  
    const targetId = selectedBattler ? selectedBattler : battler
    //IF battler NEED AN API CALL TO GET BATTLER BY NAME AND PASS ID TO ONSUBMIT
    onSubmit(
      targetId
    )

  onClose()
  }

  return(
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <label>
            Search Battler {cell.rowCategoryId}x{cell.colCategoryId}
            <input 
            type="text" 
            value={battler}
            onChange={(e)=> {
              setBattler(e.target.value)
              setSelectedBattler(null)}}
            placeholder=" Search a Roast Battler"
            autoFocus 
            ></input>
          </label>
            {results.length > 0 && (
              <ul> 
                {results.map((battler)=>(
                <li
                key={battler.id}
                onClick={()=>handleSelectedBattler(battler)}
                >
                  {battler.name}
                </li>
                ))}
              </ul>
              )}
          <button type = "submit" >Submit</button>
        </form>
          <button type="button" onClick={onClose}>❌ Close</button>
      </div>
    </div>
  )
}