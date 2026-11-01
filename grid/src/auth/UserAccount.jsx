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
    <>
    <h2>Welcome <span>{user?.username}</span> </h2>
    play history 
    </>

  )
}

    // <ReservedBookList list={reservations} returnBook={returnBook} token={token} updateList={getReservedBooks}/>