import React from 'react'
import { useState } from 'react'

export default function Cell() {
    
const [Active, setActive]= useState(null)

  return (
    <>
        <button onClick={handleClick} >{num}</button>
    </>
  )
}

function handleClick(){
    console.log('click')
}

let num = 1
function buttonNum(){
    num++
}
