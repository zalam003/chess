import { useState, useEffect } from 'react';
import Web3 from 'web3';

export const useWeb3 = () => {
  const [isWeb3Enabled, setIsWeb3Enabled] = useState(false);
  const [web3, setWeb3] = useState(null);

  const enableWeb3 = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        setWeb3(web3Instance);
        setIsWeb3Enabled(true);
      } catch (error) {
        console.error("User denied account access");
      }
    }
  };

  const fetchElo = async () => {
    // Implement ELO fetching logic here
  };

  return { isWeb3Enabled, enableWeb3, web3, fetchElo };
};
