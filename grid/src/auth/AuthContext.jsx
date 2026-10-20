import React from 'react'
import { useContext, createContext, useState} from "react";

const API = import.meta.env.VITE_API;

const AuthContext = createContext();

export function AuthProvider({children}) {
    const [token, setToken] = useState(null);

    //register function
        //POST request to API, 
        //capture token in state variable
    async function register(credentials){
        console.log(credentials)
        const response = await fetch(API+"/users/register", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(credentials)
        })
        const result = await response.json()
        if(!response === 201){
            throw Error(result.message)
        }
        console.log(result)
        setToken(result.token);
    }
//
    //login function
        //POST request to API, 
        //capture token in state variable
    async function login(credentials){
        console.log(credentials)
        const response = await fetch(API+"/users/login", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(credentials)
        })
        console.log(response)
        const result = await response.json()
        if(!response === 200){
            throw Error(result.message)
        }
        console.log(result)
        setToken(result.token);
    }

    //get account function
        //get request,
            //check if token has been set
            //render account else , return error
    // async function getAccount(){
    //     const response = await fetch(API+"/users/me", {
    //         method: 'GET',
    //         headers: {
    //             "Content-Type" : 'application/json',
    //             'Authorization' : `Bearer ${token}`
    //         }
    //     })
    //     const result = await response.json()
    //     if(!response === 200){
    //         throw Error(result.message)
    //     }
    //     return result
    // }

    // logout function
        //set token to null 
        //redirect to login
    function logout(){
        setToken(null)
    } 

    const value = {register, logout, login, token}
    return <AuthContext.Provider value = {value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context)throw Error ("useAuth must be used within AuthProvider")
  return context
}