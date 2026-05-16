import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Bot, User, Sparkles, Paperclip, BookOpen, Scale } from 'lucide-react';
import Markdown from 'react-markdown';

type Modo = 'simples' | 'tecnica';

const PROMPTS = [
  { id: 1, fase: 'Fase de Seleção', texto: 'Quais os requisitos obrigatórios para uma OSC participar de um chamamento público segundo o MROSC?' },
  { id: 2, fase: 'Plano de Trabalho', texto: 'Como estruturar metas e indicadores de resultado de forma clara e objetiva?' },
  { id: 3, fase: 'Fase de Execução', texto: 'É permitido alterar o plano de trabalho durante a execução da parceria? Quais as regras?' },
  { id: 4, fase: 'Prestação de Contas', texto: 'Qual a diferença entre prestação de contas anual e final no MROSC?' },
];

const SISTEMA_PROMPT: Record<Modo, string> = {
  simples: `Você é um consultor de linguagem simples especializado no Marco Regulatório das OSCs (Lei 13.019/2014 e Decreto 11.948/2024).
Responda de forma clara e direta, evitando termos jurídicos complexos. Use exemplos práticos e linguagem acessível para gestores de organizações da sociedade civil sem formação jurídica. Quando citar artigos da lei, explique o que eles significam na prática.`,
  tecnica: `Você é um especialista técnico-jurídico no Marco Regulatório das Organizações da Sociedade Civil (MROSC — Lei 13.019/2014, alterada pela Lei 13.204/2015, e Decreto 11.948/2024).
Responda com precisão técnica, citando artigos, incisos e parágrafos da legislação. Use terminologia jurídica adequada. Estruture a resposta com fundamento legal, análise e conclusão. Mencione orientações do TCU e CGU quando pertinentes.`,
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_PDF_SIZE = 10 * 1024 * 1024;

export function AssistenteSiact() {
  const [modo, setModo] = useState<Modo>('simples');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Olá! Sou o Assistente Especialista em MROSC. Escolha o modo de linguagem no topo e faça sua pergunta.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, systemPrompt: SISTEMA_PROMPT[modo] }),
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
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-50 p-2 rounded-xl">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Prompts Rápidos</h2>
        </div>

        {/* Modo de linguagem */}
        <div className="mb-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Modo de linguagem</p>
          <div className="flex gap-2">
            <button
              onClick={() => setModo('simples')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                modo === 'simples' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Simples
            </button>
            <button
              onClick={() => setModo('tecnica')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                modo === 'tecnica' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <Scale className="w-3.5 h-3.5" /> Técnica
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center">
            {modo === 'simples' ? 'Linguagem acessível, exemplos práticos' : 'Citações legais e terminologia jurídica'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handleSend(prompt.texto)}
              disabled={loading}
              className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors group"
            >
              <span className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">{prompt.fase}</span>
              <p className="text-sm text-slate-700 leading-relaxed group-hover:text-slate-900">{prompt.texto}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
        <header className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">Assistente SIACT</h1>
            <p className="text-xs text-slate-500 font-medium">Sistema Inteligente de Análise e Controle de Transferências da União · Lei 13.019/14</p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            modo === 'simples' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
          }`}>
            {modo === 'simples' ? '📗 Linguagem simples' : '⚖️ Linguagem técnica'}
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100'
              }`}>
                {msg.role === 'user'
                  ? <User className="w-4 h-4 text-slate-600" />
                  : <Bot className="w-4 h-4 text-indigo-600" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-sm'
              }`}>
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="prose prose-sm max-w-none prose-indigo">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="text-sm text-slate-500">Analisando legislação...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex gap-3 max-w-4xl mx-auto"
          >
            <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors flex items-center justify-center shadow-sm h-[50px] self-end"
              title="Anexar PDF"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); }
              }}
              placeholder="Digite sua dúvida sobre o MROSC..."
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm resize-none min-h-[50px] max-h-[200px]"
              rows={2}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center shadow-sm h-[50px] self-end"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
