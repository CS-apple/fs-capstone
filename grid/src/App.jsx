import {Routes, Route} from 'react-router-dom'
import Layout from './layout/Layout';
import Grid from './grid/Grid';
import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route element = {<Layout />}>
          <Route index element = {<Grid />}></Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
