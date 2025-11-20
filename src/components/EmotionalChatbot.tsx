import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Sparkles, Heart, Brain, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  formattedText?: React.ReactNode;
}

interface EmotionalChatbotProps {
  mood?: string;
  context?: string;
  onClose: () => void;
}

const formatBotResponse = (text: string) => {
  const paragraphs = text.split('\n\n');
  
  return paragraphs.map((paragraph, index) => {
    if (paragraph.startsWith('- ')) {
      const items = paragraph.split('\n- ').filter(item => item.trim());
      return (
        <ul key={index} className="list-disc pl-5 space-y-1 mb-3">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }
    
    if (paragraph.match(/^\d+\. /)) {
      const items = paragraph.split(/\n\d+\. /).filter(item => item.trim());
      return (
        <ol key={index} className="list-decimal pl-5 space-y-1 mb-3">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    }
    
    return <p key={index} className="mb-3">{paragraph}</p>;
  });
};

const EmotionalChatbot = ({ mood, context, onClose }: EmotionalChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `Hello! I'm here to provide emotional support and listen to whatever you'd like to share. ${mood ? `I understand you're feeling ${mood} right now.` : ''} How can I help you today?`,
      formattedText: `Hello! I'm here to provide emotional support and listen to whatever you'd like to share. ${mood ? `I understand you're feeling ${mood} right now.` : ''} How can I help you today?`,
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(msg => msg.id !== 'welcome')
        .map(msg => ({
          role: msg.isUser ? "user" : "model",
          text: msg.text,
        }));

      const { data, error } = await supabase.functions.invoke('emotional-chat', {
        body: {
          history: history,
          message: inputMessage,
          mood: mood,
          context: context,
        },
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        formattedText: formatBotResponse(data.reply),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        formattedText: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  const handleClose = () => {
    onClose(); // Call parent callback to close chatbot
    navigate(location.pathname, { replace: true }); // Navigate to current route
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 p-6 text-white overflow-hidden">
          <div className="absolute top-2 right-20 opacity-20">
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>
          <div className="absolute bottom-4 left-32 opacity-15">
            <Heart className="h-6 w-6 animate-bounce" />
          </div>
          <div className="absolute top-8 left-16 opacity-10">
            <Brain className="h-10 w-10 animate-pulse" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">Emotional Support Chat</h3>
                <p className="text-purple-100 flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>I'm here to listen and support you</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-all duration-200 hover:scale-110 border border-white/30"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-purple-50/20">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-6 py-4 rounded-3xl shadow-lg border transition-all duration-200 hover:scale-[1.02] ${
                  message.isUser
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-200 shadow-purple-200/50'
                    : 'bg-white/80 backdrop-blur-sm text-gray-800 border-white/50 shadow-gray-200/50'
                }`}
              >
                <div className="text-sm leading-relaxed font-medium">
                  {message.formattedText || message.text}
                </div>
                <p
                  className={`text-xs mt-2 flex items-center space-x-1 ${
                    message.isUser ? 'text-purple-200' : 'text-gray-500'
                  }`}
                >
                  <span>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white/80 backdrop-blur-sm text-gray-800 px-6 py-4 rounded-3xl shadow-lg border border-white/50 flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-6 bg-gradient-to-r from-white/90 to-purple-50/90 backdrop-blur-sm border-t border-white/30">
          <div className="flex space-x-4 items-end">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind... ✨"
                className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-purple-200/50 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 resize-none transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-sm"
                rows={2}
                disabled={isLoading}
              />
              <div className="absolute bottom-2 right-2 opacity-30">
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
            >
              <Send className="h-5 w-5" />
              {!isLoading && <span className="font-medium">Send</span>}
            </button>
          </div>

          {/* Mood display */}
          {mood && (
            <div className="mt-4 flex items-center justify-center">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border border-purple-200/50 shadow-sm">
                <p className="text-sm text-purple-700 font-medium flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Current mood: {mood}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionalChatbot;