import React from 'react'
import { NavLink, Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <>
    <header>
        <h1>Roast Battle New York </h1>
        <nav>
            <Link to="/grid">Grid</Link>
            <a>Log In</a>
        </nav>
    </header>
    </>
  )
}
