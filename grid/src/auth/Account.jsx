import React from 'react'
import {Link} from "react-router"
import Login from './Login'
import { useAuth } from './AuthContext'
import UserAccount from './UserAccount'

export default function Account() {

  const {
    token,
  } = useAuth()


  //function to convert api call to jsx

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full glass-card p-6 sm:p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
        { !token ? 
        (<div className="w-full flex flex-col items-center"> 
            <Login />
          </div>) 
        : 
        (<div className="w-full flex flex-col items-center">
            <UserAccount />
          </div>)
        }
      </div>
    </div>
  )
}