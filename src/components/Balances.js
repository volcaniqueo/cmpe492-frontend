import React, { useState } from 'react';
import { ethers } from 'ethers';
import { isAddress } from 'ethers'; // Import isAddress directly
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { ERC6150_ABI, CONTRACT_ADDRESS } from '../contract';
import '../styles/Balances.css';

const Balances = () => {
  const [address, setAddress] = useState('');
  const [tokens, setTokens] = useState([]);
  const [popupContent, setPopupContent] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleSearch = async () => {
    if (!isAddress(address)) { // Use isAddress function
      setPopupContent('Invalid address');
      setShowPopup(true);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ERC6150_ABI, provider);
      const tokenIds = await contract.tokensOfOwner(address);

      setTokens(tokenIds.map(tokenId => tokenId.toString())); // Convert token IDs to string
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setPopupContent('Error fetching tokens: ' + err.message);
      setShowPopup(true);
    }
  };

  const handleFunctionCall = async (tokenId, func) => {
    try {
      let provider;
      let contract;
      let result;

      if (func === 'safeBurn') {
        // Request access to MetaMask for state-changing functions
        provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, ERC6150_ABI, signer);

        const tx = await contract.safeBurn(tokenId);
        await tx.wait(); // Wait for the transaction to be mined
        result = `Token ID ${tokenId} has been burned`;

        // Remove the burned token from the state
        setTokens(tokens.filter(id => id !== tokenId));
      } else {
        // Read-only functions
        provider = new ethers.BrowserProvider(window.ethereum);
        contract = new ethers.Contract(CONTRACT_ADDRESS, ERC6150_ABI, provider);

        switch (func) {
          case 'isLeaf':
            result = await contract.isLeaf(tokenId);
            break;
          case 'isRoot':
            result = await contract.isRoot(tokenId);
            break;
          case 'parentOf':
            result = await contract.parentOf(tokenId);
            break;
          case 'childrenOf':
            result = await contract.childrenOf(tokenId);
            break;
          default:
            result = 'Unknown function';
        }
      }

      setPopupContent(`${func}(${tokenId}): ${result}`);
      setShowPopup(true);
    } catch (err) {
      console.error('Error calling function:', err);
      setPopupContent('Error calling function: ' + err.message);
      setShowPopup(true);
    }
  };

  return (
    <div className="balances-container">
      <h1>Token Balances</h1>
      <div className="input-container">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter Address"
          className="address-input"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
        <Link to="/" className="home-button">Home</Link>
      </div>
      <div className="token-list">
        {tokens.map((tokenId, index) => (
          <div key={index} className="token-item">
            <p>Token ID: {tokenId}</p>
            <button onClick={() => handleFunctionCall(tokenId, 'isLeaf')} className="token-button">isLeaf</button>
            <button onClick={() => handleFunctionCall(tokenId, 'isRoot')} className="token-button">isRoot</button>
            <button onClick={() => handleFunctionCall(tokenId, 'parentOf')} className="token-button">parentOf</button>
            <button onClick={() => handleFunctionCall(tokenId, 'childrenOf')} className="token-button">childrenOf</button>
            <button onClick={() => handleFunctionCall(tokenId, 'safeBurn')} className="burn-button">Burn</button>
          </div>
        ))}
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <p>{popupContent}</p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Balances;
