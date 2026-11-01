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


if(!searchActive) return(false)

  return(
    <div 
    className='ModalBKG fixed inset-0 z-50 bg-[#050505]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in'
     onClick={closeSearchModal}
    >
      <div 
      className='glass-card w-full max-w-md p-6 bg-surface-elevated border border-border-glass shadow-2xl relative flex flex-col gap-4'
      onClick={(e)=>(e.stopPropagation())}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="font-accent text-sm text-gray-300 flex flex-col gap-2">
            <span className="font-display text-lg tracking-wide uppercase text-white">
              Search Battler\
            </span>
            <span className="text-xs text-gray-400">
            ({activeCell?.rowId},{activeCell?.colId})
            </span>
            <input 
            type="text" 
            value={battler}
            onChange={(e)=> {
              setBattler(e.target.value)
              setSelectedBattler(null)}}
            placeholder=" Search a Roast Battler"
            autoFocus 
            className="w-full bg-surface-card border border-border-glass focus:border-brand-red rounded-lg px-4 py-3 text-white placeholder-gray-500 font-sans text-sm outline-none transition-colors"
            ></input>
          </label>
            {results.length > 0 && (
              <ul className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-1 bg-surface-card border border-border-glass rounded-lg p-1">
                {results.map((battler)=>(
                <li
                key={battler.id}
                onClick={()=>handleSelectedBattler(battler)}
                className="px-3 py-2.5 rounded-md text-sm font-sans text-gray-200 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                >
                  {battler.name}
                </li>
                ))}
              </ul>
              )}
          <button type = "submit" 
          className="slanted-red w-full py-3 font-display uppercase tracking-wider text-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer mt-2"
          >
            Submit
          </button>
        </form>
          <button 
          className="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-border-glass text-gray-400 hover:text-white font-accent text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
          type="button" 
          onClick={closeSearchModal}>
            ❌ Close
          </button>
      </div>
    </div>
  )
}