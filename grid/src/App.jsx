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

// export default function App() {
//   return (
//     <div className="min-h-screen bg-[#050505] p-8 text-white flex flex-col items-center justify-center gap-4">
//       <h1 className="font-display text-4xl text-brand-red uppercase tracking-tight">
//         RBL Immaculate Grid Test
//       </h1>
//       <p className="font-sans text-zinc-400">
//         If this is white/gray text on a near-black background, Tailwind is connected!
//       </p>
//       <div className="font-accent text-emerald-400 bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
//         7 / 9 GUESSES LEFT
//       </div>
//     </div>
//   );
// }
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
