import React from 'react';
import { Menu, PanelLeftClose, PlusCircle, Trash2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClearHistory: () => void;
  hasDataset: boolean;
  messages: { id: string; role: string; content: string }[]; // Accept messages as prop
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onClearHistory, messages }) => {
  // Filter only user messages
  const userMessages = messages.filter((msg) => msg.role === 'user');

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1.5 rounded">
                <PlusCircle size={20} />
              </div>
              <h1 className="text-xl font-bold text-white">DialogixAI</h1>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <PanelLeftClose size={20} />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onClearHistory}
            className="m-4 flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-white hover:bg-gray-800 transition-colors"
          >
            <PlusCircle size={16} />
            <span>New Chat</span>
          </button>

          {/* User Messages List */}
          <div className="flex-1 overflow-y-auto p-4 text-white">
            <h2 className="text-sm font-semibold mb-2">Recent Messages</h2>
            <ul className="space-y-2">
              {userMessages.map((msg) => (
                <li key={msg.id} className="p-2 bg-gray-800 rounded-md text-sm truncate">
                  {msg.content}
                </li>
              ))}
            </ul>
          </div>

          {/* Clear History Button */}
          <button
            onClick={onClearHistory}
            className="m-4 flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-gray-800 transition-colors"
          >
            <Trash2 size={16} />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Toggle button for mobile */}
      <button
        onClick={onToggle}
        className="fixed lg:hidden bottom-4 left-4 p-2 bg-gray-800 text-white rounded-full shadow-lg z-20"
      >
        <Menu size={24} />
      </button>
    </>
  );
};

export default Sidebar;
