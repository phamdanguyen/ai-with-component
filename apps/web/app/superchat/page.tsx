import { ChatInterface } from '@/components/chat/ChatInterface';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'UniAI Super Chat',
    description: 'Next-gen Generative UI Chat Interface',
};

export default function SuperChatPage() {
    return (
        <div className="h-screen flex flex-col bg-slate-50">
            <header className="flex-none p-4 border-b bg-white flex items-center gap-4 shadow-sm">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    UniAI Super Chat
                </h1>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">B2C Mode</span>
            </header>
            <main className="flex-1 overflow-hidden relative">
                <ChatInterface showHeader={false} className="h-full" />
            </main>
        </div>
    );
}
