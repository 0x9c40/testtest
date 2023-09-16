import "./App.css";
import { useState, useEffect } from "react";
import { formatBalance, formatChainAsNum } from "./utils"; /* New */
import detectEthereumProvider from "@metamask/detect-provider";
import { ChainId, Token, WETH, Pair, TokenAmount, Route, Trade, TradeType } from "@uniswap/sdk";

// console.log("tokenData", tokenData)

// const ETHERSCAN_API_URL = "https://api.etherscan.io/api";
// const CONTRACT_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
// const API_KEY = "4BW0VR0F1995U5G9AWNIN9TC9DKGWUXWSZ";

// async function getABI() {
//     const response = await fetch(`${ETHERSCAN_API_URL}?module=contract&action=getabi&address=${CONTRACT_ADDRESS}&apikey=${API_KEY}`);
//     const data = await response.json();
//     return JSON.parse(data.result);
// }

// console.log('ABI:', await getABI())

const UNI = new Token(
  ChainId.GÖRLI,
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  18,
  "UNI",
  "Uniswap"
);

const WETH_UNI = new Pair(
  new TokenAmount(WETH[UNI.chainId], "1000000000000"),
  new TokenAmount(UNI, "15000000000000")
);


const WETH_TO_UNI = new Route([WETH_UNI], WETH[UNI.chainId]);
const trade = new Trade(WETH_TO_UNI, new TokenAmount(WETH[UNI.chainId], "1000000000"), TradeType.EXACT_INPUT)

console.log("trade:", trade);

// const pairAddress = Pair.getAddress(UNI, WETH[UNI.chainId])
// console.log(ChainId.GÖRLI, WETH, UNI, pairAddress)

const App = () => {
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);
  const initialState = { accounts: [], balance: "", chainId: "" }; /* Updated */
  const [wallet, setWallet] = useState(initialState);

  useEffect(() => {
    const refreshAccounts = (accounts: any) => {
      if (accounts.length > 0) {
        updateWallet(accounts);
      } else {
        // if length 0, user is disconnected
        setWallet(initialState);
      }
    };

    const refreshChain = (chainId: any) => {
      /* New */
      setWallet((wallet) => ({ ...wallet, chainId })); /* New */
    }; /* New */

    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true });
      setHasProvider(Boolean(provider));

      if (provider) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        refreshAccounts(accounts);
        window.ethereum.on("accountsChanged", refreshAccounts);
        window.ethereum.on("chainChanged", refreshChain); /* New */
      }
    };

    getProvider();

    return () => {
      window.ethereum?.removeListener("accountsChanged", refreshAccounts);
      window.ethereum?.removeListener("chainChanged", refreshChain); /* New */
    };
  }, []);

  const updateWallet = async (accounts: any) => {
    const balance = formatBalance(
      await window.ethereum!.request({
        /* New */ method: "eth_getBalance" /* New */,
        params: [accounts[0], "latest"] /* New */,
      })
    ); /* New */
    const chainId = await window.ethereum!.request({
      /* New */ method: "eth_chainId" /* New */,
    }); /* New */
    setWallet({ accounts, balance, chainId }); /* Updated */
  };

  const handleConnect = async () => {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    updateWallet(accounts);
  };

  return (
    <div className="App">
      <div>Injected Provider {hasProvider ? "DOES" : "DOES NOT"} Exist</div>

      {window.ethereum?.isMetaMask && wallet.accounts.length < 1 && (
        <button onClick={handleConnect}>Connect MetaMask</button>
      )}

      {wallet.accounts.length > 0 && (
        <>
          {" "}
          {/* New */}
          <div>Wallet Accounts: {wallet.accounts[0]}</div>
          <div>Wallet Balance: {wallet.balance}</div> {/* New */}
          <div>Hex ChainId: {wallet.chainId}</div> {/* New */}
          <div>Numeric ChainId: {formatChainAsNum(wallet.chainId)}</div>{" "}
          {/* New */}
        </>
      )}
    </div>
  );
};

export default App;
