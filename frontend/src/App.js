import "./App.css";
import { useEffect, useState } from "react";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider} from "@project-serum/anchor";
import { Buffer} from "buffer";
import { OCR2Feed } from "@chainlink/solana-sdk";
import CanvasJSReact from './canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
window.Buffer = Buffer;

var dps = [];  
var xVal = dps.length + 1;
var yVal = 15;

const CHAINLINK_FEED = "EpFp9mhi9cvZL9Lp59S1mt2twv2dtZGgFUvZEQMZ9Ra8"
const CHAINLINK_PROGRAM_ID = "cjg3oHmg9uuPsP8D6g29NWvhySJkdYdAo9D25PRbKXJ"

const network = clusterApiUrl('devnet')

const opts = {
  preFlightCommitment: 'processed'
}

const options = {
  title :{
    text: "Dynamic Line Chart"
  },
  data: [{
    type: "line",
    dataPoints : dps
  }]
}

const App = () => {
  const delay = ms => new Promise(
    resolve => setTimeout(resolve, ms)
  );

  const [walletAddress, setWalletAddress] = useState(null);
  const [update,setUpdate] = useState(false);


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
          getFeed()
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
    getFeed()
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preFlightCommitment)
    const provider = new AnchorProvider(connection, window.solana , opts.preFlightCommitment)
    return provider;
  }

  async function getFeed(){
    await delay(1000)
    setUpdate(true);
    const provider = getProvider();
    const feedAddress = new PublicKey(CHAINLINK_FEED);
    
    let dataFeed = await OCR2Feed.load(CHAINLINK_PROGRAM_ID,provider);

    dataFeed.onRound(feedAddress, (event) => {
      yVal = event.answer.toNumber()/100000000
    })
    console.log(yVal)
    dps.push({x: xVal, y: yVal})
    xVal++;
    if (dps.length > 10 ) {
			dps.shift();
		}
    setUpdate(false)
    await new Promise(getFeed)

    
  }



  const renderNotConnectedContainer = () => {
    return <button onClick={connectWallet}> Connect Wallet </button>
  }

  const renderConnectedContainer = () => {
    return <div>
      {update && <CanvasJSChart options = {options} />}
      {!update && <CanvasJSChart options = {options} />}
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
