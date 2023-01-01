import "./App.css";
import { useEffect, useState } from "react";
import {idl} from './idl'
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";

const CHAINLINK_FEED = "HgTtcbcmp5BeThax5AU8vg4VwK79qAvAKKFMs8txMLW6"
const CHAINLINK_PROGRAM_ID = "HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny"

const programID = new PublicKey(idl.metadata.address)
const network = clusterApiUrl('devnet')

const opts = {
  preFlightCommitment: 'processed'
}

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

  const getProvider = () => {
    const connection = new Connection(network, opts.preFlightCommitment)
    const provider = new AnchorProvider(connection, window.solana , opts.preFlightCommitment)
    return provider;
  }

  const execute = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const resultAccount = Keypair.generate()
      await program.rpc.execute({
        accounts:{
          resultAccount : resultAccount.publicKey,
          user : provider.wallet.publicKey,
          systemProgram : SystemProgram.programId,
          chainlinkFeed: CHAINLINK_FEED,
          chainlinkProgram: CHAINLINK_PROGRAM_ID
        },
        signers:[resultAccount]
      })
      const latestPrice = await program.account.resultAccount.fetch(resultAccount.publicKey);
      console.log(latestPrice.value.toString() / 100000000)
    } catch (error) {
      console.log('Error getting the feed', error)
    }    
  }

  const renderNotConnectedContainer = () => {
    return <button onClick={connectWallet}> Connect Wallet </button>
  }

  const renderConnectedContainer = () => {
    return <button onClick={execute}> Fetch Like Data </button>
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
