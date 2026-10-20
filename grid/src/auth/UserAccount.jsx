import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useNavigate, Link } from 'react-router'

export default function UserAccount() {
    const [user, setUser] = useState(null)
    // const [reservations, setReservations] = useState([])
    const {token} = useAuth()

// async function getUser(){
//     if(token){
//         const currentUser = await getAccount()
//         setUser(currentUser)
//         // console.log(user)
//     }
//     console.log(user)
//     return
// }

// async function getUserReservations(){
//     if(token){
//         const reservedBooks = await getReservedBooks(token)
//         setReservations(reservedBooks)
//         console.log(reservedBooks);
//     }
//     return
// }

    // useEffect(()=>{
    //     getUser()
    //     getUserReservations()
    // },[])

// const handleCancel = async (id, token)=>{
//     await returnBook(id, token); 
//     await getUserReservations(token);}

  return (
    <>
    <h2>Welcome </h2>
    <p>The email we have on file is :</p>
    </>

  )
}

    // <ReservedBookList list={reservations} returnBook={returnBook} token={token} updateList={getReservedBooks}/>