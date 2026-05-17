import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { MessageSquare, Send, Loader2, Bot, User, Sparkles, Paperclip } from 'lucide-react';
import Markdown from 'react-markdown';

const MASTER_PROMPT = `DIRETRIZ MESTRA DE ANÁLISE (Lei 13.019/2014 e Decreto 11.948/2024):
Você atua como auditor automatizado do MROSC. 
Ao receber o texto ou documento abaixo, siga EXATAMENTE estes passos (conforme PROMPTS_MROSC.md):
1. PENSAMENTO (CHAIN OF THOUGHT): Analise passo a passo a elegibilidade (Art. 33), documentação (Art. 26 do Dec. 11.948) e orçamentos (vedações do Art. 45 da Lei 13.019).
2. CITAÇÕES LEGAIS: Todo apontamento de "NÃO CONFORME" ou "RESSALVA" deve ser obrigatoriamente fundamentado no respectivo artigo.
3. ESTRUTURA DE DECISÃO: Caso necessário, defina o instrumento (Termo de Fomento para projetos da OSC, Termo de Colaboração para projetos da Administração, Acordo de Cooperação se não houver repasse).
4. SAÍDA PADRONIZADA: Formate a resposta indicando 1) Status Final, 2) Resumo da Análise e 3) Raciocínio (reasoning).

Obrigatório: No final da sua resposta, adicione rigorosamente as seguintes marcações para nosso sistema:
[CNPJ_EXTRAIDO]: <insira o CNPJ aqui se encontrar, ou 'NÃO INFORMADO'>
[STATUS_PARECER]: <insira 'CONFORME', 'NÃO CONFORME' ou 'RESSALVA'>

Analise o seguinte conteúdo de acordo com o protocolo acima:
`;

const PROMPTS = [
  { id: 1, fase: 'Fase de Seleção', texto: 'Quais os requisitos obrigatórios para uma OSC participar de um chamamento público segundo o MROSC?' },
  { id: 2, fase: 'Plano de Trabalho', texto: 'Como estruturar metas e indicadores de resultado de forma clara e objetiva?' },
  { id: 3, fase: 'Fase de Execução', texto: 'É permitido alterar o plano de trabalho durante a execução da parceria? Quais as regras?' },
  { id: 4, fase: 'Prestação de Contas', texto: 'Qual a diferença entre prestação de contas anual e final no MROSC?' }
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AssistenteSiact() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Olá! Sou o Assistente Especialista em MROSC. Como posso ajudar você hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, envie apenas arquivos PDF.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Falha ao processar PDF');
      const data = await response.json();
      const analiseAutomaticaPrompt = `Por favor, realize uma análise automática neste documento recebido em anexo, focando essencialmente no Nexo Causal e Conformidade Financeira (MROSC).\n\n### DOCUMENTO ###\n${data.text}`;
      
      // Fecha o loader apenas para simular transição limpa
      setLoading(false);
      
      // Inicia a função de chat passando o formulado com o documento para rodar a auditoria automaticamente
      await handleSend(analiseAutomaticaPrompt);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar o arquivo PDF.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const payloadMessage = `${MASTER_PROMPT}\n\nTEXTO DO USUÁRIO:\n${text}`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: payloadMessage,
          systemPrompt: MASTER_PROMPT, // Enviado para compatibilidade com rotas que suportem system_instruction
          rawInput: text
        })
      });

      if (!response.ok) throw new Error('Falha na comunicação');
      const data = await response.json();
      
      const responseText = data.reply || '';
      setMessages([...newMessages, { role: 'assistant', content: responseText }]);

      // Extração de metadados e salvamento da análise no Supabase
      try {
        if (import.meta.env.VITE_SUPABASE_URL) {
          const cnpjMatch = responseText.match(/\[CNPJ_EXTRAIDO\]:\s*([^\n]*)/i);
          const parecerMatch = responseText.match(/\[STATUS_PARECER\]:\s*([^\n]*)/i);
          
          const extraidoCnpj = cnpjMatch && !cnpjMatch[1].includes('NÃO INFORMADO') ? cnpjMatch[1].trim() : null;
          const extraidoParecer = parecerMatch ? parecerMatch[1].trim() : 'INDETERMINADO';

          await supabase.from('analises').insert({
            cnpj: extraidoCnpj,
            resultado_parecer: extraidoParecer,
            analise_texto: responseText,
            documento_original: text
          });
          console.log('Análise salva com sucesso no Supabase.');
        }
      } catch (dbError) {
        console.error('Falha ao salvar a análise no Supabase:', dbError);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua solicitação.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Sidebar with Prompts */}
      <div className="w-full md:w-80 glass-card rounded-2xl p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-500/10 p-2 rounded-xl">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Prompts Rápidos</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handleSend(prompt.texto)}
              disabled={loading}
              className="w-full text-left p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-white/5 transition-colors group"
            >
              <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">{prompt.fase}</span>
              <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-200">{prompt.texto}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-card rounded-2xl flex flex-col h-full overflow-hidden">
        <header className="p-6 border-b border-white/10 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Assistente SIACT</h1>
            <p className="text-xs text-slate-400 font-medium">Especialista MROSC (Lei 13.019/14)</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-slate-700' : 'bg-indigo-500/20'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-slate-300" /> : <Bot className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-slate-800/60 border border-white/5 text-slate-300 rounded-tl-sm'
              }`}>
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="prose prose-sm max-w-none prose-invert">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-white/5 rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-sm text-slate-400">Analisando legislação...</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-slate-900/50">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex gap-3 max-w-4xl mx-auto"
          >
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="px-4 py-3 bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors flex items-center justify-center h-[50px] self-end"
              title="Anexar PDF"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Digite sua dúvida sobre o MROSC ou cole um documento..."
              className="flex-1 px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[50px] max-h-[200px]"
              rows={2}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center h-[50px] self-end"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
