import React, { useState } from 'react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { User, Bot, AlertCircle, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(message.timestamp);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };
  
  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'bg-gray-800' : isSystem ? 'bg-yellow-900' : 'white'}`}>
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <User size={18} />
          </div>
        ) : isSystem ? (
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
            <AlertCircle size={18} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
            <Bot size={18} />
          </div>
        )}
      </div>
      <div className="flex-1">
  <div className="font-medium text-sm text-gray-400 mb-1 flex justify-between items-center">
    <span className="text-white">{isUser ? 'You' : isSystem ? 'System' : 'DialogixAI'}</span>
    <div className="flex items-center gap-2">
      {!isUser && (
        <button
          onClick={handleCopy}
          className="text-gray-500 hover:text-gray-300 transition-colors"
          title="Copy message"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      )}
      <span className="text-xs opacity-70 text-white">{formattedTime}</span>
    </div>
  </div>
  <div className="prose prose-sm prose-invert text-white max-w-none">
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]} 
      rehypePlugins={[rehypeRaw]}
    >
      {message.content}
    </ReactMarkdown>
  </div>
</div>
    </div>
  );
};

export default ChatMessage;