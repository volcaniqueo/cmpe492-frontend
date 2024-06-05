import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Mint from './components/Mint';
import Show from './components/Show';
import Balances from './components/Balances';
import './styles/App.css';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/show" element={<Show />} />
          <Route path="/balances" element={<Balances />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
