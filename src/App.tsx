import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { TwitchMessage, Comment } from './types';
import TwitchPlayer from './components/TwitchPlayer';
import CommentsList from './components/CommentsList';
import WalletConnect from './components/WalletConnect';
import DonationPopup from './components/DonationPopup';
import ChannelForm from './components/ChannelForm';
import { MINIMUM_GAS_FUND, DEFAULT_TWITCH_CHANNEL } from './config/constants';

import { 
  initBlockchain, 
  getContractBalance, 
  postCommentToBlockchain,
  connectWallet,
  donateToContract
} from './services/blockchain';

import {
  initTwitchClient,
  changeChannel,
  setMessageHandler
} from './services/twitch';

function App() {
  const [channel, setChannel] = useState(DEFAULT_TWITCH_CHANNEL);
  const [pendingTransactions, setPendingTransactions] = useState<TwitchMessage[]>([]);
  const [confirmedTransactions, setConfirmedTransactions] = useState<Comment[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [showDonationPopup, setShowDonationPopup] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      const blockchainInit = await initBlockchain();
      const twitchInit = await initTwitchClient(channel);
      
      if (blockchainInit && twitchInit) {
        setInitialized(true);
        fetchBalance();
      } else {
        toast.error('Failed to initialize services');
      }
    };
    
    init();
  }, []);

  useEffect(() => {
    if (initialized) {
      setMessageHandler(async (message: TwitchMessage) => {
        setPendingTransactions(prev => [...prev, message]);
        
        try {
          const txHash = await postCommentToBlockchain(
            message.username,
            message.message
          );
          
          if (txHash) {
            setConfirmedTransactions(prev => [{
              username: message.username,
              message: message.message,
              timestamp: Math.floor(Date.now() / 1000),
              txHash
            }, ...prev]);
            
            setPendingTransactions(prev => 
              prev.filter(tx => tx.id !== message.id)
            );
          }
        } catch (error) {
          console.error('Error processing message:', error);
          setPendingTransactions(prev => 
            prev.filter(tx => tx.id !== message.id)
          );
        }
      });
    }
  }, [initialized]);

  const fetchBalance = useCallback(async () => {
    const newBalance = await getContractBalance();
    setBalance(newBalance);
  }, []);

  useEffect(() => {
    const balanceInterval = setInterval(fetchBalance, 10000);
    return () => clearInterval(balanceInterval);
  }, [fetchBalance]);

  const handleChannelChange = useCallback(async (newChannel: string) => {
    const success = await changeChannel(newChannel);
    
    if (success) {
      setChannel(newChannel);
      setPendingTransactions([]);
      setConfirmedTransactions([]);
      toast.success(`Switched to channel: ${newChannel}`);
    } else {
      toast.error(`Failed to switch to channel: ${newChannel}`);
    }
  }, []);

  const handleConnectWallet = useCallback(async () => {
    const connectedAccount = await connectWallet();
    
    if (connectedAccount) {
      setAccount(connectedAccount);
      toast.success('Wallet connected successfully');
    } else {
      toast.error('Failed to connect wallet');
    }
  }, []);

  const handleDonate = useCallback(async (amount: string): Promise<boolean> => {
    const txHash = await donateToContract(amount);
    
    if (txHash) {
      toast.success(`Donated ${amount} MON successfully`);
      fetchBalance();
      return true;
    } else {
      toast.error('Donation failed');
      return false;
    }
  }, [fetchBalance]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Toaster position="top-right" />
      
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-white">
              Monad <span className="text-violet-400">Speed Test</span>
            </h1>
            
            {parseFloat(balance) < MINIMUM_GAS_FUND && (
              <div className="bg-red-500/10 text-red-400 px-4 py-1.5 rounded-lg text-sm flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse"></div>
                <span>Gas fund low!</span>
                <button 
                  onClick={() => setShowDonationPopup(true)}
                  className="text-red-400 hover:text-red-300 transition-colors underline underline-offset-2"
                >
                  Donate
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <WalletConnect
            account={account}
            balance={balance}
            onConnect={handleConnectWallet}
            onDonate={() => setShowDonationPopup(true)}
          />
        </div>
        
        <div className="lg:pr-[420px]">
          <div className="space-y-6">
            <ChannelForm
              onChannelChange={handleChannelChange}
              defaultChannel={DEFAULT_TWITCH_CHANNEL}
            />
            <TwitchPlayer channel={channel} />
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-sm text-slate-400 space-y-2">
                <p>
                  <span className="font-medium text-violet-400">How it works:</span> Real-time Twitch
                  chat messages are stored on the Monad blockchain.
                </p>
                <p>
                  Each transaction demonstrates the speed and efficiency of the
                  Monad Testnet for high-frequency transaction processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <CommentsList 
        pendingTransactions={pendingTransactions}
        confirmedTransactions={confirmedTransactions}
      />
      
      {showDonationPopup && (
        <DonationPopup
          onDonate={handleDonate}
          onClose={() => setShowDonationPopup(false)}
        />
      )}
    </div>
  );
}

export default App;