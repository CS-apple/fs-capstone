import React from 'react'
import { useState } from 'react'
import {useNavigate, Link} from 'react-router'

import { useAuth } from './AuthContext'


export default function Register() {
const [error,setError] = useState()
const navigate = useNavigate();

const {register} = useAuth()

//function try register 
//get form data from inputs 
// async regster from context 
//if success go to account
async function tryRegister(formData){
  setError(null)

  console.log(formData)
  const username = formData.get("username")
  const password = formData.get("password")

  try {
    await register({username, password});
    navigate("/account");
  } 
  catch(e) {
    setError(e.message);
}

}

  return (
        <>
    <h1>Create an account</h1>
    <form action = {tryRegister}>
      {/* <label>
        First Name
        <input type="text" name='firstName'></input>
      </label> */}
      {/* <label>
        Last Name
        <input type="text" name='lastName'></input>
      </label> */}
      <label>
        Username
        <input type="text" name='username' required></input>
      </label>
      <label>
        Password
        <input type="text" name='password' required></input>
      </label>
      <button>Register Account</button>
    </form>
    <Link to="/login">Already have an account? </Link>
    </>
  )
}