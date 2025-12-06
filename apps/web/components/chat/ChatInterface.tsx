/**
 * ChatInterface
 *
 * Main chat UI component
 * Manages conversation flow and message display
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageWithComponent } from './MessageWithComponent';
import { SmoothText } from './SmoothText';
import { useDualStreamUI } from '@/hooks/useDualStreamUI';
import { ErrorBoundary } from '@/components/generative/ErrorBoundary';
import type { ChatMessage } from '@/lib/types';

interface ChatInterfaceProps {
  showHeader?: boolean;
  className?: string;
}

export function ChatInterface({ showHeader = true, className = '' }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { state, sendMessage, retry, reset } = useDualStreamUI(sessionId);

  /**
   * Handle send message
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || state.isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Send to API with current sessionId
    await sendMessage(input, sessionId || undefined);
  };


  /**
   * Handle stream completion - commit message
   */
  const prevLoadingRef = useRef(false);
  useEffect(() => {
    // Detect transition from loading=true to loading=false
    if (prevLoadingRef.current && !state.isLoading && state.textSummary) {
      console.log('[ChatInterface] Stream complete, committing message');
      console.log('[DEBUG] Committing State:', {
        text: state.textSummary,
        componentSpec: state.componentSpec
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: state.textSummary,
        component: state.componentSpec || undefined,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      reset(); // Clear streaming state
    }
    prevLoadingRef.current = state.isLoading;
  }, [state.isLoading, state.textSummary, state.componentSpec, reset]);

  /**
   * Scroll to bottom
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, state.textSummary]); // Scroll on new messages or streaming updates

  const handleNewChat = () => {
    setMessages([]);
    setSessionId('');
    reset();
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              GenUI Chat 💬
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Ask me anything, I'll generate interactive components
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg
                       hover:bg-gray-300 transition-colors"
            >
              New Chat
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && !state.isLoading && !state.textSummary ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">
                Start a conversation 👋
              </p>
              <p className="text-gray-400 text-sm">
                Type a message to see GenUI in action
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Committed History */}
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                <div
                  className={`max-w-md ${message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-2xl rounded-tr-none px-4 py-2'
                    : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-none p-4 max-w-2xl'
                    }`}
                >
                  {message.role === 'user' ? (
                    <p className="text-sm">{message.content}</p>
                  ) : message.component ? (
                    <ErrorBoundary
                      componentName="Message"
                      fallback={
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-amber-800 text-sm">
                            Không thể hiển thị tin nhắn. Vui lòng thử lại.
                          </p>
                        </div>
                      }
                    >
                      <MessageWithComponent
                        textSummary={message.content}
                        componentSpec={message.component}
                      />
                    </ErrorBoundary>
                  ) : (
                    <p className="text-sm text-gray-800">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Current Streaming Message */}
            {(state.isLoading || state.textSummary) && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-tl-none p-4 max-w-2xl">
                  {state.componentSpec ? (
                    <ErrorBoundary componentName="StreamingMessage" fallback={<div>Error rendering component</div>}>
                      <MessageWithComponent
                        textSummary={state.textSummary}
                        componentSpec={state.componentSpec}
                      />
                    </ErrorBoundary>
                  ) : (
                    <p className="text-sm text-gray-800">
                      <SmoothText text={state.textSummary} />
                      {state.isLoading && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-gray-400 animate-pulse" />}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error message with retry button */}
      {state.error && (
        <div className="bg-red-50 border-t border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <p className="text-sm text-red-700">
                {state.error.includes('fetch') || state.error.includes('network')
                  ? 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.'
                  : state.error.includes('timeout')
                    ? 'Yêu cầu quá lâu. Vui lòng thử lại.'
                    : 'Đã xảy ra lỗi. Vui lòng thử lại.'}
              </p>
            </div>
            <div className="flex gap-2">
              {state.retryCount < 2 && (
                <button
                  onClick={() => retry()}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Thử lại ({2 - state.retryCount} lần)
                </button>
              )}
              <button
                onClick={() => reset()}
                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={state.isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={state.isLoading || !input.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg
                       hover:bg-blue-600 disabled:bg-gray-300
                       disabled:cursor-not-allowed transition-colors"
          >
            {state.isLoading && (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {state.isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
