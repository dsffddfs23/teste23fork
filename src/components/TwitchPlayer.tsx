import React from 'react';

interface TwitchPlayerProps {
  channel: string;
}

const TwitchPlayer: React.FC<TwitchPlayerProps> = ({ channel }) => {
  const parentDomain = window.location.hostname;
  
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-2 text-white">
        Watching: <span className="text-violet-400">{channel}</span>
      </h2>
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full rounded-lg shadow-lg"
          src={`https://player.twitch.tv/?channel=${channel}&parent=${parentDomain}&muted=true`}
          frameBorder="0"
          allowFullScreen
          title={`${channel}'s stream`}
        ></iframe>
      </div>
    </div>
  );
};

export default TwitchPlayer;