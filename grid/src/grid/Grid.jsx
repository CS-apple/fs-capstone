import React from 'react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import './grid.css'

import Cell from './cell/Cell'

export default function Grid() {
  return (
    <>
    <h2>Play immaculate grid</h2>
    <section>
        <h3>GRID #0000</h3>
        <Link>Previous grids</Link>
        <Link>Todays Results</Link>
        <Link>Rules</Link>

        <h3>Guesses remaining: <span>9</span></h3>
        
        <button className='give-up'>Give up?</button>
        <article>
            <div className='img-container'><img src="../src/assets/logo.png"></img></div>
            <h5>C1</h5>
            <h5>C2</h5>
            <h5>C3</h5>
            <h5>R1</h5>        
            <div><Cell /></div>
            <div><Cell /></div>
            <div><Cell /></div>
            <h5>R2</h5>
            <div><Cell /></div>
            <div><Cell /></div>
            <div><Cell /></div>
            <h5>R3</h5>
            <div><Cell /></div>
            <div><Cell /></div>
            <div><Cell /></div>
        </article>
    </section>

    </>
  )
}
