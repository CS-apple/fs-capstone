import {useNavigate, Link} from 'react-router'
import {useState} from "react"
import { useAuth } from './AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const{login} = useAuth()

  async function tryLogin(formData) {
    setError(null)

    const username = formData.get("username")
    const password = formData.get("password")

    try{
    await login({username, password})
    navigate("/account")    
    } catch(e){
      setError(e.message)
    }
  }


  return (
    <>
    <h1>Log in to your Account</h1>
    <form action={tryLogin}>
    <label>
      Username
      <input type = "text" name="username"></input>
    </label>
    <label>
      Password
      <input type = "text" name="password"></input>
    </label>
    <button>Login</button>
    </form>
    <Link to="/register">Need an Account? </Link>
    </>
  )
}