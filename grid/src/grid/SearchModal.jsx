import React from 'react'
import { useState } from 'react'
import { useGame } from '../GameContext/GameContext'

export default function SearchModal(){
    const{
        activeCell,
        searchActive,
        closeSearchModal,
        selectBattler,
        battlerList,
    } = useGame();

  const [battler, setBattler]= useState('')
//   // const [results, setResults] = useState([])
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
    results=[]
  }

  const handleSubmit = (e) => {
    e.preventDefault()
  
    const targetBattler = selectedBattler || battlerList.find(b => b.name.toLowerCase() === battler.toLowerCase())
    if(!targetBattler){
        console.log("not found by name, please select from list")
    }

    selectBattler(activeCell.rowId, activeCell.colId, targetBattler)

    setBattler('');
    setSelectedBattler(null);
    closeSearchModal();
  }


if(!searchActive) return(null)

  return(
    <div className='ModalBKG' onClick={closeSearchModal}>
      <div onClick={(e)=>(e.stopPropagation())}>
        <form onSubmit={handleSubmit}>
          <label>
            Search Battler for ({activeCell?.rowId},{activeCell?.colId})
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
          <button type="button" onClick={closeSearchModal}>❌ Close</button>
      </div>
    </div>
  )
}