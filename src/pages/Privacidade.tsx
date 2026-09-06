import React from 'react';
import { ShieldCheck, Database, Scale, Clock, UserCheck, Mail, MessageSquareWarning, AlertTriangle } from 'lucide-react';

const CONTATO_EMAIL = 'marcelo.garcia@gestao.gov.br';

export function Privacidade() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0369A1 100%)' }}>
        <div className="px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Privacidade e Proteção de Dados</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              O que este sistema coleta, por quê, e como exercer seus direitos sob a LGPD
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 leading-relaxed">
          O SIACT-MROSC está em fase de validação (MVP). Esta página documenta a prática atual do sistema com transparência — inclusive onde algo ainda não está formalizado — e será atualizada conforme o projeto evolui para produção.
        </p>
      </div>

      {/* O que coletamos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3" style={{ background: 'linear-gradient(to right, #EFF6FF, #F0F9FF)' }}>
          <Database className="w-4 h-4 text-blue-600 shrink-0" />
          <h2 className="text-sm font-bold text-slate-800">O que coletamos e por quê</h2>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">O sistema processa os seguintes dados, sempre vinculados ao propósito de apoiar a compreensão e execução do MROSC (Lei 13.019/2014):</p>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <span><strong>CNPJ e dados públicos de OSCs</strong> — consultados na Receita Federal e na base do IPEA (Mapa das OSC), para as ferramentas de busca e Simulador de Elegibilidade.</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <span><strong>Nomes e vínculos de dirigentes</strong> — quando você digita ou cola essa informação na tela de Governança, para verificar impedimentos legais (Art. 39, Lei 13.019/2014). Esse texto é enviado à IA (Anthropic Claude) para análise.</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <span><strong>E-mail de login</strong> — usado pela autenticação (Supabase), inclusive no modo de demonstração anônima.</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <span><strong>Conteúdo de documentos enviados</strong> (PDF de editais, propostas, pareceres) — processado para extração de texto e análise por IA, não armazenado além da sessão de análise.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Base legal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3" style={{ background: 'linear-gradient(to right, #EFF6FF, #F0F9FF)' }}>
          <Scale className="w-4 h-4 text-blue-600 shrink-0" />
          <h2 className="text-sm font-bold text-slate-800">Base legal (LGPD)</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            O tratamento de nomes e vínculos de dirigentes tem como base legal o <strong>cumprimento de obrigação legal ou regulatória</strong> (Art. 7º, II, Lei nº 13.709/2018 — LGPD): a verificação de impedimentos de dirigentes é exigida diretamente pelo <strong>Art. 39 da Lei nº 13.019/2014</strong> antes da celebração de qualquer parceria. Os demais dados (CNPJ, dados públicos de OSCs) são informação pública de pessoa jurídica, não pessoal.
          </p>
          <p className="text-xs text-slate-400 mt-3">Esta é a base legal identificada tecnicamente para o funcionamento do sistema — sujeita à confirmação formal pela área jurídica do órgão antes da produção plena.</p>
        </div>
      </div>

      {/* Retenção */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3" style={{ background: 'linear-gradient(to right, #EFF6FF, #F0F9FF)' }}>
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          <h2 className="text-sm font-bold text-slate-800">Retenção e compartilhamento</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            Os dados ficam armazenados no banco de dados do sistema (Supabase), com acesso restrito por perfil e autenticação obrigatória. Textos enviados às ferramentas de IA são compartilhados com a Anthropic (provedora do modelo Claude) para gerar a análise solicitada.
          </p>
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
            <strong>Item ainda pendente de confirmação:</strong> o prazo exato de retenção desses dados pela Anthropic ainda não foi formalmente confirmado com o fornecedor. Essa confirmação está registrada como pendência no plano de conformidade do sistema.
          </p>
        </div>
      </div>

      {/* Direitos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3" style={{ background: 'linear-gradient(to right, #ECFDF5, #F0FDF4)' }}>
          <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <h2 className="text-sm font-bold text-slate-800">Seus direitos (Art. 18, LGPD)</h2>
        </div>
        <div className="p-6 space-y-2">
          <p className="text-sm text-slate-600 leading-relaxed mb-2">Se seus dados pessoais (ex.: seu nome, como dirigente de uma OSC) foram processados por este sistema, você tem direito a:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {['Confirmação de que seus dados são tratados', 'Acesso aos dados processados', 'Correção de dados incompletos ou incorretos', 'Eliminação dos dados tratados', 'Informação sobre com quem os dados são compartilhados', 'Revogação do consentimento, quando aplicável'].map((direito) => (
              <li key={direito} className="flex items-start gap-2 text-sm text-slate-700 bg-emerald-50 rounded-lg px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                {direito}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contato */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3" style={{ background: 'linear-gradient(to right, #FEF3C7, #FFFBEB)' }}>
          <Mail className="w-4 h-4 text-amber-600 shrink-0" />
          <h2 className="text-sm font-bold text-slate-800">Como exercer seus direitos</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            Envie sua solicitação (acesso, correção ou exclusão de dados) para:
          </p>
          <a href={`mailto:${CONTATO_EMAIL}?subject=${encodeURIComponent('SIACT-MROSC — Solicitação LGPD')}`} className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl transition-colors">
            <Mail className="w-4 h-4" /> {CONTATO_EMAIL}
          </a>
          <p className="text-xs text-slate-400 mt-3">Inclua seu nome completo e qual OSC ou parceria está relacionada ao pedido, para agilizar a localização dos dados.</p>
        </div>
      </div>

      {/* Contestação */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3" style={{ background: 'linear-gradient(to right, #FEF3C7, #FFFBEB)' }}>
          <MessageSquareWarning className="w-4 h-4 text-amber-600 shrink-0" />
          <h2 className="text-sm font-bold text-slate-800">Contestar uma análise de IA ou reportar um erro</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            Lembre-se: <strong>nenhuma análise de IA deste sistema é uma decisão final</strong> — é sempre um apoio à decisão do usuário ou do gestor público responsável. Se você identificou um erro, viés ou resultado incorreto numa análise (Parecer Técnico, Simulador de Elegibilidade, Governança, Cotação Prévia etc.), reporte para o mesmo canal acima:
          </p>
          <a href={`mailto:${CONTATO_EMAIL}?subject=${encodeURIComponent('SIACT-MROSC — Contestação de análise de IA')}`} className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl transition-colors">
            <Mail className="w-4 h-4" /> {CONTATO_EMAIL}
          </a>
          <p className="text-xs text-slate-400 mt-3">Descreva a tela usada, o que foi digitado e qual resultado você considera incorreto — isso ajuda a revisar o caso e melhorar o sistema.</p>
        </div>
      </div>
    </div>
  );
}
