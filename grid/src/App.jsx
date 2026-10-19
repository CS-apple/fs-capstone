import {Routes, Route} from 'react-router-dom'
import Layout from './layout/Layout';


import './App.css'
import RoastBattle from './roast-battle/RoastBattle';
import Grid from './grid/Grid';
import Account from './auth/Account'
import Register from './auth/Register'
import Login from './auth/Login'
import UserAccount from './auth/UserAccount'
import Error404 from './Error404';


function App() {

  return (
    <>
      <Routes>
        <Route element = {<Layout />}>
          <Route index element = {<RoastBattle />}></Route>
          <Route path="/grid" element = {<Grid />}></Route>
          <Route path="/account" element = {<Account />}></Route>
          <Route path="/register" element = {<Register />}></Route>
          <Route path="/login" element = {<Login />}></Route>
          <Route path="/user-Account" element = {<UserAccount />}></Route>
          <Route path="/*" element={<Error404/>}></Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
