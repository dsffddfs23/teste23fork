import React from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import { MINIMUM_GAS_FUND } from '../config/constants';

interface WalletConnectProps {
  account: string | null;
  balance: string;
  onConnect: () => void;
  onDonate: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  account,
  balance,
  onConnect,
  onDonate
}) => {
  const isLowBalance = parseFloat(balance) < MINIMUM_GAS_FUND;
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-800 rounded-lg p-3 shadow-md">
      <div className="flex items-center mb-3 sm:mb-0">
        <div className={`px-3 py-2 rounded-md ${isLowBalance ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'} flex items-center`}>
          <span className="font-mono">{balance} MON</span>
          {isLowBalance && (
            <AlertCircle className="ml-2 h-4 w-4 text-red-400" />
          )}
        </div>
        
        <div className="ml-3 text-gray-300 text-sm">
          {isLowBalance ? (
            <span className="text-red-400">Low gas fund</span>
          ) : (
            <span>Gas fund balance</span>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        {!account ? (
          <button
            onClick={onConnect}
            className="flex items-center bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </button>
        ) : (
          <>
            <div className="flex items-center text-gray-300 text-sm mr-3">
              <span className="bg-gray-700 px-2 py-1 rounded-md font-mono text-xs truncate max-w-[120px] sm:max-w-[160px]">
                {account}
              </span>
            </div>
            
            <button
              onClick={onDonate}
              className={`
                flex items-center px-4 py-2 rounded-md transition-colors
                ${isLowBalance 
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                  : 'bg-violet-600 hover:bg-violet-700 text-white'}
              `}
            >
              Donate MON
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletConnect;