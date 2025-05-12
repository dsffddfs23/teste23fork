import { ethers } from 'ethers';
import contractABI from './contractABI';
import { EXPLORER_URL, CONTRACT_ADDRESS } from '../config/constants';

const rpcUrl = import.meta.env.VITE_MONAD_TESTNET_RPC as string;
const privateKey = import.meta.env.VITE_GAS_FUND_PRIVATE_KEY as string;

let provider: ethers.providers.JsonRpcProvider;
let wallet: ethers.Wallet;
let contract: ethers.Contract;
let nonce = 0;

export const initBlockchain = async (): Promise<boolean> => {
  try {
    provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
      chainId: 10143,
      name: 'monad-testnet'
    });
    wallet = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
    nonce = await provider.getTransactionCount(wallet.address);
    return true;
  } catch (error) {
    console.error('Failed to initialize blockchain:', error);
    return false;
  }
};

export const postCommentToBlockchain = async (
  username: string,
  message: string
): Promise<string | null> => {
  try {
    const currentNonce = await provider.getTransactionCount(wallet.address);
    nonce = Math.max(nonce, currentNonce);

    const gasPrice = await provider.getGasPrice();
    
    const tx = await contract.addComment(username, message, {
      nonce: nonce++,
      gasLimit: ethers.BigNumber.from('200000'),
      gasPrice: gasPrice.mul(2)
    });
    
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error posting comment:', error);
    return null;
  }
};

export const postReactionToBlockchain = async (
  reaction: string,
  streamer: string
): Promise<string | null> => {
  try {
    const currentNonce = await provider.getTransactionCount(wallet.address);
    nonce = Math.max(nonce, currentNonce);

    const gasPrice = await provider.getGasPrice();
    
    const tx = await contract.addReaction(reaction, streamer, {
      nonce: nonce++,
      gasLimit: ethers.BigNumber.from('200000'),
      gasPrice: gasPrice.mul(2)
    });
    
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error posting reaction:', error);
    return null;
  }
};

export const mintStreamMoment = async (
  metadata: string,
  streamer: string
): Promise<string | null> => {
  try {
    const currentNonce = await provider.getTransactionCount(wallet.address);
    nonce = Math.max(nonce, currentNonce);

    const gasPrice = await provider.getGasPrice();
    
    const tx = await contract.mintStreamMoment(metadata, streamer, {
      nonce: nonce++,
      gasLimit: ethers.BigNumber.from('300000'),
      gasPrice: gasPrice.mul(2)
    });
    
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error minting stream moment:', error);
    return null;
  }
};

export const getContractBalance = async (): Promise<string> => {
  try {
    const balance = await contract.getBalance();
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error checking balance:', error);
    return '0';
  }
};

export const getTxUrl = (txHash: string): string => {
  return `${EXPLORER_URL}/tx/${txHash}`;
};

export const connectWallet = async (): Promise<string | null> => {
  if (window.ethereum) {
    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      await addMonadNetwork();
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  } else {
    console.error('MetaMask not installed');
    return null;
  }
};

const addMonadNetwork = async (): Promise<void> => {
  if (!window.ethereum) return;
  
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x279F',
        chainName: 'Monad Testnet',
        nativeCurrency: {
          name: 'MON',
          symbol: 'MON',
          decimals: 18
        },
        rpcUrls: [rpcUrl],
        blockExplorerUrls: [EXPLORER_URL]
      }]
    });
  } catch (error) {
    console.error('Error adding Monad network:', error);
  }
};