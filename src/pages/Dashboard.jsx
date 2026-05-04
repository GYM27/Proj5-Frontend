import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";
import { useHeaderStore } from "../stores/HeaderStore";
import api from "../services/api";
import { Form } from "react-bootstrap";
import "../App.css";
import { FormattedMessage, useIntl } from "react-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * DASHBOARD - Centro de Comando Bridge CRM
 * ---------------------------------------
 * Monitorização global de Leads, Clientes e Equipa.
 */
const Dashboard = () => {
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
    inactiveUsers: 0,
    growthData: [],
    leadsGrowthData: [],
    usersGrowthData: [],
    topPerformers: [],
    meusLeads: 0,
    meusClientes: 0,
  });

  const [users, setUsers] = useState([]); // Lista para o filtro de Admin
  const [selectedUserId, setSelectedUserId] = useState(""); // ID do utilizador filtrado

  const navigate = useNavigate();
  const { userRole, isAuthenticated, firstName } = useUserStore();
  const { setHeader } = useHeaderStore();
  const intl = useIntl();

  // Carregar lista de utilizadores para o filtro (Só Admin)
  useEffect(() => {
    if (userRole === "ADMIN") {
      api("/users")
        .then(data => {
          // Validação defensiva: garantir que data é uma lista
          if (Array.isArray(data)) {
            const activeOnly = data.filter(u => u.state === "ACTIVE" || !u.state); 
            setUsers(activeOnly);
          }
        })
        .catch(err => console.error("Erro ao carregar utilizadores:", err));
    }
  }, [userRole]);

  const fetchDashboardData = useCallback(async (userId = "") => {
    if (!userRole) return;
    try {
      const url = userId ? `/dashboard/stats?userId=${userId}` : "/dashboard/stats";
      const statsData = await api(url);
      setStats({
        ...statsData,
        growthData: statsData.growthData || [],
        leadsGrowthData: statsData.leadsGrowthData || [],
        usersGrowthData: statsData.usersGrowthData || [],
        topPerformers: statsData.topPerformers || [],
      });
    } catch (error) {
      console.error("Erro no Dashboard:", error.message);
      if (error.message.includes("401")) {
        sessionStorage.clear();
        navigate("/login");
      }
    }
  }, [navigate, userRole]);

  useEffect(() => {
    const targetUser = users.find(u => u.id == selectedUserId);
    setHeader({
      title: intl.formatMessage({ id: "common.welcome" }, { name: firstName || "Utilizador" }),
      subtitle:
        userRole === "ADMIN"
          ? (selectedUserId && targetUser ? `A visualizar: ${targetUser.firstName} ${targetUser.lastName}` : intl.formatMessage({ id: "dashboard.admin_subtitle" }))
          : intl.formatMessage({ id: "dashboard.subtitle" }),
      showStats: false,
    });
    if (isAuthenticated) fetchDashboardData(selectedUserId);
  }, [fetchDashboardData, isAuthenticated, firstName, userRole, setHeader, selectedUserId, users]);

  // Taxa de Conversão
  const conversionRate =
    stats.leads > 0 ? ((stats.ganhos / stats.leads) * 100).toFixed(1) : 0;

  // Fusão de dados para o gráfico temporal
  const finalChartData = (() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().substring(0, 7));
    }

    return months.map((month) => ({
      name: month,
      leads: stats.leadsGrowthData.find((d) => d.date === month)?.count || 0,
      clientes: stats.growthData.find((d) => d.date === month)?.count || 0,
      users: stats.usersGrowthData?.find((d) => d.date === month)?.count || 0,
    }));
  })();

  const formatMonth = (isoMonth) => {
    const [year, month] = isoMonth.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("pt-PT", {
      month: "short",
      year: "2-digit",
    });
  };

  return (
    <div className="container-fluid mb-5">
      {/* FILTRO DE UTILIZADOR (SÓ ADMIN) */}
      {userRole === "ADMIN" && (
        <div className="row mb-4">
          <div className="col-md-4 col-lg-3">
            <div className="card p-3 border-0 shadow-sm bg-white" style={{ borderRadius: "12px" }}>
              <Form.Group>
                <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                  {intl.formatMessage({ id: "dashboard.view_dashboard_of" }, { default: "Visualizar Dashboard de:" })}
                </Form.Label>
                <Form.Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="border-0 bg-light fw-bold"
                  style={{ borderRadius: "8px", cursor: "pointer" }}
                >
                  <option value="">{intl.formatMessage({ id: "dashboard.global_view" }, { default: "Visão Global (Equipa)" })}</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      👤 {u.firstName} {u.lastName} ({u.username})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
          {selectedUserId && (
            <div className="col-md-8 col-lg-9 d-flex align-items-center">
              <div className="alert alert-info border-0 shadow-sm mb-0 w-100 py-2 rounded-3">
                <i className="bi bi-info-circle-fill me-2"></i>
                {intl.formatMessage({ id: "dashboard.viewing_user" }, { name: users.find(u => u.id == selectedUserId)?.firstName || "" })}
                <button
                  className="btn btn-link btn-sm text-info fw-bold text-decoration-none ms-2"
                  onClick={() => setSelectedUserId("")}
                >
                  {intl.formatMessage({ id: "dashboard.clear_filter" }, { default: "Limpar Filtro" })}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI CARDS (FUNIL) */}
      <div className="row g-3 mb-4 justify-content-center">
        {[
          { labelKey: "dashboard.kpi.new",      count: stats.novos,    color: "#5793f4", stateId: 1 },
          { labelKey: "dashboard.kpi.analysis", count: stats.analise,  color: "#f0f2d3", stateId: 2 },
          { labelKey: "dashboard.kpi.proposal", count: stats.propostas,color: "#e0ecff", stateId: 3 },
          { labelKey: "dashboard.kpi.won",      count: stats.ganhos,   color: "#d4edda", stateId: 4 },
          { labelKey: "dashboard.kpi.lost",     count: stats.perdidos,  color: "#f8d7da", stateId: 5 },
        ].map((item, index) => (
          <div key={index} className="col-md-2 col-sm-4 col-6">
            <div
              className="card text-center p-3 border-0 shadow-sm h-100 kpi-card"
              style={{ backgroundColor: item.color, cursor: "pointer" }}
              onClick={() => navigate(`/leads?state=${item.stateId}`)}
            >
              <div className="small fw-bold opacity-75">
                <FormattedMessage id={item.labelKey} />
              </div>
              <div className="display-6 fw-bold">{item.count}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MÉTRICAS SECUNDÁRIAS */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-sm bg-white h-100 text-center" style={{ borderRadius: "15px" }}>
            <h6 className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: "0.8rem" }}>
              <FormattedMessage id="dashboard.sales_efficiency" />
            </h6>
            <div className="h2 fw-bold mb-1" style={{ color: conversionRate > 30 ? "#10b981" : "#f59e0b" }}>
              {conversionRate}%
            </div>
            <div className="small text-muted mb-3">
              <FormattedMessage id="dashboard.conversion_rate" />
            </div>
            <div className="progress" style={{ height: "8px", borderRadius: "4px" }}>
              <div className="progress-bar" style={{ width: `${conversionRate}%`, backgroundColor: "#10b981" }}></div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-sm bg-white h-100 text-center" style={{ borderRadius: "15px", cursor: "pointer" }} onClick={() => navigate("/leads")}>
            <h6 className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: "0.8rem" }}>
              <FormattedMessage id="dashboard.total_leads" />
            </h6>
            <div className="h2 fw-bold text-primary">{stats.leads}</div>
            <div className="small text-muted"><FormattedMessage id="dashboard.leads_in_progress" /></div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-sm bg-white h-100 text-center" style={{ borderRadius: "15px", cursor: "pointer" }} onClick={() => navigate("/clients")}>
            <h6 className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: "0.8rem" }}>
              <FormattedMessage id="dashboard.total_clients" />
            </h6>
            <div className="h2 fw-bold text-success">{stats.clientes}</div>
            <div className="small text-muted"><FormattedMessage id="dashboard.active_accounts" /></div>
          </div>
        </div>
      </div>

      {/* GRÁFICO DE CRESCIMENTO */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card p-4 border-0 shadow-sm bg-white" style={{ borderRadius: "15px" }}>
            <h5 className="fw-bold mb-4 px-2">
              <FormattedMessage id="dashboard.growth_chart" />
            </h5>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={finalChartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatMonth}
                  fontSize={12}
                />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip
                  labelFormatter={formatMonth}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={40}
                  iconType="circle"
                />
                <Bar
                  name="Leads"
                  dataKey="leads"
                  fill="#0d6efd"
                  radius={[4, 4, 0, 0]}
                  barSize={25}
                />
                <Bar
                  name="Clientes"
                  dataKey="clientes"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={25}
                />
                {userRole === "ADMIN" && (
                  <Bar
                    name="Equipa (Total)"
                    dataKey="users"
                    fill="#6f42c1"
                    radius={[4, 4, 0, 0]}
                    barSize={25}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* NOVO: GRÁFICO DE TOP PERFORMERS (SÓ ADMIN, VISÃO GLOBAL) */}
      {userRole === "ADMIN" && !selectedUserId && stats.topPerformers && stats.topPerformers.length > 0 && (
        <div className="row mb-5">
          <div className="col-12">
            <div
              className="card p-4 border-0 shadow-sm bg-white"
              style={{ borderRadius: "15px" }}
            >
              <h5 className="fw-bold mb-4 px-2 d-flex align-items-center">
                <i className="bi bi-trophy-fill text-warning me-2"></i>
                <FormattedMessage id="dashboard.top_performers" />
              </h5>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={stats.topPerformers.map(p => ({
                    ...p,
                    // Arredondar a taxa para ficar mais limpo
                    conversionRate: parseFloat(p.conversionRate.toFixed(1))
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                  <XAxis type="category" dataKey="username" axisLine={false} tickLine={false} fontSize={13} fontWeight="bold" />
                  <YAxis type="number" hide />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                    formatter={(value, name) => {
                      if (name === "conversionRate") return [`${value}%`, "Taxa de Conversão"];
                      if (name === "totalLeads") return [value, "Total de Leads"];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="conversionRate" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} label={{ position: 'top', formatter: (val) => `${val}%`, fill: '#6c757d', fontSize: 12, fontWeight: 'bold' }} />
                  {/* Incluímos o totalLeads apenas para estar disponível no Tooltip escondido das barras principais */}
                  <Bar dataKey="totalLeads" fill="transparent" barSize={0} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* GESTÃO DE EQUIPA (SÓ ADMIN) */}
      {userRole === "ADMIN" && (
        <>
          <h5 className="mb-4 fw-bold text-muted">
            <FormattedMessage id="dashboard.user_management" />
          </h5>
          <div className="row g-4">
            <div className="col-md-4">
              <div
                className="card p-3 border-0 shadow-sm bg-white"
                style={{
                  borderRadius: "12px",
                  borderLeft: "4px solid #6f42c1",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/users")}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-light p-3 rounded-circle">
                    <i className="bi bi-people-fill text-purple fs-4"></i>
                  </div>
                  <div>
                    <div className="small text-muted fw-bold">
                      <FormattedMessage id="dashboard.total_users" />
                    </div>
                    <div className="h4 mb-0 fw-bold">{stats.totalUsers} </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div
                className="card p-3 border-0 shadow-sm bg-white"
                style={{
                  borderRadius: "12px",
                  borderLeft: "4px solid #10b981",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-light p-3 rounded-circle">
                    <i className="bi bi-person-check-fill text-success fs-4"></i>
                  </div>
                  <div>
                    <div className="small text-muted fw-bold">
                      <FormattedMessage id="dashboard.active_users" />
                    </div>
                    <div className="h4 mb-0 fw-bold text-success">
                      {stats.confirmedUsers} Ativos
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div
                className="card p-3 border-0 shadow-sm bg-white"
                style={{
                  borderRadius: "12px",
                  borderLeft: "4px solid #dc3545ff", 
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-light p-3 rounded-circle">
                    <i className="bi bi-person-x-fill text-danger fs-4"></i>
                  </div>
                  <div>
                    <div className="small text-muted fw-bold">
                      <FormattedMessage id="dashboard.inactive_users" />
                    </div>
                    <div className="h4 mb-0 fw-bold text-danger">
                      {stats.inactiveUsers} Inativos
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
