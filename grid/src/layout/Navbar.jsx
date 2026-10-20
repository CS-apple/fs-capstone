import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'

export default function Navbar() {

  const {token, logout} = useAuth()

  return (
    <>
    <header>
        <Link to="/">Roast Battle New York </Link>
        <nav>
            <NavLink to="/grid">Grid</NavLink>
            {token && <NavLink to="/account">Account</NavLink>}
            {!token ? <NavLink to="/login">Login</NavLink>
            :<button onClick={logout}>Logout</button>}
            {/* <NavLink to="/login">Log In</NavLink> */}
        </nav>
    </header> 
    </>
  )
}
