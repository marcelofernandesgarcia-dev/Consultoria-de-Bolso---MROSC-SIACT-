import React, { useState, useMemo } from 'react';
import { CalendarDays, AlertTriangle, CheckCircle2, Clock, Download } from 'lucide-react';
import { format, addMonths, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Prazo {
  titulo: string;
  data: Date;
  fundamento: string;
  tipo: 'critico' | 'importante' | 'informativo';
  descricao: string;
}

function diasRestantes(data: Date): number {
  return Math.ceil((data.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}

export function CalendarioObrigacoes() {
  const [dataInicio, setDataInicio] = useState('');
  const [prazoMeses, setPrazoMeses] = useState(12);
  const [periodicidade, setPeriodicidade] = useState<'mensal' | 'trimestral'>('mensal');

  const prazos = useMemo<Prazo[]>(() => {
    if (!dataInicio) return [];

    const inicio = new Date(dataInicio + 'T00:00:00');
    const fim = addMonths(inicio, prazoMeses);
    const encerramento = fim;
    const lista: Prazo[] = [];

    // Relatórios periódicos de execução
    if (periodicidade === 'mensal') {
      for (let m = 1; m <= prazoMeses; m++) {
        const data = addDays(addMonths(inicio, m), -1);
        lista.push({
          titulo: `Relatório de Execução — Mês ${m}`,
          data,
          fundamento: 'Art. 66, Lei 13.019/2014',
          tipo: 'importante',
          descricao: 'Enviar relatório mensal de execução ao fiscal da parceria.',
        });
      }
    } else {
      for (let t = 1; t * 3 <= prazoMeses; t++) {
        const data = addDays(addMonths(inicio, t * 3), -1);
        lista.push({
          titulo: `Relatório de Execução — ${t}º Trimestre`,
          data,
          fundamento: 'Art. 66, Lei 13.019/2014',
          tipo: 'importante',
          descricao: 'Enviar relatório trimestral de execução ao fiscal.',
        });
      }
    }

    // Prestação de contas intermediária (se prazo > 12 meses)
    if (prazoMeses > 12) {
      const pcIntermediaria = addMonths(inicio, 12);
      lista.push({
        titulo: 'Prestação de Contas Intermediária (Anual)',
        data: pcIntermediaria,
        fundamento: 'Art. 69, §3º, Lei 13.019/2014',
        tipo: 'critico',
        descricao: 'Obrigatória para parcerias com vigência superior a 12 meses. Prazo: até 30 dias após completar 12 meses.',
      });
    }

    // Término da parceria
    lista.push({
      titulo: 'Término da Vigência da Parceria',
      data: encerramento,
      fundamento: 'Art. 42, Lei 13.019/2014',
      tipo: 'critico',
      descricao: 'Data final de execução. Após este prazo, nenhuma nova despesa pode ser realizada com recursos da parceria.',
    });

    // Devolução do saldo (30 dias após término)
    lista.push({
      titulo: 'Devolução do Saldo Remanescente',
      data: addDays(encerramento, 30),
      fundamento: 'Art. 73, Lei 13.019/2014',
      tipo: 'critico',
      descricao: 'O saldo não utilizado deve ser devolvido ao órgão público em até 30 dias após o término.',
    });

    // Prestação de contas final (90 dias após término)
    lista.push({
      titulo: 'Prestação de Contas Final',
      data: addDays(encerramento, 90),
      fundamento: 'Art. 69, Lei 13.019/2014',
      tipo: 'critico',
      descricao: 'Prazo máximo de 90 dias após o término da parceria para entrega da prestação de contas final ao concedente.',
    });

    // Análise pelo órgão (até 150 dias da prestação de contas)
    lista.push({
      titulo: 'Prazo para Análise pelo Órgão Concedente',
      data: addDays(encerramento, 90 + 150),
      fundamento: 'Art. 71, Lei 13.019/2014',
      tipo: 'informativo',
      descricao: 'O órgão tem até 150 dias para analisar a prestação de contas após o recebimento.',
    });

    return lista.sort((a, b) => a.data.getTime() - b.data.getTime());
  }, [dataInicio, prazoMeses, periodicidade]);

  const corTipo = {
    critico: 'border-l-red-500 bg-red-50',
    importante: 'border-l-amber-500 bg-amber-50',
    informativo: 'border-l-blue-500 bg-blue-50',
  };

  const iconeTipo = {
    critico: <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />,
    importante: <Clock className="w-4 h-4 text-amber-500 shrink-0" />,
    informativo: <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #0369A1 45%, #0891B2 100%)' }}>
        <div className="px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <CalendarDays className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Calendário de Prazos</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Informe os dados da parceria e veja todos os prazos obrigatórios calculados automaticamente
            </p>
          </div>
        </div>
      </div>

      {/* Configurações */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <h2 className="font-bold text-slate-900">Dados da Parceria</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="data-inicio" className="block text-sm font-medium text-slate-700 mb-2">
              Data de Início da Vigência
            </label>
            <input
              id="data-inicio"
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="prazo-meses" className="block text-sm font-medium text-slate-700 mb-2">
              Prazo de Vigência (meses)
            </label>
            <input
              id="prazo-meses"
              type="number"
              min={1}
              max={60}
              value={prazoMeses}
              onChange={e => setPrazoMeses(Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Relatórios de Execução</label>
            <div className="flex gap-2">
              {(['mensal', 'trimestral'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriodicidade(p)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                    periodicidade === p ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {p === 'mensal' ? 'Mensal' : 'Trimestral'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legenda */}
      {prazos.length > 0 && (
        <>
          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Crítico — prazo legal imprescindível</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-500" /> Importante — relatório periódico</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Informativo — prazo do órgão</span>
            <button onClick={() => window.print()} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors print:hidden">
              <Download className="w-3.5 h-3.5" /> Exportar PDF
            </button>
          </div>

          <div className="space-y-3">
            {prazos.map((prazo, i) => {
              const dias = diasRestantes(prazo.data);
              return (
                <div key={i} className={`border-l-4 rounded-r-2xl p-4 ${corTipo[prazo.tipo]}`}>
                  <div className="flex items-start gap-3">
                    {iconeTipo[prazo.tipo]}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-sm">{prazo.titulo}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-slate-700">
                            {format(prazo.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                          {dias >= 0 ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              dias <= 15 ? 'bg-red-200 text-red-700' :
                              dias <= 30 ? 'bg-amber-200 text-amber-700' :
                              'bg-slate-200 text-slate-600'
                            }`}>
                              {dias === 0 ? 'Hoje!' : `${dias} dias`}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Concluído</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{prazo.descricao}</p>
                      <p className="text-xs text-indigo-600 font-medium mt-1">{prazo.fundamento}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!dataInicio && (
        <div className="text-center py-12 text-slate-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Informe a data de início para gerar o calendário</p>
        </div>
      )}
    </div>
  );
}
