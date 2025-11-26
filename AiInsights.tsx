import React, { useState, useEffect, useRef } from 'react';
import { Reservation } from '@/types';
import { generateShiftBriefing, chatWithManagerAssistant } from '@/services/geminiService';
import ReactMarkdown from 'react-markdown'; // Actually, we'll avoid external heavy deps if not needed, but rendering MD is good. I will use simple formatting.

interface AiInsightsProps {
  reservations: Reservation[];
}

export const AiInsights: React.FC<AiInsightsProps> = ({ reservations }) => {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleGenerateBriefing = async () => {
    setLoadingBriefing(true);
    const result = await generateShiftBriefing(reservations);
    setBriefing(result);
    setLoadingBriefing(false);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    const response = await chatWithManagerAssistant(userMsg, reservations);
    setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setChatLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      
      {/* Left: Shift Briefing */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-clipboard-check text-orange-500"></i>
              Pre-Shift Briefing
            </h2>
            <p className="text-sm text-slate-500">AI analysis of today's workload</p>
          </div>
          <button 
            onClick={handleGenerateBriefing}
            disabled={loadingBriefing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loadingBriefing ? (
              <><i className="fas fa-spinner fa-spin"></i> Analyzing...</>
            ) : (
              <><i className="fas fa-magic"></i> Generate Report</>
            )}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
          {!briefing ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl">
                <i className="fas fa-sparkles text-slate-300"></i>
              </div>
              <p className="max-w-xs">Click "Generate Report" to let the AI analyze your {reservations.length} reservations and prepare you for the shift.</p>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-sans text-sm">
                {/* Simple Markdown rendering replacement */}
                {briefing.split('\n').map((line, i) => {
                   if (line.startsWith('**') && line.endsWith('**')) return <h3 key={i} className="text-lg font-bold text-slate-900 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                   if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-slate-900 mb-4">{line.replace('# ', '')}</h1>;
                   if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-slate-800 mt-6 mb-3">{line.replace('## ', '')}</h2>;
                   if (line.startsWith('- ')) return <li key={i} className="ml-4 text-slate-700 mb-1">{line.replace('- ', '')}</li>;
                   if (line.trim() === '') return <br key={i} />;
                   return <p key={i} className="mb-2">{line.replace(/\*\*/g, '')}</p>;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: AI Assistant Chat */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-comments text-indigo-500"></i>
            Manager Assistant
          </h2>
          <p className="text-sm text-slate-500">Ask about guests, tables, or advice</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
          {chatHistory.length === 0 && (
            <div className="text-center text-slate-400 mt-10">
              <p>Ask me anything about tonight's service.</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <button onClick={() => setChatInput("Who are the VIPs tonight?")} className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full hover:border-indigo-300 transition">"Who are the VIPs tonight?"</button>
                <button onClick={() => setChatInput("Draft a welcome message for table 4")} className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full hover:border-indigo-300 transition">"Draft message for table 4"</button>
              </div>
            </div>
          )}
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleChat} className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type your question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
            />
            <button 
              type="submit" 
              className="bg-indigo-600 text-white rounded-lg w-10 flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-50"
              disabled={chatLoading}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};