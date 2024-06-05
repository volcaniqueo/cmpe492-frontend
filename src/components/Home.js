import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to ERC6150 NFT</h1>
      <div className="buttons-container">
        <button className="nav-button"><Link to="/mint">Mint</Link></button>
        <button className="nav-button"><Link to="/show">Show</Link></button>
        <button className="nav-button"><Link to="/balances">Balances</Link></button>
      </div>
    </div>
  );
};

export default Home;
