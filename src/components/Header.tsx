import React, { useState } from 'react';
import { BarChart2, MessageSquare, Menu, Trash2, X, LogIn, LogOut, Save } from 'lucide-react';
import AuthModal from './AuthModal';
import { signOut } from '../utils/supabase';
import toast from 'react-hot-toast';
import { User } from '../types';

interface HeaderProps {
  activeTab: 'chat' | 'dashboard';
  onTabChange: (tab: 'chat' | 'dashboard') => void;
  isDashboardAvailable: boolean;
  onClearHistory: () => void;
  user: User | null;
  onAuthSuccess: () => void;
  onSaveDashboard: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isDashboardAvailable,
  onClearHistory,
  user,
  onAuthSuccess,
  onSaveDashboard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClearHistory = () => {
    onClearHistory();
    setShowConfirmClear(false);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      onAuthSuccess();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded">
              <BarChart2 size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-800">DialogixAI</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                  activeTab === 'chat' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => onTabChange('chat')}
              >
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={16} />
                  <span>Chat</span>
                </div>
              </button>
              <button
                className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                  activeTab === 'dashboard' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
                } ${!isDashboardAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isDashboardAvailable && onTabChange('dashboard')}
                disabled={!isDashboardAvailable}
              >
                <div className="flex items-center gap-1.5">
                  <BarChart2 size={16} />
                  <span>Dashboard</span>
                </div>
              </button>
            </div>
            
            {user && isDashboardAvailable && (
              <button
                onClick={onSaveDashboard}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Save size={16} />
                <span>Save Dashboard</span>
              </button>
            )}

            <button
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setShowConfirmClear(true)}
            >
              <Trash2 size={16} />
              <span>Clear History</span>
            </button>

            {user ? (
              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
            )}
            
            <div className="sm:hidden">
              <button 
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="sm:hidden mt-2 bg-white rounded-lg shadow-lg p-2 absolute right-4 z-10 border border-gray-200">
            <button
              className={`w-full px-4 py-2 rounded-md text-sm font-medium text-left ${
                activeTab === 'chat' ? 'bg-gray-100 text-gray-800' : 'text-gray-600'
              }`}
              onClick={() => {
                onTabChange('chat');
                setMobileMenuOpen(false);
              }}
            >
              <div className="flex items-center gap-1.5">
                <MessageSquare size={16} />
                <span>Chat</span>
              </div>
            </button>
            <button
              className={`w-full px-4 py-2 rounded-md text-sm font-medium text-left ${
                activeTab === 'dashboard' ? 'bg-gray-100 text-gray-800' : 'text-gray-600'
              } ${!isDashboardAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (isDashboardAvailable) {
                  onTabChange('dashboard');
                  setMobileMenuOpen(false);
                }
              }}
              disabled={!isDashboardAvailable}
            >
              <div className="flex items-center gap-1.5">
                <BarChart2 size={16} />
                <span>Dashboard</span>
              </div>
            </button>
            {user && isDashboardAvailable && (
              <button
                onClick={() => {
                  onSaveDashboard();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 rounded-md text-sm font-medium text-left text-gray-600 hover:bg-blue-50"
              >
                <div className="flex items-center gap-1.5">
                  <Save size={16} />
                  <span>Save Dashboard</span>
                </div>
              </button>
            )}
            <button
              className="w-full px-4 py-2 rounded-md text-sm font-medium text-left text-red-600 hover:bg-red-50"
              onClick={() => {
                setShowConfirmClear(true);
                setMobileMenuOpen(false);
              }}
            >
              <div className="flex items-center gap-1.5">
                <Trash2 size={16} />
                <span>Clear History</span>
              </div>
            </button>
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 rounded-md text-sm font-medium text-left text-gray-600 hover:bg-red-50"
              >
                <div className="flex items-center gap-1.5">
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 rounded-md text-sm font-medium text-left text-gray-600 hover:bg-blue-50"
              >
                <div className="flex items-center gap-1.5">
                  <LogIn size={16} />
                  <span>Sign In</span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
      
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Clear Chat History</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to clear your chat history? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setShowConfirmClear(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleClearHistory}
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={onAuthSuccess}
      />
    </header>
  );
};

export default Header;