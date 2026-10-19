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
    <>
    { !token
      ?
     <> 
    <Login/>
    </>
    :
    <>
      <UserAccount />
    </>
    }
    </>
  )
}