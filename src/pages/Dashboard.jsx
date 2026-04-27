import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";
import { useHeaderStore } from "../stores/HeaderStore"; // Usar a Store do cabeçalho
import api from "../services/api";
import "../App.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

/**
 * O meu "Centro de Comando". 
 * É aqui que monitorizo a saúde do negócio. 
 * O código adapta-se: se eu for Admin, vejo a empresa toda; 
 * se for Vendedor, foco-me apenas nos meus números.
 */
const Dashboard = () => {
  // ESTADO DOS INDICADORES: Inicializados a zero para garantir uma UI limpa durante o fetch.
  const [stats, setStats] = useState({
    novos: 0,
    analise: 0,
    propostas: 0,
    ganhos: 0,
    perdidos: 0,
    leads: 0,
    clientes: 0,
    totalUsers: 0,
    confirmedUsers: 0,
  });

  const navigate = useNavigate();

  // CONTEXTO DO UTILIZADOR (REATIVIDADE):
  // Extraímos os dados da Store. O componente irá reagir automaticamente
  // assim que o 'userRole' for preenchido após o Login.
  const { userRole, isAuthenticated, firstName } = useUserStore();

  /**
   * LÓGICA DE DADOS DINÂMICA (REGRA DE NEGÓCIO - 5%):
   * Esta função carrega os dados dependendo da sessão do utilizador.
   */
  const fetchDashboardData = useCallback(async () => {
    if (!userRole) return;

    try {
      // Usa o novo endpoint que já retorna as estatísticas agregadas
      const statsData = await api("/dashboard/stats");

      // PROCESSAMENTO: Atribui diretamente os valores agregados pelo backend
      setStats({
        novos: statsData.novos || 0,
        analise: statsData.analise || 0,
        propostas: statsData.propostas || 0,
        ganhos: statsData.ganhos || 0,
        perdidos: statsData.perdidos || 0,
        leads: statsData.leads || 0,
        clientes: statsData.clientes || 0,
        totalUsers: statsData.totalUsers || 0,
        confirmedUsers: statsData.confirmedUsers || 0,
      });
    } catch (error) {
      console.error("Erro no Dashboard:", error.message);

      /**
       * GESTÃO DE SESSÃO EXPIRADA (SEGURANÇA - 2%):
       * Se o token falhar (401), limpamos o sessionStorage e expulsamos para o Login.
       */
      if (error.message.includes("401") || error.message.includes("Sessão")) {
        sessionStorage.clear();
        navigate("/login");
      }
    }
  }, [navigate, userRole]);

  const { setHeader } = useHeaderStore();

  /**
   * CICLO DE VIDA E SINCRONIZAÇÃO:
   * O Dashboard "acorda" assim que o utilizador está autenticado.
   */
  useEffect(() => {
    let isMounted = true;

    // DEFINE O CABEÇALHO NO LAYOUT UNIFICADO
    setHeader({
      title: `Olá, ${firstName || "Utilizador"}`,
      subtitle: userRole === "ADMIN" ? "Painel de Administração Global" : "O seu resumo de vendas de hoje",
      showStats: false
    });

    if (isMounted && isAuthenticated) {
      fetchDashboardData();
    }

    return () => { isMounted = false; };
  }, [fetchDashboardData, isAuthenticated, firstName, userRole, setHeader]);

  const pieData = [
    { name: 'Novos', value: stats.novos, color: '#0d6efd' },
    { name: 'Análise', value: stats.analise, color: '#6610f2' },
    { name: 'Propostas', value: stats.propostas, color: '#fd7e14' },
    { name: 'Ganhos', value: stats.ganhos, color: '#198754' },
    { name: 'Perdidos', value: stats.perdidos, color: '#dc3545' },
  ];

  return (
      <div className="container-fluid mb-5">
        {/* O CABEÇALHO FOI MOVIDO PARA O MAINLAYOUT PARA EVITAR DESLOCAÇÕES */}

        {/* FUNIL DE VENDAS: Cards clicáveis que aplicam filtros na navegação */}
        <div className="row g-3 mb-4 justify-content-center">
          {[
            { label: "Novos Leads", count: stats.novos, color: "#e0ecff", stateId: 1 },
            { label: "Em Análise", count: stats.analise, color: "#e0ecff", stateId: 2 },
            { label: "Propostas", count: stats.propostas, color: "#e0ecff", stateId: 3 },
            { label: "Ganhos", count: stats.ganhos, color: "#d4edda", stateId: 4 },
            { label: "Perdidos", count: stats.perdidos, color: "#f8d7da", stateId: 5 },
          ].map((item, index) => (
              <div key={index} className="col-md-2 col-sm-4 col-6">
                <div
                    className="card text-center p-3 border-0 shadow-sm h-100 kpi-card"
                    style={{ backgroundColor: item.color, cursor: "pointer" }}
                    onClick={() => navigate(`/leads?state=${item.stateId}`)}
                >
                  <div className="small fw-bold opacity-75">{item.label}</div>
                  <div className="display-6 fw-bold">{item.count}</div>
                </div>
              </div>
          ))}
        </div>

        {/* FUNIL DE VENDAS (VISUAL): Agora disponível para todos */}
        <div className="row g-4 mb-4">
          <div className="col-md-7">
            <div className="card p-4 border-0 shadow-sm bg-white h-100" style={{ borderRadius: '15px' }}>
              <h5 className="fw-bold mb-4">O Meu Funil de Vendas</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pieData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-md-5">
            <div className="row g-3">
              <div className="col-12">
                <div
                    className="card p-4 border-0 shadow-sm bg-white"
                    style={{ cursor: "pointer", borderLeft: "5px solid #6366f1", borderRadius: '12px' }}
                    onClick={() => navigate("/leads")}
                >
                  <div className="small fw-bold text-uppercase text-muted mb-1">Total de Oportunidades</div>
                  <div className="h2 fw-bold text-indigo">{stats.leads}</div>
                </div>
              </div>
              <div className="col-12">
                <div
                    className="card p-4 border-0 shadow-sm bg-white"
                    style={{ cursor: "pointer", borderLeft: "5px solid #10b981", borderRadius: '12px' }}
                    onClick={() => navigate("/clients")}
                >
                  <div className="small fw-bold text-uppercase text-muted mb-1">Total de Clientes</div>
                  <div className="h2 fw-bold text-success">{stats.clientes}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECÇÃO EXCLUSIVA DE ADMIN: Gráficos e Stats Extra */}
        {userRole === "ADMIN" && (
          <>
            <h4 className="mt-5 mb-4">Visão Global do Administrador</h4>
            <div className="row g-4">
              <div className="col-md-3">
                <div className="card text-center p-4 border-0 shadow-sm bg-white" style={{ borderLeft: "5px solid #6f42c1" }} onClick={() => navigate("/users")}>
                  <div className="h6 opacity-75">Total Utilizadores</div>
                  <div className="display-6 fw-bold text-purple">{stats.totalUsers}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center p-4 border-0 shadow-sm bg-white" style={{ borderLeft: "5px solid #20c997" }}>
                  <div className="h6 opacity-75">Contas Confirmadas</div>
                  <div className="display-6 fw-bold text-teal">{stats.confirmedUsers}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card p-3 border-0 shadow-sm bg-white h-100">
                  <h6 className="text-center opacity-75 mb-3">Distribuição de Leads</h6>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
  );
};

export default Dashboard;