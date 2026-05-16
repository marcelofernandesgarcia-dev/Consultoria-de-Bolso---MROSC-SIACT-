import React, { useState } from 'react';
import { FileCheck, Download, CheckSquare, Square, Info } from 'lucide-react';

type Fase = 'chamamento' | 'celebracao' | 'execucao' | 'prestacao';
type Porte = 'pequeno' | 'medio' | 'grande';

interface ItemChecklist {
  id: string;
  descricao: string;
  fundamento: string;
  obrigatorio: boolean;
  dica?: string;
}

const CHECKLISTS: Record<string, ItemChecklist[]> = {
  chamamento: [
    { id: 'c1', descricao: 'Cópia do estatuto social registrado em cartório', fundamento: 'Art. 33, I, Lei 13.019/2014', obrigatorio: true, dica: 'O estatuto deve conter a finalidade compatível com o objeto do chamamento.' },
    { id: 'c2', descricao: 'Ata de eleição da diretoria vigente', fundamento: 'Art. 33, II, Lei 13.019/2014', obrigatorio: true },
    { id: 'c3', descricao: 'CNPJ ativo e compatível com o objeto', fundamento: 'Art. 33, III, Lei 13.019/2014', obrigatorio: true, dica: 'O CNAE deve ser compatível com a atividade da parceria.' },
    { id: 'c4', descricao: 'Certidão Negativa de Débitos Trabalhistas (CNDT)', fundamento: 'Art. 33, VII, Lei 13.019/2014', obrigatorio: true },
    { id: 'c5', descricao: 'Certidão de regularidade fiscal federal (CND)', fundamento: 'Art. 33, V, Lei 13.019/2014', obrigatorio: true },
    { id: 'c6', descricao: 'Certidão de regularidade fiscal estadual e municipal', fundamento: 'Art. 33, VI, Lei 13.019/2014', obrigatorio: true },
    { id: 'c7', descricao: 'Comprovante de existência há no mínimo 3 anos', fundamento: 'Art. 33, V, §1º, Lei 13.019/2014', obrigatorio: true, dica: 'Data de abertura registrada no cartão CNPJ ou certidão de registro.' },
    { id: 'c8', descricao: 'Experiência prévia na realização do objeto (conforme edital)', fundamento: 'Art. 24, §1º, Lei 13.019/2014', obrigatorio: false, dica: 'Apresentar relatórios de projetos anteriores similares.' },
    { id: 'c9', descricao: 'Declaração de ciência e concordância com as cláusulas do edital', fundamento: 'Decreto 11.948/2024', obrigatorio: true },
  ],
  celebracao: [
    { id: 'cel1', descricao: 'Plano de Trabalho aprovado pelo órgão concedente', fundamento: 'Art. 22, Lei 13.019/2014', obrigatorio: true },
    { id: 'cel2', descricao: 'Conta bancária específica para a parceria', fundamento: 'Art. 51, Lei 13.019/2014', obrigatorio: true, dica: 'Conta corrente aberta exclusivamente para movimentação dos recursos.' },
    { id: 'cel3', descricao: 'Declaração dos dirigentes sobre impedimentos (Art. 39)', fundamento: 'Art. 39, Lei 13.019/2014', obrigatorio: true, dica: 'Cada dirigente deve declarar que não é cônjuge/parente de agente público.' },
    { id: 'cel4', descricao: 'Comprovante de inscrição no Mapa das OSCs (IPEA)', fundamento: 'Decreto 8.726/2016', obrigatorio: false },
    { id: 'cel5', descricao: 'Certidões negativas atualizadas (federais, estaduais, municipais)', fundamento: 'Art. 33, Lei 13.019/2014', obrigatorio: true },
    { id: 'cel6', descricao: 'Portaria de designação do fiscal da parceria', fundamento: 'Art. 67, Lei 13.019/2014', obrigatorio: true, dica: 'Responsabilidade do órgão público — verificar se já foi designado.' },
  ],
  execucao: [
    { id: 'ex1', descricao: 'Notas fiscais de todas as despesas realizadas', fundamento: 'Art. 65, Lei 13.019/2014', obrigatorio: true, dica: 'Guardar original físico e digitalizar para o sistema.' },
    { id: 'ex2', descricao: 'Extratos bancários mensais da conta da parceria', fundamento: 'Art. 65, §1º, Lei 13.019/2014', obrigatorio: true },
    { id: 'ex3', descricao: 'Cotação prévia de preços para compras acima do limite', fundamento: 'Art. 45, Lei 13.019/2014', obrigatorio: true, dica: 'Mínimo de 3 cotações para compras acima de R$ 2.000,00.' },
    { id: 'ex4', descricao: 'Folha de pagamento de pessoal custeado com recursos da parceria', fundamento: 'Art. 46, Lei 13.019/2014', obrigatorio: false, dica: 'Necessário se o plano de trabalho prever pagamento de pessoal.' },
    { id: 'ex5', descricao: 'Relatório de execução das atividades (mensal ou conforme plano)', fundamento: 'Art. 66, Lei 13.019/2014', obrigatorio: true },
    { id: 'ex6', descricao: 'Comprovante de aplicação dos rendimentos (quando houver)', fundamento: 'Art. 53, Lei 13.019/2014', obrigatorio: false },
    { id: 'ex7', descricao: 'Registro fotográfico ou midiático das ações', fundamento: 'Decreto 11.948/2024', obrigatorio: false, dica: 'Recomendado como evidência de execução das atividades.' },
  ],
  prestacao: [
    { id: 'pc1', descricao: 'Relatório de execução do objeto (resultados x metas)', fundamento: 'Art. 69, Lei 13.019/2014', obrigatorio: true, dica: 'Compare cada meta prevista no Plano de Trabalho com o resultado alcançado.' },
    { id: 'pc2', descricao: 'Relatório de execução financeira (receitas x despesas)', fundamento: 'Art. 69, II, Lei 13.019/2014', obrigatorio: true },
    { id: 'pc3', descricao: 'Extrato bancário completo do período da parceria', fundamento: 'Art. 69, III, Lei 13.019/2014', obrigatorio: true },
    { id: 'pc4', descricao: 'Notas fiscais e recibos de todas as despesas', fundamento: 'Art. 69, IV, Lei 13.019/2014', obrigatorio: true },
    { id: 'pc5', descricao: 'Comprovante de devolução do saldo remanescente (se houver)', fundamento: 'Art. 73, Lei 13.019/2014', obrigatorio: true, dica: 'Saldo não utilizado deve ser devolvido em até 30 dias após o término.' },
    { id: 'pc6', descricao: 'Comprovante de publicação do relatório em sítio eletrônico', fundamento: 'Art. 11, Lei 13.019/2014', obrigatorio: true, dica: 'Parcerias acima de R$ 600 mil exigem publicação em sítio oficial.' },
    { id: 'pc7', descricao: 'Declaração de que não houve desvio de finalidade', fundamento: 'Art. 77, Lei 13.019/2014', obrigatorio: true },
    { id: 'pc8', descricao: 'Certidões negativas atualizadas', fundamento: 'Art. 33, Lei 13.019/2014', obrigatorio: true },
  ],
};

const SIMPLIFICADOS_DECRETO: string[] = ['c4', 'c5', 'c6', 'c8', 'ex3'];

export function ChecklistDocumentos() {
  const [fase, setFase] = useState<Fase>('chamamento');
  const [porte, setPorte] = useState<Porte>('medio');
  const [marcados, setMarcados] = useState<Set<string>>(new Set());

  const itens = CHECKLISTS[fase] ?? [];
  const itensVisiveis = porte === 'pequeno'
    ? itens.filter(i => !SIMPLIFICADOS_DECRETO.includes(i.id) || i.obrigatorio)
    : itens;

  const toggle = (id: string) => {
    setMarcados(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const progresso = itensVisiveis.length > 0
    ? Math.round((marcados.size / itensVisiveis.filter(i => i.obrigatorio).length) * 100)
    : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #0D9488 100%)' }}>
        <div className="px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <FileCheck className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Checklist de Documentos</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Selecione a fase e o porte para gerar seu checklist com fundamento legal
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Fase da Parceria</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([
              { id: 'chamamento', label: 'Chamamento' },
              { id: 'celebracao', label: 'Celebração' },
              { id: 'execucao', label: 'Execução' },
              { id: 'prestacao', label: 'Prestação de Contas' },
            ] as const).map(f => (
              <button
                key={f.id}
                onClick={() => { setFase(f.id); setMarcados(new Set()); }}
                className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                  fase === f.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Porte da Parceria</label>
          <div className="flex gap-2">
            {([
              { id: 'pequeno', label: 'Pequeno (< R$ 120k)', sub: 'Decreto 11.948/2024 — simplificado' },
              { id: 'medio', label: 'Médio (R$ 120k–600k)', sub: 'Regras padrão' },
              { id: 'grande', label: 'Grande (> R$ 600k)', sub: 'Com requisitos adicionais' },
            ] as const).map(p => (
              <button
                key={p.id}
                onClick={() => setPorte(p.id)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-medium border-2 transition-all ${
                  porte === p.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="font-bold">{p.label}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{p.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progresso */}
      {itensVisiveis.filter(i => i.obrigatorio).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-slate-700">Itens obrigatórios confirmados</span>
            <span className="font-bold text-indigo-600">{Math.min(progresso, 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progresso, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">{itensVisiveis.length} documentos listados</h2>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors print:hidden"
          >
            <Download className="w-4 h-4" />
            Imprimir / Salvar PDF
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {itensVisiveis.map(item => (
            <div
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`flex items-start gap-4 p-5 cursor-pointer transition-colors ${marcados.has(item.id) ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
            >
              <div className="mt-0.5 shrink-0">
                {marcados.has(item.id)
                  ? <CheckSquare className="w-5 h-5 text-emerald-600" />
                  : <Square className="w-5 h-5 text-slate-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-2 flex-wrap">
                  <p className={`text-sm font-medium ${marcados.has(item.id) ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {item.descricao}
                  </p>
                  {!item.obrigatorio && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full shrink-0">opcional</span>
                  )}
                </div>
                <p className="text-xs text-indigo-600 font-medium mt-1">{item.fundamento}</p>
                {item.dica && (
                  <div className="flex items-start gap-1.5 mt-2 p-2 bg-amber-50 rounded-lg">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">{item.dica}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
