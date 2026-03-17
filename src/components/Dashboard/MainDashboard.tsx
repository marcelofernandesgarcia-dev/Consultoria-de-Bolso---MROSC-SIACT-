import React, { useEffect, useState } from 'react';
import { BarChart, CheckCircle2, AlertTriangle, XCircle, FileText, ArrowRight, Bell, User, HelpCircle, BookOpen, ShieldCheck, Info, X } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface DashboardStats {
  total: number;
  approved: number;
  warning: number;
  rejected: number;
  growth: {
    total: number;
    approved: number;
    warning: number;
    rejected: number;
  };
}

interface RecentAnalysis {
  id: number;
  document_name: string;
  status: 'CONFORME' | 'RESSALVA' | 'NAO_CONFORME';
  date: string;
  type: string;
}

export function MainDashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data.stats);
        setRecent(data.recent);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFORME': return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> CONFORME</span>;
      case 'RESSALVA': return <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> RESSALVA</span>;
      case 'NAO_CONFORME': return <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> NÃO CONFORME</span>;
      default: return <span className="px-3 py-1 bg-slate-500/10 text-slate-500 rounded-full text-xs font-medium">PENDENTE</span>;
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Carregando dashboard...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <button 
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium transition-colors border border-slate-200 shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-cyan-600" /> Informações e Boas Práticas
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
              MF
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-900">Marcelo Fernandes</p>
              <p className="text-xs text-slate-500">Gestor de Parcerias</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">Análises Totais</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats?.total || 0}</h3>
            </div>
            <div className="p-2 bg-cyan-50 rounded-lg">
              <BarChart className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <span className="font-bold">↗ {stats?.growth.total}%</span> este mês
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">Aprovadas</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-1">{stats?.approved || 0}</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <span className="font-bold">↗ {stats?.growth.approved}%</span> este mês
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">Com Ressalvas</p>
              <h3 className="text-3xl font-bold text-amber-500 mt-1">{stats?.warning || 0}</h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <span className="font-bold">↗ {stats?.growth.warning}%</span> este mês
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">Não Conformes</p>
              <h3 className="text-3xl font-bold text-red-500 mt-1">{stats?.rejected || 0}</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <span className="font-bold">↗ {stats?.growth.rejected}%</span> este mês
          </p>
        </motion.div>
      </div>

      {/* Recent Analysis Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Análises Recentes</h3>
          <button className="text-sm text-cyan-600 hover:text-cyan-800 font-medium flex items-center gap-1">
            Ver todas <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {item.document_name}
                    <span className="block text-xs text-slate-400 font-normal mt-0.5">{item.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-cyan-600 hover:text-cyan-900">Ver Parecer</button>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                    Nenhuma análise recente encontrada. Inicie uma nova análise para ver os dados aqui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => onNavigate('MROSC')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-cyan-500 transition-all group text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-50">
            <FileText className="w-6 h-6 text-slate-600 group-hover:text-cyan-600" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Nova Análise</h4>
          <p className="text-sm text-slate-500 mb-4">Iniciar análise de conformidade de novo documento</p>
          <span className="inline-block w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium group-hover:bg-cyan-600 transition-colors">Começar</span>
        </button>

        <button className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-cyan-500 transition-all group text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-50">
            <BarChart className="w-6 h-6 text-slate-600 group-hover:text-cyan-600" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Relatórios</h4>
          <p className="text-sm text-slate-500 mb-4">Visualizar relatórios de conformidade e estatísticas</p>
          <span className="inline-block w-full py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium group-hover:border-cyan-200 group-hover:text-cyan-700 transition-colors">Acessar</span>
        </button>

        <button className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-cyan-500 transition-all group text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-50">
            <HelpCircle className="w-6 h-6 text-slate-600 group-hover:text-cyan-600" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Ajuda</h4>
          <p className="text-sm text-slate-500 mb-4">Acessar documentação e suporte técnico</p>
          <span className="inline-block w-full py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium group-hover:border-cyan-200 group-hover:text-cyan-700 transition-colors">Saiba Mais</span>
        </button>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-600" /> Informações e Boas Práticas
              </h3>
              <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <section className="space-y-3">
                <h4 className="text-cyan-700 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Alerta de Responsabilidade e "Alucinações"
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  O servidor público assume a autoria plena do resultado final. É obrigatória a revisão integral de todo conteúdo gerado pela IA. Instruímos o usuário a validar rigorosamente cada ponto factual e cálculo matemático apresentado, prevenindo inconsistências típicas de modelos de linguagem.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-cyan-700 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Segurança e LGPD
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  É terminantemente proibido o processamento de dados sensíveis reais (CPF, informações de saúde, endereços privados) sem a devida anonimização (Mascaramento/Tokenização) prévia. Utilize apenas dados públicos ou anonimizados.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-cyan-700 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Checklist de Ética e Imparcialidade
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Exigimos que o servidor confirme a inexistência de critérios discriminatórios ou preconceitos (Viés de Representatividade ou Seleção) antes da exportação de qualquer documento. A análise deve ser estritamente baseada em critérios objetivos.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-cyan-700 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Verificação de Vedações
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Lembre-se de checar manualmente a presença de agentes públicos na diretoria da OSC ou outras vedações legais que possam impedir a celebração da parceria, conforme a legislação vigente (Art. 39 da Lei 13.019).
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-cyan-700 font-bold flex items-center gap-2">
                  <Info className="w-4 h-4" /> Transparência Administrativa
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Toda saída documental que utilizar subsídios desta ferramenta deve conter obrigatoriamente a nota: <span className="italic text-cyan-700">"Parte do conteúdo gerado com o auxílio de Inteligência Artificial (SIACT-MROSC) e revisado tecnicamente pela equipe responsável."</span>
                </p>
              </section>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowInfo(false)}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-cyan-500/20"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
