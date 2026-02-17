import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

/* ─── mock data (replace with real API calls) ─── */
const generateDailyData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    hour: i === 0 ? "12am" : i < 12 ? `${i}am` : i === 12 ? "12pm" : `${i - 12}pm`,
    tasks: Math.floor(Math.random() * 8),
    completed: Math.floor(Math.random() * 5),
  }));

const generateMonthlyData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month) => ({
    month,
    tasks: Math.floor(Math.random() * 40 + 10),
    completed: Math.floor(Math.random() * 30 + 5),
    pending: Math.floor(Math.random() * 15),
  }));
};

const generateHeatmapData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeks = 12;
  return Array.from({ length: weeks }, (_, w) =>
    days.map((day) => ({
      day,
      week: w,
      count: Math.floor(Math.random() * 6),
    }))
  );
};

const heatColor = (count, theme) => {
  if (count === 0) return theme === "dark" ? "#1e1e2b" : "#f1f3f5";
  const opacity = [0.2, 0.4, 0.6, 0.8, 1][Math.min(count - 1, 4)];
  return `rgba(99,102,241,${opacity})`;
};

/* ─── custom tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-color)",
      borderRadius: 10,
      padding: "10px 16px",
      fontSize: 13,
      color: "var(--text-primary)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

/* ─── stat card ─── */
const StatCard = ({ label, value, accent, delay }) => (
  <div
    style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-color)",
      borderRadius: 16,
      padding: "24px 28px",
      position: "relative",
      overflow: "hidden",
      animation: `fadeInUp 0.5s ease-out ${delay}s both`,
      boxShadow: "0 2px 8px var(--shadow-color)",
      transition: "transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s ease",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-6px)";
      e.currentTarget.style.boxShadow = `0 16px 32px var(--shadow-color), 0 0 0 1px ${accent}44`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 8px var(--shadow-color)";
    }}
  >
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: accent }} />
    <div style={{ fontSize: 36, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -1 }}>{value}</div>
    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 6 }}>{label}</div>
  </div>
);

/* ─── section header ─── */
const SectionHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.5 }}>{title}</h2>
    {subtitle && <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{subtitle}</p>}
  </div>
);

/* ─── main component ─── */
function Calendar() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [collapsed, setCollapsed] = useState(false);
  const [dailyData] = useState(generateDailyData);
  const [monthlyData] = useState(generateMonthlyData);
  const [heatmap] = useState(generateHeatmapData);
  const [activeView, setActiveView] = useState("daily");
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const totalTasks = monthlyData.reduce((s, d) => s + d.tasks, 0);
  const totalDone = monthlyData.reduce((s, d) => s + d.completed, 0);
  const streak = 7;
  const rate = Math.round((totalDone / totalTasks) * 100);

  const tabStyle = (active) => ({
    padding: "8px 20px",
    borderRadius: 10,
    border: active ? "none" : "1px solid var(--border-color)",
    background: active ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "var(--bg-card)",
    color: active ? "#fff" : "var(--text-secondary)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: active ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes slideInLeft {
          from { opacity:0; transform:translateX(-30px); }
          to   { opacity:1; transform:translateX(0); }
        }

        :root { --accent-primary:#6366f1; --accent-secondary:#8b5cf6; }

        [data-theme="dark"] {
          --bg-primary:#0a0a0f; --bg-secondary:#13131a; --bg-tertiary:#1a1a24;
          --bg-card:#1e1e2b; --bg-hover:#252532;
          --text-primary:#ffffff; --text-secondary:#a1a1aa; --text-tertiary:#71717a;
          --border-color:rgba(255,255,255,0.08); --shadow-color:rgba(0,0,0,0.4);
        }
        [data-theme="light"] {
          --bg-primary:#f8f9fa; --bg-secondary:#ffffff; --bg-tertiary:#f1f3f5;
          --bg-card:#ffffff; --bg-hover:#e9ecef;
          --text-primary:#1a1a1a; --text-secondary:#6c757d; --text-tertiary:#adb5bd;
          --border-color:#dee2e6; --shadow-color:rgba(0,0,0,0.08);
        }

        * { margin:0; padding:0; box-sizing:border-box; }
        body {
          font-family:'Inter',-apple-system,sans-serif;
          background:var(--bg-primary);
          color:var(--text-primary);
          -webkit-font-smoothing:antialiased;
        }

        .cal-dashboard { display:flex; min-height:100vh; }

        /* ── sidebar ── */
        .sidebar {
          width: 280px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          padding: 32px 24px;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }
        .sidebar::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:200px;
          background:radial-gradient(circle at 50% 0%,rgba(99,102,241,0.08),transparent 70%);
          pointer-events:none;
        }
        .cal-dashboard.collapsed .sidebar { width: 80px; }
        .cal-dashboard.collapsed .sidebar-text { opacity:0; pointer-events:none; }

        .logo {
          font-size:24px; font-weight:700; color:var(--text-primary);
          margin-bottom:40px; display:flex; align-items:center; gap:12px;
          letter-spacing:-0.02em; animation:slideInLeft 0.5s ease-out;
          position:relative; z-index:1;
        }
        .nav-item {
          display:flex; align-items:center; padding:14px 16px;
          margin-bottom:8px; border-radius:12px;
          text-decoration:none; color:var(--text-secondary);
          font-size:15px; font-weight:500;
          transition:all 0.2s cubic-bezier(0.4,0,0.2,1);
          position:relative;
        }
        .nav-item:hover { background:var(--bg-hover); color:var(--text-primary); transform:translateX(4px); }
        .nav-item.active {
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          color:#fff;
          box-shadow:0 4px 12px rgba(99,102,241,0.25);
        }
        .nav-item.active::before {
          content:''; position:absolute; left:-24px; top:50%;
          transform:translateY(-50%); width:4px; height:24px;
          background:#6366f1; border-radius:0 4px 4px 0;
        }

        .sidebar-divider {
          height:1px; background:var(--border-color);
          margin:24px 0;
        }
        .sidebar-label {
          font-size:11px; font-weight:600; color:var(--text-tertiary);
          text-transform:uppercase; letter-spacing:0.08em;
          padding:0 16px; margin-bottom:12px;
        }

        .note-item {
          display:flex; align-items:flex-start; gap:10px;
          padding:10px 12px; border-radius:10px;
          background:var(--bg-tertiary); border:1px solid var(--border-color);
          margin-bottom:8px; cursor:pointer;
          transition:all 0.2s ease;
        }
        .note-item:hover { border-color:#6366f1; transform:translateX(4px); }
        .note-dot {
          width:7px; height:7px; border-radius:50%;
          background:#6366f1; margin-top:5px; flex-shrink:0;
        }
        .note-title { font-size:13px; font-weight:500; color:var(--text-primary); }
        .note-time  { font-size:11px; color:var(--text-tertiary); margin-top:2px; }

        /* ── main ── */
        .cal-main {
          flex:1; padding:40px;
          background:var(--bg-primary);
          overflow-y:auto;
        }
        .cal-main::-webkit-scrollbar { width:6px; }
        .cal-main::-webkit-scrollbar-thumb { background:var(--bg-hover); border-radius:4px; }

        .navbar {
          display:flex; align-items:center; gap:16px;
          margin-bottom:36px; animation:fadeInUp 0.5s ease-out;
        }
        .navbar h1 {
          font-size:30px; font-weight:700;
          color:var(--text-primary); letter-spacing:-0.03em; flex:1;
        }
        .icon-btn {
          width:44px; height:44px; display:flex; align-items:center; justify-content:center;
          background:var(--bg-card); border:1px solid var(--border-color);
          border-radius:12px; cursor:pointer; font-size:18px;
          color:var(--text-primary);
          transition:all 0.2s ease;
        }
        .icon-btn:hover { border-color:#6366f1; transform:translateY(-2px); }

        .stats-grid {
          display:grid; grid-template-columns:repeat(4,1fr); gap:20px;
          margin-bottom:36px;
        }

        .chart-section {
          background:var(--bg-card); border:1px solid var(--border-color);
          border-radius:20px; padding:28px;
          margin-bottom:24px;
          box-shadow:0 2px 8px var(--shadow-color);
          animation:fadeInUp 0.5s ease-out 0.3s both;
        }
        .chart-tabs { display:flex; gap:10px; margin-bottom:28px; }

        .heatmap-grid {
          display:grid;
          grid-template-columns:repeat(12,1fr);
          gap:4px;
        }
        .heatmap-col { display:flex; flex-direction:column; gap:4px; }
        .heatmap-cell {
          width:100%; aspect-ratio:1;
          border-radius:3px;
          transition:transform 0.15s ease, box-shadow 0.15s ease;
          cursor:pointer;
        }
        .heatmap-cell:hover { transform:scale(1.3); box-shadow:0 0 8px rgba(99,102,241,0.5); }

        .legend { display:flex; align-items:center; gap:8px; margin-top:16px; justify-content:flex-end; }
        .legend-label { font-size:12px; color:var(--text-tertiary); }
        .legend-swatch { width:14px; height:14px; border-radius:3px; }

        @media (max-width:1100px) { .stats-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:768px)  {
          .sidebar { display:none; }
          .cal-main { padding:20px; }
          .stats-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className={`cal-dashboard ${collapsed ? "collapsed" : ""}`}>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="logo">
            <span>🔥</span>
            <span className="sidebar-text">TaskMaster</span>
          </div>

          <nav style={{ position: "relative", zIndex: 1 }}>
            <Link to="/"       className={`nav-item ${location.pathname === "/"         ? "active" : ""}`}><span className="sidebar-text">📋 Task Manager</span></Link>
            <Link to="/notes"  className={`nav-item ${location.pathname === "/notes"    ? "active" : ""}`}><span className="sidebar-text">📝 Notes</span></Link>
            <Link to="/calendar" className={`nav-item ${location.pathname === "/calendar" ? "active" : ""}`}><span className="sidebar-text">📅 Activity</span></Link>
          </nav>

          <div className="sidebar-divider" />
          <div className="sidebar-label sidebar-text">Quick Notes</div>

          {[
            { title: "Meeting tomorrow", time: "2h ago" },
            { title: "Buy groceries",    time: "5h ago" },
            { title: "Call dentist",     time: "1d ago" },
          ].map((n) => (
            <div className="note-item" key={n.title}>
              <div className="note-dot" />
              <div>
                <div className="note-title sidebar-text">{n.title}</div>
                <div className="note-time  sidebar-text">{n.time}</div>
              </div>
            </div>
          ))}
        </aside>

        {/* ── MAIN ── */}
        <main className="cal-main">

          {/* navbar */}
          <div className="navbar">
            <h1>Activity</h1>
            <button
              className="icon-btn"
              onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
              title="Toggle theme"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button className="icon-btn" onClick={() => setCollapsed(c => !c)}>☰</button>
          </div>

          {/* stat cards */}
          <div className="stats-grid">
            <StatCard label="Total Tasks"     value={totalTasks} accent="#6366f1" delay={0.05} />
            <StatCard label="Completed"       value={totalDone}  accent="#10b981" delay={0.10} />
            <StatCard label="Completion Rate" value={`${rate}%`} accent="#f59e0b" delay={0.15} />
            <StatCard label="Day Streak 🔥"   value={streak}     accent="#ef4444" delay={0.20} />
          </div>

          {/* daily / monthly charts */}
          <div className="chart-section">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <SectionHeader
                title={activeView === "daily" ? "Today's Activity" : "Monthly Overview"}
                subtitle={activeView === "daily" ? "Tasks created & completed per hour" : "Monthly task trends for the year"}
              />
              <div className="chart-tabs">
                <button style={tabStyle(activeView === "daily")}   onClick={() => setActiveView("daily")}>Daily</button>
                <button style={tabStyle(activeView === "monthly")} onClick={() => setActiveView("monthly")}>Monthly</button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              {activeView === "daily" ? (
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gDone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="tasks"     name="Created"   stroke="#6366f1" strokeWidth={2} fill="url(#gTasks)" dot={false} activeDot={{ r: 5, fill: "#6366f1" }} />
                  <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} fill="url(#gDone)"  dot={false} activeDot={{ r: 5, fill: "#10b981" }} />
                </AreaChart>
              ) : (
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="tasks"     name="Created"   fill="#6366f1" radius={[6,6,0,0]} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6,6,0,0]} />
                  <Bar dataKey="pending"   name="Pending"   fill="#f59e0b" radius={[6,6,0,0]} />
                </BarChart>
              )}
            </ResponsiveContainer>

            {/* legend */}
            <div style={{ display: "flex", gap: 20, marginTop: 16, justifyContent: "center" }}>
              {[
                { color: "#6366f1", label: "Created"   },
                { color: "#10b981", label: "Completed" },
                ...(activeView === "monthly" ? [{ color: "#f59e0b", label: "Pending" }] : []),
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* activity heatmap */}
          <div className="chart-section">
            <SectionHeader title="Activity Heatmap" subtitle="Task completions over the last 12 weeks" />

            <div style={{ display: "flex", gap: 4 }}>
              {/* day labels */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 0, marginRight: 4 }}>
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                  <div key={d} style={{ fontSize: 10, color: "var(--text-tertiary)", height: 18, display: "flex", alignItems: "center" }}>{d}</div>
                ))}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 4 }}>
                  {heatmap.map((week, wi) => (
                    <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {week.map((cell, di) => (
                        <div
                          key={di}
                          className="heatmap-cell"
                          style={{ background: heatColor(cell.count, theme), height: 18 }}
                          title={`${cell.day}: ${cell.count} task${cell.count !== 1 ? "s" : ""}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Less</span>
              {[0, 1, 2, 3, 5].map((c) => (
                <div key={c} style={{ width: 14, height: 14, borderRadius: 3, background: heatColor(c, theme), border: c === 0 ? "1px solid var(--border-color)" : "none" }} />
              ))}
              <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>More</span>
            </div>
          </div>

          {/* weekly trend line */}
          <div className="chart-section" style={{ animation: "fadeInUp 0.5s ease-out 0.5s both" }}>
            <SectionHeader title="Weekly Completion Trend" subtitle="Rolling 7-day completion rate" />
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="url(#gLine)"
                  strokeWidth={3}
                  dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "var(--bg-card)" }}
                  activeDot={{ r: 6, fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </main>
      </div>
    </>
  );
}

export default Calendar;