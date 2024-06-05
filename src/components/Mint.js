import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import detectEthereumProvider from '@metamask/detect-provider';
import { ERC6150_ABI, CONTRACT_ADDRESS } from '../contract';
import '../styles/Mint.css';

const Mint = () => {
  const [account, setAccount] = useState('');
  const [parentId, setParentId] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      try {
        const ethersProvider = new ethers.BrowserProvider(provider);
        await ethersProvider.send('eth_requestAccounts', []);
        const signer = await ethersProvider.getSigner();
        const accounts = await signer.getAddress();
        setAccount(accounts);
        setError(''); // Clear any previous errors
      } catch (err) {
        console.error('User rejected the connection', err);
        setError('User rejected the connection to MetaMask.');
      }
    } else {
      console.log('Please install MetaMask!');
      setError('Please install MetaMask!');
    }
  };

  const handleMint = async () => {
    if (parentId < 0) {
      setError('Parent ID must be a non-negative integer.');
      setShowPopup(false);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ERC6150_ABI, signer);
      const tx = await contract.safeMintHierarchical(account, parentId, { from: account, gas: 500000 });
      console.log('Transaction Hash:', tx.hash);
      setParentId(''); // Clear the parent ID input
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Minting error', err);
      setError('Minting failed: ' + err.message);
    } finally {
      setShowPopup(false); // Close the popup after attempt to mint
    }
  };

  return (
    <div className="mint-container">
      <h1>Mint ERC6150 Token</h1>
      <div className="button-container">
        <Link to="/" className="home-button">Home</Link>
      </div>
      {account ? (
        <div>
          <p>Connected Account: {account}</p>
          <button className="mint-button" onClick={() => setShowPopup(true)}>Mint Token</button>
        </div>
      ) : (
        <div>
          <button className="mint-button" onClick={connectWallet}>Connect MetaMask</button>
        </div>
      )}

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Enter Parent ID</h2>
            <input
              type="number"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              min="1"
            />
            <button onClick={handleMint}>Mint</button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-popup">
          <p>{error}</p>
          <button onClick={() => setError('')}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Mint;
