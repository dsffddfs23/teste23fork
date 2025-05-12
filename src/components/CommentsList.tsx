import React, { useRef, useEffect } from 'react';
import { ExternalLink, User, MessageSquare } from 'lucide-react';
import { Comment, TwitchMessage } from '../types';
import { getTxUrl } from '../services/blockchain';

interface CommentsListProps {
  pendingTransactions: TwitchMessage[];
  confirmedTransactions: Comment[];
}

const CommentsList: React.FC<CommentsListProps> = ({ 
  pendingTransactions, 
  confirmedTransactions 
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const formatDate = (timestamp: number): string => {
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const truncateTxHash = (hash: string): string => {
    if (!hash || hash.length < 10) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      const element = chatContainerRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [pendingTransactions, confirmedTransactions]);

  return (
    <div className="fixed top-[84px] right-4 w-[400px] h-[calc(100vh-100px)] flex flex-col bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-violet-400" />
          Live Chat
          <span className="px-2 py-0.5 text-xs font-medium bg-violet-500/10 text-violet-400 rounded-full">
            {pendingTransactions.length + confirmedTransactions.length}
          </span>
        </h2>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="flex flex-col-reverse">
          {[...pendingTransactions, ...confirmedTransactions].map((tx, index) => (
            <div 
              key={tx.id || index}
              className="group bg-slate-800/80 rounded-lg p-3 hover:bg-slate-700/50 transition-all duration-200 border border-slate-700/20 hover:border-violet-500/20 mb-2"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-violet-500/10 rounded-lg">
                    <User className="h-4 w-4 text-violet-400" />
                  </div>
                  <span className="font-medium text-violet-400 group-hover:text-violet-300 transition-colors">
                    {tx.username}
                  </span>
                </div>
                <div className="flex items-center text-slate-400 text-xs gap-1">
                  {formatDate('timestamp' in tx ? Number(tx.timestamp) : Math.floor(Date.now() / 1000))}
                </div>
              </div>
              
              <p className="text-slate-300 mb-2 break-words">{tx.message}</p>
              
              {'txHash' in tx && tx.txHash && (
                <div className="flex items-center justify-between text-xs">
                  <a
                    href={getTxUrl(tx.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors group-hover:underline"
                  >
                    <span>{truncateTxHash(tx.txHash)}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    {tx.txHash ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {pendingTransactions.length === 0 && confirmedTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <MessageSquare className="h-8 w-8 text-slate-500" />
            <p>Waiting for new chat messages...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsList;