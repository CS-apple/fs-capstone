import React from 'react'
import Score from './Score'
import { useGame } from '../GameContext/GameContext'

export default function ScoreSummary() {


    const {summaryActive, setSummaryActive } = useGame()
        if(!summaryActive) return(false)

    return (

        <div className="fixed inset-0 z-50 bg-[#050505]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 sm:p-8 bg-surface-elevated border border-border-glass shadow-2xl relative flex flex-col gap-6">
                <button 
                onClick={()=> {setSummaryActive(false)}}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-border-glass text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm shrink-0">             
                ❌ Close
                </button>

                <h2 className="font-display text-3xl uppercase tracking-wide text-white border-b border-border-glass pb-4">
                    Game Summary
                </h2>

                <div className="w-full bg-surface-card border border-border-glass rounded-xl p-4 flex flex-col items-center justify-center">
                    <Score />    
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <h3 className="font-display text-xl uppercase tracking-wider text-white border-b border-border-glass pb-2">
                        Your guesses
                    </h3> 

                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="font-display text-xl uppercase tracking-wider text-white border-b border-border-glass pb-2">
                        Solutions
                    </h3> 

                </div>
                </div>
            </div>
        </div>

    )
}

