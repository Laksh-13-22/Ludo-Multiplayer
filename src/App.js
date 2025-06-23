import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import MasterControl from './components/MasterControl';
import GameBoard from './components/GameBoard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/ludo-king-premium" element={<MasterControl />} />
        <Route path="/game" element={<GameBoard />} />
      </Routes>
    </Router>
  );
}

export default App;