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
    <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
      <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-white text-center">
        Create an account
      </h1>

      <form 
      action = {tryRegister}
      className="w-full flex flex-col gap-4"
      >

        <label className="font-accent text-xs uppercase tracking-wider text-gray-300 flex flex-col gap-1.5">
          Username
          <input 
          type="text" 
          name='username' 
          required
          className="w-full bg-surface-card border border-border-glass focus:border-brand-red rounded-lg px-4 py-3 text-white placeholder-gray-500 font-sans text-sm outline-none transition-colors lowercase"
          >

          </input>
        </label>

        <label className="font-accent text-xs uppercase tracking-wider text-gray-300 flex flex-col gap-1.5">
          Password
          <input 
          type="text" 
          name='password' 
          required
          className="w-full bg-surface-card border border-border-glass focus:border-brand-red rounded-lg px-4 py-3 text-white placeholder-gray-500 font-sans text-sm outline-none transition-colors"
          >

          </input>
        </label>

        <button className="slanted-red w-full py-3.5 font-display uppercase tracking-wider text-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer mt-2">
          Register Account
          </button>
      </form>

      <Link 
      to="/login"
      className="font-accent text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors underline underline-offset-4"
      >
        Already have an account? 
      </Link>
    </div>
  )
}