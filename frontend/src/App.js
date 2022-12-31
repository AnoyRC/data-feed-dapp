import "./App.css";
import { useEffect, useState } from "react";

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);

  const checkIfWalletIsConnected = async () => {
    const { solana } = window;
    try {
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom Wallet Connected !");

          const response = await solana.connect({
            onlyIfTrusted: true,
          });
          console.log(
            "Connected with public key : ",
            response.publicKey.toString()
          );
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        console.log("Solana Object not found !, get a Phantom Wallet");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    const response = await solana.connect();
    console.log("Connected with public key : ", response.publicKey.toString());
    setWalletAddress(response.publicKey.toString());
  };

  const renderNotConnectedContainer = () => {
    return <button onClick={connectWallet}> Connect Wallet </button>
  }

  const renderConnectedContainer = () => {
    
  }

  useEffect(()=>{
    const onLoad = async() =>{
      await checkIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad)
  },[])

  return (
    <div>
      {(!walletAddress && renderNotConnectedContainer()) || renderConnectedContainer()}
    </div>
  );
};

export default App;
