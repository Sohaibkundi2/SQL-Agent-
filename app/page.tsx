'use client';

import { useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  query?: string;
  explanation?: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add AI message
      const aiMessage: Message = {
        role: 'assistant',
        content: data.message,
        query: data.query,
        explanation: data.explanation
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error.message}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔮 SQL Query Generator
          </h1>
          <p className="text-gray-600">
            Describe what data you need, and I'll generate the SQL query for you
          </p>
          
          {/* Database Schema Info */}
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold">
              📊 View Database Schema
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg font-mono text-xs  text-gray-500">
              <div className="mb-2">
                <strong>customers:</strong> id, name, email, total_spent, created_at
              </div>
              <div>
                <strong>orders:</strong> id, customer_id, amount, order_date, status
              </div>
            </div>
          </details>
        </div>

        {/* Chat Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-2xl mb-6">👋 What data do you need?</p>
              <div className="text-left max-w-md mx-auto space-y-3 text-sm bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-700">Example queries:</p>
                <p>💡 "Show me all customers"</p>
                <p>💡 "Get the top 5 customers by spending"</p>
                <p>💡 "Find customers who spent more than $2000"</p>
                <p>💡 "Count total orders by status"</p>
                <p>💡 "Show customer names with their total order amounts"</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p>{msg.content}</p>
                    ) : (
                      <>
                        {msg.query ? (
                          <div>
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                💡 {msg.explanation}
                              </p>
                            </div>
                            
                            <div className="relative">
                              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
{msg.query}
                              </pre>
                              <button
                                onClick={() => copyToClipboard(msg.query!)}
                                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
                              >
                                📋 Copy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-xl p-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="Describe what data you need..."
              className="flex-1 p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-lg  text-gray-500"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? '⏳' : '✨'} Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}