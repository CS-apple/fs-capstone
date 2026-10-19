import React from 'react'
import { NavLink, Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <>
    <header>
        <Link to="index">Roast Battle New York </Link>
        <nav>
            <NavLink to="/grid">Grid</NavLink>
            <NavLink to="/login">Log In</NavLink>
        </nav>
    </header>
    </>
  )
}
