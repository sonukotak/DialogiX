import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, DatasetInfo, ChartData, Insight, ChatHistory, User } from './types';
import { processFile, generateInsights, generateCharts, getAIResponse } from './utils/dataProcessing';
import { saveHistory, loadHistory, addMessageToHistory } from './utils/historyManager';
import { getCurrentUser } from './utils/supabase';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Dashboard from './components/Dashboard';
import SaveDashboardModal from './components/SaveDashboardModal';
import AuthModal from './components/AuthModal';
import Sidebar from './components/Sidebar';
import { Toaster } from 'react-hot-toast';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to DialogixAI! Upload a CSV or Excel file to analyze your data, or ask me a question about data analysis.',
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard'>('chat');
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo | undefined>(undefined);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [, setShowAuthModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user session on mount
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email || '',
          created_at: new Date(currentUser.created_at)
        });
      } else {
        setShowAuthModal(true);
      }
    };
    loadUser();
  }, []);

  // Load chat history on initial render
  useEffect(() => {
    if (user) {
      const history = loadHistory();
      if (history && history.messages.length > 0) {
        setMessages(history.messages);
        if (history.currentDataset) {
          setDatasetInfo(history.currentDataset);
          setActiveTab('chat');
        }
      }
    }
  }, [user]);

  // Save chat history whenever messages or dataset changes
  useEffect(() => {
    if (messages.length > 1 && user) {
      const history: ChatHistory = {
        messages,
        currentDataset: datasetInfo
      };
      saveHistory(history);
    }
  }, [messages, datasetInfo, user]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => addMessageToHistory(prevMessages, userMessage));
    setIsProcessing(true);
    
    try {
      let responseContent = '';
      
      if (datasetInfo) {
        responseContent = await getAIResponse(content, datasetInfo);
      } else {
        responseContent = 'Please upload a CSV or Excel file first so I can analyze your data and answer questions about it.';
      }
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => addMessageToHistory(prevMessages, assistantMessage));
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => addMessageToHistory(prevMessages, errorMessage));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: `Uploaded file: ${file.name}`,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => addMessageToHistory(prevMessages, userMessage));
    setIsProcessing(true);
    
    const processingMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: `Processing ${file.name}... This may take a moment.`,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => addMessageToHistory(prevMessages, processingMessage));
    
    try {
      const info = await processFile(file);
      setDatasetInfo(info);
      
      const dataInsights = generateInsights(info.data);
      setInsights(dataInsights);
      
      const dataCharts = generateCharts(info.data);
      setCharts(dataCharts);
      
      const successMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `
## File Processed Successfully!

I've analyzed your data from **${file.name}** (${info.rowCount} rows, ${info.columnCount} columns).

You can now:
1. Ask me questions about your data
2. View the dashboard for visualizations and insights
3. Get detailed analysis of specific aspects

What would you like to know about your data?
        `,
        timestamp: new Date()
      };
      
      setMessages(prev => prev.map(msg => 
        msg.id === processingMessage.id ? successMessage : msg
      ));
      
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error processing file:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `Sorry, I encountered an error processing ${file.name}. Please make sure it's a valid CSV or Excel file and try again.`,
        timestamp: new Date()
      };
      
      setMessages(prev => prev.map(msg => 
        msg.id === processingMessage.id ? errorMessage : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearHistory = () => {
    const confirmMessage: Message = {
      id: uuidv4(),
      role: 'system',
      content: 'Chat history has been cleared.',
      timestamp: new Date()
    };
    
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Welcome to DialogixAI! Upload a CSV or Excel file to analyze your data, or ask me a question about data analysis.',
        timestamp: new Date()
      },
      confirmMessage
    ]);
    
    setDatasetInfo(undefined);
    setInsights([]);
    setCharts([]);
    setActiveTab('chat');
    
    localStorage.removeItem('dialogix_chat_history');
  };

  const handleAuthSuccess = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      setUser({
        id: currentUser.id,
        email: currentUser.email || '',
        created_at: new Date(currentUser.created_at)
      });
      setShowAuthModal(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <AuthModal
          isOpen={true}
          onClose={() => {}}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
     
      <Sidebar 
         isOpen={sidebarOpen} 
         onToggle={() => setSidebarOpen(!sidebarOpen)} 
         onClearHistory={handleClearHistory} 
         hasDataset={!!datasetInfo} 
         messages={messages} // Pass messages to Sidebar
/>

      
      <div className="flex-1 flex flex-col">
        <Toaster position="top-right" />
        <Header 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          isDashboardAvailable={!!datasetInfo}
          onClearHistory={handleClearHistory}
          user={user}
          onAuthSuccess={handleAuthSuccess}
          onSaveDashboard={() => setShowSaveModal(true)}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'chat' ? (
            <>
              <div className="flex-1 overflow-y-auto bg-gray-800">
                <div className="max-w-4xl mx-auto">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <ChatInput 
                onSendMessage={handleSendMessage} 
                onFileUpload={handleFileUpload}
                isProcessing={isProcessing}
              />
            </>
          ) : (
            <Dashboard 
              datasetInfo={datasetInfo}
              insights={insights}
              charts={charts}
              isVisible={activeTab === 'dashboard'}
            />
          )}
        </main>

        {user && datasetInfo && (
          <SaveDashboardModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            userId={user.id}
            datasetInfo={datasetInfo}
            insights={insights}
            charts={charts}
          />
        )}
      </div>
    </div>
  );
}

export default App;