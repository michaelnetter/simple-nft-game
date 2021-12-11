import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';

const App = () => {

  // State
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  /* 
   * Check if metamask wallet is available
   */
  const checkIfWalletIsConnected = async () => {

    const { ethereum } = window;



    // Check if metamask is available
    if (!ethereum) {
      console.log('Make sure you have MetaMask!');
      setIsLoading(false);
      return;
    } else {
      console.log('We have the ethereum object', ethereum);

      // Check if we can access the account
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      // Use the first account
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
    }

    setIsLoading(false);
  };

  // Render the buttons based on if the wallet is connected and the user already has an NFT
  const renderContent = () => {

    // If the app is currently loading, just render out LoadingIndicator
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
            alt="Monty Python Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
        </button>
        </div>
      );
      // Mint NFT
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
      // Battle
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />;
    }
  };

  /*
   * Connect wallet
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }


      // request access to account.
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * Verify that user is connected to the rinkeby test network
   */
  const checkNetwork = async () => {
    try {
      if (window.ethereum.networkVersion !== '4') {
        alert("Please connect to Rinkeby!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
    checkNetwork();
  }, []);


  /*
   * Add this useEffect right under the other useEffect where you are calling checkIfWalletIsConnected
   */
  useEffect(() => {
    // The function we will call that interacts with out smart contract
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }
      setIsLoading(false);
    };

    /*
     * We only want to run this, if we have a connected wallet
     */
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text"> Science Battle ⚗️👨‍🔬👩‍🔬</p>
          <p className="sub-text">Beat the atom!</p>
          {/* This is where our button and image code used to be!
         *	Remember we moved it into the render method.
         */}
          {renderContent()}
        </div>
        <div className="footer-container">


        </div>
      </div>
    </div>
  );
};

export default App;