import React from 'react';
import { Heart, ThumbsUp, Star, Siren as Fire, Sparkles } from 'lucide-react';
import { useTransition, animated } from '@react-spring/web';

interface ReactionBarProps {
  onReaction: (reaction: string) => void;
  currentChannel: string;
}

const REACTIONS = [
  { emoji: '❤️', icon: Heart, color: 'text-red-500' },
  { emoji: '👍', icon: ThumbsUp, color: 'text-blue-500' },
  { emoji: '⭐', icon: Star, color: 'text-yellow-500' },
  { emoji: '🔥', icon: Fire, color: 'text-orange-500' },
  { emoji: '✨', icon: Sparkles, color: 'text-purple-500' }
];

const ReactionBar: React.FC<ReactionBarProps> = ({ onReaction, currentChannel }) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm p-2 rounded-full border border-slate-700/50 shadow-lg">
      {REACTIONS.map(({ emoji, icon: Icon, color }) => (
        <button
          key={emoji}
          onClick={() => onReaction(emoji)}
          className={`p-3 rounded-full hover:bg-slate-700/50 transition-all duration-200 group ${color}`}
        >
          <Icon className="w-5 h-5 transform group-hover:scale-125 transition-transform duration-200" />
        </button>
      ))}
    </div>
  );
};

export const FloatingReaction: React.FC<{ reaction: string }> = ({ reaction }) => {
  return (
    <animated.div
      className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-4xl pointer-events-none"
      style={{
        animation: 'float-up 2s ease-out forwards'
      }}
    >
      {reaction}
    </animated.div>
  );
};

export default ReactionBar;