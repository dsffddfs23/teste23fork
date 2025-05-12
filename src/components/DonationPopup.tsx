import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DonationPopupProps {
  onDonate: (amount: string) => Promise<boolean>;
  onClose: () => void;
}

const DonationPopup: React.FC<DonationPopupProps> = ({ onDonate, onClose }) => {
  const [amount, setAmount] = useState('0.01');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseFloat(amount) <= 0) {
      setError('Please enter an amount greater than 0');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const success = await onDonate(amount);
    
    setIsSubmitting(false);
    
    if (success) {
      onClose();
    } else {
      setError('Donation failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Donate MON</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4 bg-violet-900/20 text-violet-300 p-3 rounded-md text-sm">
          <p>
            Donations fund gas costs for processing Twitch comments on the Monad blockchain. 
            This demonstrates real-time transaction speed of the network.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-900/20 text-red-300 p-3 rounded-md flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Amount (MON)
            </label>
            <div className="relative">
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.001"
                min="0.001"
                className="bg-gray-700 text-white px-4 py-2 rounded-md w-full focus:ring-2 focus:ring-violet-500 focus:outline-none"
                placeholder="0.01"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-400">MON</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Donate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationPopup;