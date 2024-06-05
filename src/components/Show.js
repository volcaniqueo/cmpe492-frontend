import React, { useState, useRef } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import { ERC6150_ABI, CONTRACT_ADDRESS } from '../contract';
import '../styles/Show.css';
import * as d3 from 'd3';

const Show = () => {
  const [tokenId, setTokenId] = useState('');
  const [error, setError] = useState('');
  const svgRef = useRef();

  const findRoot = async (tokenId, contract) => {
    let currentToken = tokenId;
    while (true) {
      const isRootToken = await contract.isRoot(currentToken);
      if (isRootToken) {
        return currentToken;
      }
      currentToken = await contract.parentOf(currentToken);
    }
  };

  const buildTree = async (tokenId, contract) => {
    const parentOfToken = await contract.parentOf(tokenId);
    const childrenOfToken = await contract.childrenOf(tokenId);
    const isLeafToken = await contract.isLeaf(tokenId);
    const isRootToken = await contract.isRoot(tokenId);

    let node = {
      tokenId: tokenId,
      parent: parentOfToken,
      children: childrenOfToken,
      isLeaf: isLeafToken,
      isRoot: isRootToken,
      childNodes: []
    };

    for (let i = 0; i < childrenOfToken.length; i++) {
      const childNode = await buildTree(childrenOfToken[i], contract);
      node.childNodes.push(childNode);
    }

    return node;
  };

  const handleFetchTree = async () => {
    if (tokenId <= 0) {
      setError('Token ID must be a positive integer.');
      return;
    }

    try {
      setError('');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ERC6150_ABI, provider);

      const rootTokenId = await findRoot(tokenId, contract);
      const treeStructure = await buildTree(rootTokenId, contract);
      drawTree(treeStructure);
    } catch (err) {
      console.error('Error fetching tree structure:', err);
      setError('Error fetching tree structure: ' + err.message);
    }
  };

  const drawTree = (treeData) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear any previous tree

    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const root = d3.hierarchy(treeData, d => d.childNodes);
    const treeLayout = d3.tree().size([width, height]);
    treeLayout(root);

    // Adjust link length
    const linkLength = 100;
    root.each(node => {
      node.y = node.depth * linkLength;
    });

    // Add links between nodes
    g.selectAll('line')
      .data(root.links())
      .enter()
      .append('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', 'black');

    // Add nodes
    const node = g.selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    node.append('circle')
      .attr('r', 20)
      .attr('fill', 'steelblue');

    node.append('text')
      .attr('dy', 4)
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .text(d => d.data.tokenId);
  };

  return (
    <div className="show-container">
      <h1>Token Hierarchy</h1>
      <div className="input-container">
        <input
          type="number"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          placeholder="Enter Token ID"
          min="1"
          className="token-input"
        />
        <button onClick={handleFetchTree} className="fetch-button">Fetch Tree</button>
        <Link to="/" className="home-button">Home</Link>
      </div>
      {error && (
        <div className="error-popup">
          <p>{error}</p>
          <button onClick={() => setError('')}>Close</button>
        </div>
      )}
      <div className="tree-container">
        <svg ref={svgRef} className="tree-svg"></svg>
      </div>
    </div>
  );
};

export default Show;
