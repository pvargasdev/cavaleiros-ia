import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom' 
import './App.css'
import Home from './pages/home/Home'
import Game from './pages/game/Game'

function App() {
  return (
    
    <HashRouter>
      <div className='w-screen min-h-screen bg-gray-900'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App