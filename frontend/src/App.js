import "./App.css";
import { useEffect, useState } from "react";
import {idl} from './idl'
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, utils, web3 } from "@project-serum/anchor";
import { BN } from "bn.js";
import { Buffer} from "buffer";
window.Buffer = Buffer;

const CHAINLINK_FEED = "HgTtcbcmp5BeThax5AU8vg4VwK79qAvAKKFMs8txMLW6"
const CHAINLINK_PROGRAM_ID = "HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny"

const programID = new PublicKey(idl.metadata.address)
const network = clusterApiUrl('devnet')

const opts = {
  preFlightCommitment: 'processed'
}

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [baseAccounts , setBaseAccounts] = useState();
  const [baseAccount, setBaseAccount] = useState({});
  const [registered, setRegistered] = useState(false);

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
          getBaseAccounts()
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
    getBaseAccounts()
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preFlightCommitment)
    const provider = new AnchorProvider(connection, window.solana , opts.preFlightCommitment)
    return provider;
  }

  const loginBaseAccount = async() => {
    const provider = getProvider();
    const baseAccount = baseAccounts.filter((account)=> account.admin.toString() === provider.wallet.publicKey.toString());
    if(baseAccount[0] !== undefined){
      setBaseAccount(baseAccount[0])
      setRegistered(true)
    }
    else{
      createBaseAccount();
    }
}

  const getBaseAccounts = async() => {
    const connection = new Connection(network, opts.preFlightCommitment);
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    Promise.all(
      (await connection.getProgramAccounts(programID,{
        filters: [
          {
            dataSize: 200, 
          },
        ]})).map(
        async (baseAccount) => ({
          ...(await program.account.baseAccount.fetch(baseAccount.pubkey)),
          pubkey: baseAccount.pubkey,
        }) 
      )
    ).then((baseAccount)=> {
      setBaseAccounts(baseAccount)
      console.log(baseAccount)
    })
  }

  const createBaseAccount = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl,programID,provider);
      const [baseAccount] = await PublicKey.findProgramAddressSync(
        [
          utils.bytes.utf8.encode("BASE_DEMO"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      )
      await program.rpc.create({
        accounts:{
          baseAccount,
          user : provider.wallet.publicKey,
          systemProgram : SystemProgram.programId
       },
      })
      console.log("Created a base account with address: ", baseAccount.toString())
      const mainAccount = {
        ...(await program.account.baseAccount.fetch(baseAccount)),
        pubkey: baseAccount,
      }
      setBaseAccount(mainAccount)
      setRegistered(true)
    } catch (error) {
      console.log("Error creating account", error)
    }
  }

  const execute = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const resultAccount = Keypair.generate()
      await program.rpc.execute({
        accounts:{
          resultAccount : resultAccount.publicKey,
          baseAccount : baseAccount.pubkey,
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

  const donate = async(baseAccount) => {
    try {
      const provider = getProvider()
      const program = new Program(idl,programID,provider)
      await program.rpc.donate(new BN(1 * web3.LAMPORTS_PER_SOL), {
        accounts: {
          baseAccount: baseAccount.pubkey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId
        }
      })
      console.log("Successfully donated 0.2 sol to the blog creator")
    } catch (error) {
      console.log("Error Donating ", error)
    }
  }

  const renderNotConnectedContainer = () => {
    return <button onClick={connectWallet}> Connect Wallet </button>
  }

  const renderConnectedContainer = () => {
    return <div>
        <button onClick={execute}> Fetch Live Data </button>
        <button onClick={loginBaseAccount}> Login/ Signup </button>
        <button onClick={()=>donate(baseAccount)}>Donate</button>
      </div>
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
