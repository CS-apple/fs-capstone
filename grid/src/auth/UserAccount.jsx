import { useState, useEffect } from 'react'
import{useAuth} from '../auth/AuthContext'

export default function UserAccount() {
    const [user, setUser] = useState(null)
    // const [reservations, setReservations] = useState([])
    const {token, getAccount} = useAuth()

async function getUser(){
    if(token){
        const currentUser = await getAccount()
        setUser(currentUser)
        // console.log(user)
    }
    console.log(user)
    return
}
    useEffect(()=>{
        getUser()
    },[])


return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in py-6">
      <div className="glass-card p-6 sm:p-8 flex flex-col gap-2 shadow-2xl">
        <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-white">
          Welcome <span className="text-brand-red">{user?.username}</span>
        </h2>
        <p className="font-accent text-sm text-gray-400">
          Manage your daily game stats and review your match history below.
        </p>
      </div>
      
      <section className="glass-card p-6 sm:p-8 flex flex-col gap-4 shadow-2xl">
        <h3 className="font-display text-2xl uppercase tracking-wide text-white border-b border-border-glass pb-3">
          Play History
        </h3>
        <div className="text-gray-400 font-accent text-sm py-4">
          Your past game grids and scores will appear here.
        </div>
      </section>
    </div>
  )
}
