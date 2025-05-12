import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface ChannelFormProps {
  onChannelChange: (channel: string) => void;
  defaultChannel: string;
}

const ChannelForm: React.FC<ChannelFormProps> = ({ 
  onChannelChange, 
  defaultChannel 
}) => {
  const [inputChannel, setInputChannel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputChannel.trim()) {
      onChannelChange(inputChannel.trim().toLowerCase());
      setInputChannel('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center mb-4 bg-gray-800 rounded-lg p-2 shadow-md"
    >
      <Search className="h-5 w-5 text-gray-400 mr-2" />
      <input
        type="text"
        placeholder={`Enter Twitch channel (default: ${defaultChannel})`}
        value={inputChannel}
        onChange={(e) => setInputChannel(e.target.value)}
        className="flex-1 bg-transparent text-white border-none outline-none placeholder-gray-500"
        aria-label="Twitch channel name"
      />
      <button
        type="submit"
        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-1 rounded-md transition-colors duration-200"
      >
        Watch
      </button>
    </form>
  );
};

export default ChannelForm;