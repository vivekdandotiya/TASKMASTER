import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

/* ─── heat color ─── */
const heatColor = (count, theme) => {
  if (count === 0) return theme === "dark" ? "#0d1117" : "#e8eff7";
  const opacity = [0.25, 0.45, 0.65, 0.82, 1][Math.min(count - 1, 4)];
  return `rgba(0, 212, 170, ${opacity})`;
};

/* ─── custom tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid rgba(0,212,170,0.2)",
      borderRadius: 10, padding: "10px 14px", fontSize: 12,
      color: "var(--text-primary)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <p style={{ fontWeight: 700, marginBottom: 6, fontFamily: "'Syne', sans-serif", color: "var(--accent-teal)" }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, marginBottom: 2 }}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, accent, delay }) => (
  <div
    style={{
      background: "var(--bg-card)", border: "1px solid var(--border-color)",
      borderRadius: 14, padding: "22px 24px", position: "relative",
      overflow: "hidden", animation: `fadeInUp 0.5s ease-out ${delay}s both`,
      boxShadow: "0 2px 8px var(--shadow-color)",
      transition: "transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s ease, border-color 0.25s ease",
      cursor: "default", fontFamily: "'Syne', sans-serif",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-6px)";
      e.currentTarget.style.boxShadow = `0 16px 32px rgba(0,0,0,0.5), 0 0 20px ${accent}22`;
      e.currentTarget.style.borderColor = `${accent}44`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "0 2px 8px var(--shadow-color)";
      e.currentTarget.style.borderColor = "";
    }}
  >
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: accent }} />
    <div style={{ fontSize: 36, fontWeight: 800, color: "var(--text-primary)", letterSpacing: -1, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6 }}>{label}</div>
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: 20, fontFamily: "'Syne', sans-serif" }}>
    <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", letterSpacing: -0.5 }}>{title}</h2>
    {subtitle && <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{subtitle}</p>}
  </div>
);

/* ══════════════════════════════════════════ */
function Calendar() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("daily");
  const location = useLocation();

  /* ── Real task data from API ── */
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/tasks`);
        setTasks(res.data);
      } catch (err) {
        console.log("Activity fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ── Derived stats from real tasks ── */
  const totalTasks     = tasks.length;
  const totalDone      = tasks.filter(t => t.completed).length;
  const totalPending   = tasks.filter(t => !t.completed).length;
  const rate           = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;

  /* streak — count consecutive days with completed tasks ending today */
  const streak = (() => {
    if (!tasks.length) return 0;
    const completedDates = new Set(
      tasks
        .filter(t => t.completed && t.updatedAt)
        .map(t => new Date(t.updatedAt).toISOString().split("T")[0])
    );
    let count = 0;
    const today = new Date();
    while (true) {
      const d = new Date(today);
      d.setDate(today.getDate() - count);
      const key = d.toISOString().split("T")[0];
      if (completedDates.has(key)) { count++; }
      else break;
      if (count > 365) break;
    }
    return count;
  })();

  /* ── Daily data (hourly breakdown for today) ── */
  const dailyData = Array.from({ length: 24 }, (_, i) => {
    const label = i === 0 ? "12am" : i < 12 ? `${i}am` : i === 12 ? "12pm" : `${i - 12}pm`;
    const created   = tasks.filter(t => {
      const d = new Date(t.createdAt);
      return d.toDateString() === new Date().toDateString() && d.getHours() === i;
    }).length;
    const completed = tasks.filter(t => {
      if (!t.completed || !t.updatedAt) return false;
      const d = new Date(t.updatedAt);
      return d.toDateString() === new Date().toDateString() && d.getHours() === i;
    }).length;
    return { hour: label, tasks: created, completed };
  });

  /* ── Monthly data (last 12 months) ── */
  const monthlyData = (() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months.map((month, mi) => {
      const monthTasks = tasks.filter(t => new Date(t.createdAt).getMonth() === mi);
      const done       = monthTasks.filter(t => t.completed).length;
      return {
        month,
        tasks:     monthTasks.length,
        completed: done,
        pending:   monthTasks.length - done,
      };
    });
  })();

  /* ── Heatmap (last 12 weeks × 7 days) ── */
  const heatmap = (() => {
    const days  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const weeks = 12;
    return Array.from({ length: weeks }, (_, w) =>
      days.map((day, di) => {
        const target = new Date();
        // Go back 'w' weeks, then align to day di (Mon=0)
        const offset = (weeks - 1 - w) * 7 + (6 - (new Date().getDay() + 6) % 7) - di;
        const d = new Date(target);
        d.setDate(target.getDate() - offset);
        const dateStr = d.toISOString().split("T")[0];
        const count = tasks.filter(t =>
          t.completed && t.updatedAt &&
          new Date(t.updatedAt).toISOString().split("T")[0] === dateStr
        ).length;
        return { day, week: w, count, date: dateStr };
      })
    );
  })();

  const tabStyle = (active) => ({
    padding: "8px 18px", borderRadius: 8,
    border: active ? "none" : "1px solid var(--border-color)",
    background: active ? "var(--gradient-primary)" : "var(--bg-card)",
    color: active ? "#060a0e" : "var(--text-secondary)",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: "'Syne', sans-serif", letterSpacing: "0.02em",
    transition: "all 0.2s ease",
    boxShadow: active ? "0 4px 14px rgba(0,212,170,0.3)" : "none",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }

        :root {
          --accent-teal: #00d4aa;
          --accent-amber: #f59e0b;
          --accent-coral: #ff6b6b;
          --accent-violet: #a78bfa;
          --gradient-primary: linear-gradient(135deg, #00d4aa, #0ea5e9);
        }

        [data-theme="dark"] {
          --bg-primary:#080b12; --bg-secondary:#0d1117; --bg-tertiary:#141b27;
          --bg-card:#111720; --bg-hover:#1a2234;
          --text-primary:#e8f0fe; --text-secondary:#8899b4; --text-tertiary:#4a5a70;
          --border-color:rgba(0,212,170,0.1); --border-hover:rgba(0,212,170,0.3); --shadow-color:rgba(0,0,0,0.6);
          --glow: 0 0 20px rgba(0,212,170,0.15);
        }
        [data-theme="light"] {
          --bg-primary:#f0f4f8; --bg-secondary:#ffffff; --bg-tertiary:#e8eff7;
          --bg-card:#ffffff; --bg-hover:#dde8f5;
          --text-primary:#0d1b2e; --text-secondary:#4a6080; --text-tertiary:#8ba0b8;
          --border-color:rgba(0,160,130,0.15); --border-hover:rgba(0,160,130,0.4); --shadow-color:rgba(0,0,0,0.08);
          --glow: 0 0 20px rgba(0,212,170,0.08);
        }

        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Syne',-apple-system,sans-serif; background:var(--bg-primary); color:var(--text-primary); -webkit-font-smoothing:antialiased; }

        .cal-dashboard { display:flex; min-height:100vh; position:relative; }
        .cal-dashboard::before {
          content:''; position:fixed; inset:0;
          background-image: linear-gradient(rgba(0,212,170,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.025) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events:none; z-index:0;
        }

        .sidebar {
          width:256px; background:var(--bg-secondary); border-right:1px solid var(--border-color);
          padding:28px 20px; transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
          position:sticky; top:0; height:100vh; display:flex; flex-direction:column;
          z-index:100; overflow:hidden;
        }
        .sidebar::before {
          content:''; position:absolute; top:-80px; left:-80px; width:220px; height:220px;
          background:radial-gradient(circle, rgba(0,212,170,0.07) 0%, transparent 70%); pointer-events:none;
        }
        .cal-dashboard.collapsed .sidebar { width:72px; }
        .cal-dashboard.collapsed .sidebar-text { opacity:0; pointer-events:none; width:0; overflow:hidden; }

        .logo { font-size:20px; font-weight:800; color:var(--text-primary); margin-bottom:40px; display:flex; align-items:center; gap:12px; letter-spacing:-0.02em; animation:slideInLeft 0.5s ease-out; position:relative; z-index:1; }
        .logo-icon { font-size:24px; flex-shrink:0; filter:drop-shadow(0 0 6px rgba(0,212,170,0.5)); }
        .logo-text { background:var(--gradient-primary); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; white-space:nowrap; transition:opacity 0.25s ease; }

        .nav-item { display:flex; align-items:center; gap:12px; padding:12px 14px; margin-bottom:6px; border-radius:10px; text-decoration:none; color:var(--text-secondary); font-size:14px; font-weight:600; transition:all 0.2s ease; position:relative; white-space:nowrap; overflow:hidden; }
        .nav-item::after { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--accent-teal); border-radius:0 2px 2px 0; opacity:0; transition:opacity 0.2s ease; }
        .nav-item:hover { background:var(--bg-hover); color:var(--text-primary); transform:translateX(3px); }
        .nav-item.active { background:linear-gradient(135deg,rgba(0,212,170,0.15),rgba(14,165,233,0.1)); color:var(--accent-teal); border:1px solid rgba(0,212,170,0.25); }
        .nav-item.active::after { opacity:1; }

        .cal-main { flex:1; padding:36px 40px; background:var(--bg-primary); overflow-y:auto; position:relative; z-index:1; min-width:0; }
        .cal-main::-webkit-scrollbar { width:5px; }
        .cal-main::-webkit-scrollbar-thumb { background:var(--bg-hover); border-radius:4px; }

        .navbar { display:flex; align-items:center; gap:14px; margin-bottom:36px; animation:fadeInUp 0.5s ease-out; }
        .navbar h1 { font-size:28px; font-weight:800; color:var(--text-primary); letter-spacing:-0.03em; flex:1; }

        .icon-btn { width:44px; height:44px; display:flex; align-items:center; justify-content:center; background:var(--bg-card); border:1px solid var(--border-color); border-radius:10px; cursor:pointer; font-size:16px; color:var(--text-primary); transition:all 0.2s ease; }
        .icon-btn:hover { border-color:var(--accent-teal); color:var(--accent-teal); background:var(--bg-hover); transform:translateY(-2px); }

        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }

        .chart-section { background:var(--bg-card); border:1px solid var(--border-color); border-radius:14px; padding:24px; margin-bottom:20px; box-shadow:0 2px 8px var(--shadow-color); animation:fadeInUp 0.5s ease-out 0.3s both; }
        .chart-tabs { display:flex; gap:8px; }

        .heatmap-cell { border-radius:3px; transition:transform 0.15s ease; cursor:pointer; }
        .heatmap-cell:hover { transform:scale(1.3); box-shadow:0 0 8px rgba(0,212,170,0.5); }

        /* loading spinner */
        .loading-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 20px; gap:16px; }
        .spinner { width:36px; height:36px; border:3px solid var(--border-color); border-top-color:var(--accent-teal); border-radius:50%; animation:spin 0.8s linear infinite; }
        .loading-text { font-size:14px; color:var(--text-secondary); font-family:'Syne',sans-serif; }

        /* real data badge */
        .live-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:rgba(0,212,170,0.12); color:var(--accent-teal); border:1px solid rgba(0,212,170,0.25); margin-left:10px; }
        .live-dot { width:6px; height:6px; border-radius:50%; background:var(--accent-teal); animation:pulse-dot 1.5s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }

        @media (max-width:1100px) { .stats-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:900px) { .stats-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:768px) {
          .sidebar { position:fixed; left:-260px; top:0; bottom:0; z-index:1000; box-shadow:8px 0 30px rgba(0,0,0,0.4); transition:left 0.3s cubic-bezier(0.4,0,0.2,1); }
          .cal-dashboard.collapsed .sidebar { left:0; width:260px; }
          .cal-main { padding:20px 16px; }
          .stats-grid { grid-template-columns:1fr 1fr; gap:10px; }
          .navbar h1 { font-size:22px; }
        }
        @media (max-width:480px) { .stats-grid { grid-template-columns:1fr 1fr; } }
      `}</style>

      <div className={`cal-dashboard ${collapsed ? "collapsed" : ""}`}>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text sidebar-text">TaskMaster</span>
          </div>
          <nav style={{ position: "relative", zIndex: 1 }}>
            <Link to="/"             className={`nav-item ${location.pathname === "/"             ? "active" : ""}`}><span className="sidebar-text">Task Manager</span></Link>
            <Link to="/notes"        className={`nav-item ${location.pathname === "/notes"        ? "active" : ""}`}><span className="sidebar-text">Notes</span></Link>
            <Link to="/calendar"     className={`nav-item ${location.pathname === "/calendar"     ? "active" : ""}`}><span className="sidebar-text">Activity Graph</span></Link>
            <Link to="/daily-expense" className={`nav-item ${location.pathname === "/daily-expense" ? "active" : ""}`}><span className="sidebar-text">Daily Expenses</span></Link>
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <main className="cal-main">

          {/* Navbar */}
          <div className="navbar">
            <h1>
              Activity
              {!loading && <span className="live-badge"><span className="live-dot" />Live</span>}
            </h1>
            <button className="icon-btn" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} title="Toggle theme">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button className="icon-btn" onClick={() => setCollapsed(c => !c)}>☰</button>
          </div>

          {loading ? (
            <div className="loading-wrap">
              <div className="spinner" />
              <div className="loading-text">Loading your task data...</div>
            </div>
          ) : (
            <>
              {/* Stat cards — real data */}
              <div className="stats-grid">
                <StatCard label="Total Tasks"     value={totalTasks}   accent="#00d4aa" delay={0.05} />
                <StatCard label="Completed"       value={totalDone}    accent="#0ea5e9" delay={0.10} />
                <StatCard label="Completion Rate" value={`${rate}%`}   accent="#f59e0b" delay={0.15} />
                <StatCard label="Day Streak 🔥"   value={streak}       accent="#ff6b6b" delay={0.20} />
              </div>

              {/* Empty state when no tasks */}
              {totalTasks === 0 ? (
                <div className="chart-section" style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>No tasks yet</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Add tasks from the Task Manager to see your activity here.</div>
                </div>
              ) : (
                <>
                  {/* Daily / Monthly Chart */}
                  <div className="chart-section">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
                      <SectionHeader
                        title={activeView === "daily" ? "Today's Activity" : "Monthly Overview"}
                        subtitle={activeView === "daily" ? "Tasks created & completed per hour today" : "Tasks per month this year"}
                      />
                      <div className="chart-tabs">
                        <button style={tabStyle(activeView === "daily")}   onClick={() => setActiveView("daily")}>Daily</button>
                        <button style={tabStyle(activeView === "monthly")} onClick={() => setActiveView("monthly")}>Monthly</button>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={260}>
                      {activeView === "daily" ? (
                        <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gTasks" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#00d4aa" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gDone" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                          <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--text-tertiary)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} interval={3} />
                          <YAxis tick={{ fontSize: 10, fill: "var(--text-tertiary)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="tasks"     name="Created"   stroke="#00d4aa" strokeWidth={2} fill="url(#gTasks)" dot={false} activeDot={{ r: 5, fill: "#00d4aa" }} />
                          <Area type="monotone" dataKey="completed" name="Completed" stroke="#0ea5e9" strokeWidth={2} fill="url(#gDone)"  dot={false} activeDot={{ r: 5, fill: "#0ea5e9" }} />
                        </AreaChart>
                      ) : (
                        <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-tertiary)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "var(--text-tertiary)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="tasks"     name="Created"   fill="#00d4aa" radius={[6,6,0,0]} />
                          <Bar dataKey="completed" name="Completed" fill="#0ea5e9" radius={[6,6,0,0]} />
                          <Bar dataKey="pending"   name="Pending"   fill="#f59e0b" radius={[6,6,0,0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>

                    <div style={{ display: "flex", gap: 20, marginTop: 14, justifyContent: "center" }}>
                      {[
                        { color: "#00d4aa", label: "Created" },
                        { color: "#0ea5e9", label: "Completed" },
                        ...(activeView === "monthly" ? [{ color: "#f59e0b", label: "Pending" }] : []),
                      ].map((l) => (
                        <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                          <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "Syne" }}>{l.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Heatmap */}
                  <div className="chart-section">
                    <SectionHeader title="Activity Heatmap" subtitle="Completed tasks over the last 12 weeks" />
                    <div style={{ display: "flex", gap: 6 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginRight: 6 }}>
                        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                          <div key={d} style={{ fontSize: 10, color: "var(--text-tertiary)", height: 18, display: "flex", alignItems: "center", fontFamily: "JetBrains Mono" }}>{d}</div>
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
                                  title={`${cell.date} — ${cell.count} completed`}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontFamily: "JetBrains Mono" }}>Less</span>
                      {[0, 1, 2, 3, 5].map((c) => (
                        <div key={c} style={{ width: 12, height: 12, borderRadius: 3, background: heatColor(c, theme), border: c === 0 ? "1px solid var(--border-color)" : "none" }} />
                      ))}
                      <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontFamily: "JetBrains Mono" }}>More</span>
                    </div>
                  </div>

                  {/* Weekly completion line chart */}
                  <div className="chart-section" style={{ animation: "fadeInUp 0.5s ease-out 0.5s both" }}>
                    <SectionHeader title="Monthly Completion Trend" subtitle="Completed tasks per month this year" />
                    <ResponsiveContainer width="100%" height={170}>
                      <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gLine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%"   stopColor="#00d4aa" />
                            <stop offset="100%" stopColor="#0ea5e9" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-tertiary)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "var(--text-tertiary)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone" dataKey="completed" name="Completed"
                          stroke="url(#gLine)" strokeWidth={3}
                          dot={{ fill: "#00d4aa", r: 4, strokeWidth: 2, stroke: "var(--bg-card)" }}
                          activeDot={{ r: 6, fill: "#0ea5e9" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Priority breakdown */}
                  <div className="chart-section" style={{ animation: "fadeInUp 0.5s ease-out 0.6s both" }}>
                    <SectionHeader title="Priority Breakdown" subtitle="All tasks grouped by priority level" />
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      {[
                        { label: "High",   color: "#ff6b6b", key: "high" },
                        { label: "Medium", color: "#f59e0b", key: "medium" },
                        { label: "Low",    color: "#00d4aa", key: "low" },
                      ].map(({ label, color, key }) => {
                        const count  = tasks.filter(t => t.priority === key).length;
                        const done   = tasks.filter(t => t.priority === key && t.completed).length;
                        const pct    = count ? Math.round((done / count) * 100) : 0;
                        return (
                          <div key={key} style={{ flex: 1, minWidth: 140, background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: color }} />
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label} Priority</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>{count}</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>{done} completed · {count - done} pending</div>
                            {/* progress bar */}
                            <div style={{ height: 4, background: "var(--border-color)", borderRadius: 4, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
                            </div>
                            <div style={{ fontSize: 11, color, fontWeight: 700, marginTop: 6, fontFamily: "'JetBrains Mono',monospace" }}>{pct}% done</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent completions */}
                  <div className="chart-section" style={{ animation: "fadeInUp 0.5s ease-out 0.7s both" }}>
                    <SectionHeader title="Recent Completions" subtitle="Last 5 tasks you marked as done" />
                    {tasks.filter(t => t.completed).length === 0 ? (
                      <div style={{ textAlign: "center", padding: "24px", color: "var(--text-tertiary)", fontSize: 13 }}>No completed tasks yet.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {tasks
                          .filter(t => t.completed)
                          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                          .slice(0, 5)
                          .map(task => {
                            const priorityColor = { high: "#ff6b6b", medium: "#f59e0b", low: "#00d4aa" }[task.priority] || "#00d4aa";
                            return (
                              <div key={task._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 10, borderLeft: `3px solid ${priorityColor}` }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${priorityColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✓</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2, textDecoration: "line-through", opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono',monospace" }}>
                                    Completed {new Date(task.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                  </div>
                                </div>
                                <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", background: `${priorityColor}15`, color: priorityColor, border: `1px solid ${priorityColor}30` }}>
                                  {task.priority}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default Calendar;
