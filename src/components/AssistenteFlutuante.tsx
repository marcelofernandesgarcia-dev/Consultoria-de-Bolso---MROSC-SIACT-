import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, Send, Loader2, User, Paperclip, BookOpen, Scale, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { type Modo, SISTEMA_PROMPT } from '../lib/assistentePrompts';
import { getManualContextForPath } from '../data/manual';
import { apiFetch } from '../lib/apiFetch';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGESTOES = [
  'Quais os requisitos obrigatórios para uma OSC participar de um chamamento público?',
  'Como estruturar metas e indicadores de resultado no Plano de Trabalho?',
  'É permitido alterar o plano de trabalho durante a execução da parceria?',
];

const MAX_PDF_SIZE = 10 * 1024 * 1024;

export function AssistenteFlutuante() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [modo, setModo] = useState<Modo>('simples');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Apenas arquivos PDF são aceitos.' }]);
      return;
    }
    if (file.size > MAX_PDF_SIZE) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Arquivo muito grande. O limite é 10MB.' }]);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      const response = await fetch('/api/parse-pdf', { method: 'POST', body: formData, signal: controller.signal });
      clearTimeout(timer);

      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data = await response.json();
      setInput(prev => prev + `\n\n### DOCUMENTO: ${file.name} ###\n${data.text}\n`);
    } catch (err: any) {
      const msg = err.name === 'AbortError' ? 'Tempo esgotado ao processar o PDF.' : `Erro ao processar PDF: ${err.message}`;
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Sem isso, o assistente não tem nenhuma noção da interface do app — só do direito —
      // e responde "não tenho essa informação" quando perguntado sobre a própria tela
      // (ex: "como uso a aba de governança?"). O contexto da tela atual, quando existe uma
      // entrada correspondente no manual, é anexado ao prompt de cada pergunta.
      const contextoTela = getManualContextForPath(location.pathname);
      const systemPrompt = contextoTela
        ? `${SISTEMA_PROMPT[modo]}\n\n${contextoTela}`
        : SISTEMA_PROMPT[modo];

      const response = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, systemPrompt }),
      });

      if (!response.ok) throw new Error('Falha na comunicação');
      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua solicitação.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 print:hidden">
      {/* ── Painel do chat ── */}
      {open && (
        <div
          className="fixed inset-0 sm:static sm:inset-auto sm:mb-3 w-full sm:w-[600px] max-w-full sm:max-w-[calc(100vw-2.5rem)] h-full sm:h-[720px] max-h-full sm:max-h-[calc(100vh-7rem)] bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border sm:border-slate-200 flex flex-col overflow-hidden"
          style={{ animation: 'assistente-in 180ms ease-out' }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3 shrink-0" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <Bot className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-none">Assistente SIACT</p>
              <p className="text-xs text-indigo-100 mt-0.5">Especialista em MROSC · Lei 13.019/14</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fechar assistente" className="text-white/70 hover:text-white transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modo de linguagem */}
          <div className="px-3 py-2 border-b border-slate-100 flex gap-1.5 shrink-0">
            <button
              onClick={() => setModo('simples')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                modo === 'simples' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Simples
            </button>
            <button
              onClick={() => setModo('tecnica')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                modo === 'tecnica' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <Scale className="w-3.5 h-3.5" /> Técnica
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {messages.length === 0 && (
              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl rounded-tl-sm p-3 leading-relaxed">
                    Olá! Sou o Assistente SIACT. Escolha uma pergunta rápida ou digite a sua dúvida sobre o MROSC.
                  </p>
                </div>
                <div className="pl-8 space-y-1.5">
                  {SUGESTOES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="w-full text-left text-xs text-slate-600 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-lg px-2.5 py-2.5 transition-colors flex items-start gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                  {msg.role === 'user' ? <User className="w-3 h-3 text-slate-600" /> : <Bot className="w-3 h-3 text-indigo-600" />}
                </div>
                <div className={`px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-indigo [&_h1]:text-base [&_h2]:text-base [&_h3]:text-sm [&_h1]:mt-2 [&_h2]:mt-2 [&_h3]:mt-1.5 [&_h1]:mb-1 [&_h2]:mb-1 [&_h3]:mb-1 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 max-w-[90%]">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-indigo-600" />
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span className="text-xs text-slate-500">Consultando legislação...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="p-2.5 border-t border-slate-100 flex gap-2 shrink-0"
          >
            <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors flex items-center justify-center shrink-0"
              title="Anexar PDF"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
              placeholder="Digite sua dúvida..."
              rows={1}
              disabled={loading}
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none resize-none max-h-20"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg transition-colors flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ── Botão flutuante (robozinho) — em mobile some quando o painel está em tela cheia, pois o header já tem um X ── */}
      <div className={`relative w-14 h-14 ${open ? 'hidden sm:block' : ''}`}>
        {/* Anel neon pulsante */}
        <span className="absolute inset-[-6px] rounded-full pointer-events-none" style={{ animation: 'neon-ring 2.2s ease-in-out infinite' }} />
        <button
          onClick={() => setOpen(o => !o)}
          title="Assistente SIACT"
          aria-label={open ? "Fechar assistente" : "Abrir Assistente SIACT"}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 relative"
          style={{
            background: 'linear-gradient(135deg, #6366F1, #4F46E5, #7C3AED)',
            animation: 'neon-glow 2.2s ease-in-out infinite',
          }}
        >
          {open ? <X className="w-6 h-6 text-white" /> : <Bot className="w-7 h-7 text-white" />}
          {!open && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
          )}
        </button>
      </div>

      <style>{`
        @keyframes assistente-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes neon-glow {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(129,140,248,0.7), 0 0 18px 4px rgba(168,85,247,0.5), 0 0 30px 8px rgba(34,211,238,0.35); }
          50%      { box-shadow: 0 0 14px 4px rgba(129,140,248,0.9), 0 0 28px 8px rgba(168,85,247,0.7), 0 0 44px 14px rgba(34,211,238,0.5); }
        }
        @keyframes neon-ring {
          0%, 100% { box-shadow: 0 0 0 2px rgba(34,211,238,0.4); opacity: 0.8; }
          50%      { box-shadow: 0 0 0 5px rgba(168,85,247,0.15); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
