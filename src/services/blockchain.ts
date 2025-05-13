import { ethers } from 'ethers';
import contractABI from './contractABI';
import { EXPLORER_URL } from '../config/constants';

const rpcUrl = import.meta.env.VITE_MONAD_TESTNET_RPC as string;
const privateKey = import.meta.env.VITE_GAS_FUND_PRIVATE_KEY as string;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;

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

    await provider.getNetwork();
    
    wallet = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
    
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === '0x') {
      console.error('Contract not found at specified address');
      return false;
    }
    
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

    const tx = await contract.addComment(username, message, {
      nonce: nonce++
    });
    
    const receipt = await tx.wait();
    return receipt.transactionHash;
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

    const tx = await contract.addReaction(reaction, streamer, {
      nonce: nonce++
    });
    
    const receipt = await tx.wait();
    return receipt.transactionHash;
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

    const tx = await contract.mintStreamMoment(metadata, streamer, {
      nonce: nonce++
    });
    
    const receipt = await tx.wait();
    return receipt.transactionHash;
  } catch (error) {
    console.error('Error minting stream moment:', error);
    return null;
  }
};

export const donateToContract = async (amount: string): Promise<string | null> => {
  try {
    if (!window.ethereum) throw new Error('MetaMask not installed');

    const chainId = '0x279F'; // Monad Testnet chainId
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await addMonadNetwork();
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
      } else {
        throw switchError;
      }
    }
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    await web3Provider.send("eth_requestAccounts", []);
    const signer = web3Provider.getSigner();
    
    // Get the current gas price and estimate gas
    const gasPrice = await web3Provider.getGasPrice();
    const value = ethers.utils.parseEther(amount);
    
    // Send transaction directly to contract address
    const tx = await signer.sendTransaction({
      to: CONTRACT_ADDRESS,
      value,
      gasPrice: gasPrice.mul(2), // Double gas price for faster confirmation
    });
    
    const receipt = await tx.wait();
    return receipt.transactionHash;
  } catch (error) {
    console.error('Error donating:', error);
    return null;
  }
};

export const getContractBalance = async (): Promise<string> => {
  try {
    const balance = await provider.getBalance(CONTRACT_ADDRESS);
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
  if (!window.ethereum) {
    console.error('MetaMask not installed');
    return null;
  }

  try {
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await web3Provider.send('eth_requestAccounts', []);
    
    const chainId = '0x279F'; // Monad Testnet chainId
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await addMonadNetwork();
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
      } else {
        throw switchError;
      }
    }
    
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
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