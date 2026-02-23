import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ─── category config ─── */
const CATEGORIES = [
  { id: "food",      label: "Food & Drinks", icon: "🍔", color: "#00d4aa" },
  { id: "transport", label: "Transport",      icon: "🚗", color: "#38bdf8" },
  { id: "shopping",  label: "Shopping",       icon: "🛍️", color: "#a78bfa" },
  { id: "health",    label: "Health",         icon: "💊", color: "#34d399" },
  { id: "bills",     label: "Bills",          icon: "💡", color: "#ff6b6b" },
  { id: "other",     label: "Other",          icon: "📦", color: "#f59e0b" },
];

const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[5];
const TODAY = new Date().toISOString().slice(0,10);
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
      {label && <p style={{ fontWeight: 700, marginBottom: 6, fontFamily: "'Syne', sans-serif", color: "var(--accent-teal)" }}>{label}</p>}
      {payload.map((e) => (
        <p key={e.name} style={{ color: e.payload?.color || e.fill || e.color }}>
          {e.name}: <strong>₹{e.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════ */
export default function DailyExpense() {
  const location = useLocation();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [expenses, setExpenses] = useState([]);
  useEffect(() => {
    fetch("http://localhost:5000/api/expenses")
      .then(res => res.json())
      .then(data => setExpenses(data))
      .catch(err => console.log(err));
  }, []);

  const [desc,      setDesc]      = useState("");
  const [amount,    setAmount]    = useState("");
  const [category,  setCategory]  = useState("food");
  const [date,      setDate]      = useState(TODAY);
  const [formErr,   setFormErr]   = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterDate,setFilterDate]= useState(TODAY);
  const [collapsed, setCollapsed] = useState(false);

  const addExpense = async () => {
    if (!desc.trim())      return setFormErr("Please enter a description.");
    if (!amount || +amount <= 0) return setFormErr("Please enter a valid amount.");
    setFormErr("");
    const res = await fetch("http://localhost:5000/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ desc: desc.trim(), amount: +amount, category, date }),
    });
    const newExpense = await res.json();
    setExpenses(prev => [newExpense, ...prev]);
    setDesc(""); setAmount(""); setCategory("food"); setDate(TODAY);
  };

  const deleteExpense = async (id) => {
    await fetch(`http://localhost:5000/api/expenses/${id}`, { method: "DELETE" });
    setExpenses(prev => prev.filter(e => e._id !== id));
  };

  /* ── derived ── */
 const todayExp = expenses.filter(e => {
  if (!e.date) return false;
  return new Date(e.date).toISOString().slice(0,10) === filterDate;
});
  const filtered  = filterCat === "all" ? todayExp : todayExp.filter(e => e.category === filterCat);
  const totalDay  = todayExp.reduce((s, e) => s + e.amount, 0);
  const totalFilt = filtered.reduce((s, e) => s + e.amount, 0);

  const pieData = CATEGORIES.map(cat => ({
    name:  cat.label, icon: cat.icon, color: cat.color,
    value: todayExp.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
  })).filter(d => d.value > 0);

  const allDates = [...new Set(expenses.map(e => e.date))].sort().slice(-7);
  const barData  = allDates.map(d => ({
    date:  d.slice(5),
    total: expenses.filter(e => e.date === d).reduce((s, e) => s + e.amount, 0),
  }));

  const navLinks = [
    { to: "/",              label: "Task Manager" },
    { to: "/notes",         label: "Notes" },
    { to: "/calendar",      label: "Activity Graph" },
    { to: "/daily-expense", label: "Expenses" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        @keyframes fadeInUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideLeft { from{opacity:0;transform:translateX(-26px)} to{opacity:1;transform:translateX(0)} }
        @keyframes scaleIn   { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes popIn     { from{opacity:0;transform:scale(0.9) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }

        :root {
          --accent-teal: #00d4aa;
          --accent-amber: #f59e0b;
          --accent-coral: #ff6b6b;
          --gradient-primary: linear-gradient(135deg, #00d4aa, #0ea5e9);
        }

        [data-theme="dark"] {
          --bg-primary:#080b12; --bg-secondary:#0d1117; --bg-tertiary:#141b27;
          --bg-card:#111720; --bg-hover:#1a2234;
          --text-primary:#e8f0fe; --text-secondary:#8899b4; --text-tertiary:#4a5a70;
          --border-color:rgba(0,212,170,0.1); --border-hover:rgba(0,212,170,0.3);
          --shadow-color:rgba(0,0,0,0.6); --glow:0 0 20px rgba(0,212,170,0.15);
        }
        [data-theme="light"] {
          --bg-primary:#f0f4f8; --bg-secondary:#ffffff; --bg-tertiary:#e8eff7;
          --bg-card:#ffffff; --bg-hover:#dde8f5;
          --text-primary:#0d1b2e; --text-secondary:#4a6080; --text-tertiary:#8ba0b8;
          --border-color:rgba(0,160,130,0.15); --border-hover:rgba(0,160,130,0.4);
          --shadow-color:rgba(0,0,0,0.08); --glow:0 0 20px rgba(0,212,170,0.08);
        }

        *{margin:0;padding:0;box-sizing:border-box;}
        body{
          font-family:'Syne',-apple-system,sans-serif;
          background:var(--bg-primary);color:var(--text-primary);
          -webkit-font-smoothing:antialiased;
          transition:background 0.3s,color 0.3s;
        }

        .exp-root{display:flex;min-height:100vh;position:relative;}
        .exp-root::before{
          content:'';position:fixed;inset:0;
          background-image:linear-gradient(rgba(0,212,170,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,170,0.025) 1px,transparent 1px);
          background-size:40px 40px;pointer-events:none;z-index:0;
        }

        /* ── Sidebar ── */
        .exp-sidebar{
          width:256px;background:var(--bg-secondary);
          border-right:1px solid var(--border-color);
          padding:28px 20px;
          transition:width 0.3s cubic-bezier(.4,0,.2,1);
          display:flex;flex-direction:column;
          position:sticky;top:0;height:100vh;
          z-index:100;overflow:hidden;
        }
        .exp-sidebar::before{
          content:'';position:absolute;top:-80px;left:-80px;
          width:220px;height:220px;
          background:radial-gradient(circle,rgba(0,212,170,0.07) 0%,transparent 70%);
          pointer-events:none;
        }
        .exp-root.collapsed .exp-sidebar{width:72px;}
        .exp-root.collapsed .sb-text{opacity:0;pointer-events:none;width:0;overflow:hidden;}

        .sb-logo{
          font-size:20px;font-weight:800;
          display:flex;align-items:center;gap:12px;
          margin-bottom:40px;animation:slideLeft 0.45s ease-out;
          position:relative;z-index:1;letter-spacing:-0.02em;
        }
        .sb-logo-icon{font-size:24px;flex-shrink:0;filter:drop-shadow(0 0 6px rgba(0,212,170,0.5));}
        .sb-logo-text{background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;white-space:nowrap;}

        .sb-nav{position:relative;z-index:1;flex:1;}
        .sb-link{
          display:flex;align-items:center;gap:12px;
          padding:12px 14px;margin-bottom:6px;border-radius:10px;
          text-decoration:none;color:var(--text-secondary);
          font-size:14px;font-weight:600;
          transition:all 0.2s cubic-bezier(.4,0,.2,1);
          position:relative;white-space:nowrap;overflow:hidden;
        }
        .sb-link::after{
          content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
          background:var(--accent-teal);border-radius:0 2px 2px 0;
          opacity:0;transition:opacity 0.2s ease;
        }
        .sb-link:hover{background:var(--bg-hover);color:var(--text-primary);transform:translateX(3px);}
        .sb-link.active{
          background:linear-gradient(135deg,rgba(0,212,170,0.15),rgba(14,165,233,0.1));
          color:var(--accent-teal);border:1px solid rgba(0,212,170,0.25);
        }
        .sb-link.active::after{opacity:1;}

        /* ── Main ── */
        .exp-main{
          flex:1;padding:36px 40px;overflow-y:auto;
          background:var(--bg-primary);position:relative;z-index:1;min-width:0;
        }
        .exp-main::-webkit-scrollbar{width:5px;}
        .exp-main::-webkit-scrollbar-thumb{background:var(--bg-hover);border-radius:4px;}

        /* topbar */
        .topbar{display:flex;align-items:center;gap:14px;margin-bottom:32px;animation:fadeInUp 0.45s ease-out;}
        .topbar h1{flex:1;font-size:28px;font-weight:800;color:var(--text-primary);letter-spacing:-0.04em;}
        .topbar h1 span{background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .icon-btn{
          width:44px;height:44px;display:flex;align-items:center;justify-content:center;
          background:var(--bg-card);border:1px solid var(--border-color);
          border-radius:10px;cursor:pointer;font-size:17px;color:var(--text-primary);
          transition:all 0.2s ease;
        }
        .icon-btn:hover{border-color:var(--accent-teal);color:var(--accent-teal);background:var(--bg-hover);transform:translateY(-2px);}

        /* stat cards */
        .stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px;}
        .stat-card{
          background:var(--bg-card);border:1px solid var(--border-color);
          border-radius:14px;padding:22px 24px;position:relative;overflow:hidden;
          animation:scaleIn 0.45s ease-out both;
          transition:transform 0.25s ease,box-shadow 0.25s ease,border-color 0.25s ease;cursor:default;
        }
        .stat-card:hover{transform:translateY(-5px);border-color:var(--border-hover);box-shadow:var(--glow);}
        .stat-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;}
        .stat-card.c1::after{background:var(--accent-teal);}
        .stat-card.c2::after{background:var(--accent-coral);}
        .stat-card.c3::after{background:var(--accent-amber);}
        .stat-label{font-size:10px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;}
        .stat-value{font-size:30px;font-weight:800;color:var(--text-primary);letter-spacing:-0.03em;font-family:'JetBrains Mono',monospace;}
        .stat-sub{font-size:12px;color:var(--text-secondary);margin-top:4px;}

        /* add form */
        .add-form{
          background:var(--bg-card);border:1px solid var(--border-color);
          border-radius:14px;padding:22px;margin-bottom:22px;
          animation:fadeInUp 0.5s ease-out 0.1s both;
          box-shadow:0 2px 8px var(--shadow-color);
          transition:border-color 0.2s ease,box-shadow 0.2s ease;
        }
        .add-form:focus-within{border-color:rgba(0,212,170,0.25);box-shadow:0 0 0 1px rgba(0,212,170,0.15),0 4px 20px rgba(0,212,170,0.07);}
        .form-title{font-size:14px;font-weight:700;color:var(--text-secondary);margin-bottom:16px;text-transform:uppercase;letter-spacing:0.05em;}
        .form-grid{display:grid;grid-template-columns:2fr 1fr 1.2fr 1fr auto;gap:12px;align-items:end;}
        .form-field{display:flex;flex-direction:column;gap:5px;}
        .form-field label{font-size:10px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.08em;}
        .form-input,.form-select{
          padding:11px 14px;background:var(--bg-secondary);
          border:1px solid var(--border-color);border-radius:10px;
          color:var(--text-primary);font-size:13px;font-weight:500;
          font-family:'Syne',sans-serif;outline:none;transition:all 0.2s ease;width:100%;
        }
        .form-input:focus,.form-select:focus{border-color:var(--accent-teal);box-shadow:0 0 0 3px rgba(0,212,170,0.12);}
        .form-input::placeholder{color:var(--text-tertiary);}
        [data-theme="dark"] input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(1) opacity(0.5);cursor:pointer;}
        .form-select{cursor:pointer;appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300d4aa' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;
        }
        .form-error{font-size:12px;color:var(--accent-coral);margin-top:10px;font-weight:600;}
        .add-btn{
          padding:11px 22px;background:var(--gradient-primary);
          border:none;border-radius:10px;color:#060a0e;font-size:13px;font-weight:700;
          font-family:'Syne',sans-serif;cursor:pointer;display:flex;align-items:center;gap:7px;
          box-shadow:0 4px 14px rgba(0,212,170,0.3);white-space:nowrap;letter-spacing:0.02em;
          transition:all 0.2s ease;
        }
        .add-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,212,170,0.45);}
        .add-btn:active{transform:translateY(0);}

        /* filter row */
        .filter-row{display:flex;align-items:center;gap:14px;margin-bottom:16px;flex-wrap:wrap;animation:fadeInUp 0.5s ease-out 0.2s both;}
        .date-input{
          padding:9px 14px;background:var(--bg-card);border:1px solid var(--border-color);
          border-radius:10px;color:var(--text-primary);font-size:13px;font-weight:600;
          font-family:'Syne',sans-serif;outline:none;transition:all 0.2s ease;
        }
        .date-input:focus{border-color:var(--accent-teal);}
        .filter-summary{font-size:12px;color:var(--text-tertiary);font-family:'JetBrains Mono',monospace;}

        /* category chips */
        .cat-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;animation:fadeInUp 0.5s ease-out 0.25s both;}
        .cat-chip{
          display:flex;align-items:center;gap:5px;
          padding:6px 14px;border-radius:20px;
          border:1px solid var(--border-color);background:var(--bg-card);
          color:var(--text-secondary);font-size:12px;font-weight:600;
          cursor:pointer;transition:all 0.2s ease;font-family:'Syne',sans-serif;
        }
        .cat-chip:hover{border-color:var(--accent-teal);color:var(--text-primary);transform:translateY(-1px);}
        .cat-chip.active{color:#060a0e !important;border-color:transparent;box-shadow:0 3px 12px rgba(0,0,0,0.25);}

        /* expense list */
        .expense-list{display:flex;flex-direction:column;gap:10px;animation:fadeInUp 0.5s ease-out 0.3s both;margin-bottom:28px;}
        .expense-row{
          display:flex;align-items:center;gap:14px;
          background:var(--bg-card);border:1px solid var(--border-color);
          border-radius:14px;padding:16px 20px;
          transition:all 0.25s cubic-bezier(.4,0,.2,1);
          position:relative;overflow:hidden;
          animation:popIn 0.35s ease-out both;
        }
        .expense-row::before{
          content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
          opacity:0;transition:opacity 0.25s ease;border-radius:3px 0 0 3px;
        }
        .expense-row:hover{transform:translateX(4px);box-shadow:var(--glow);}
        .expense-row:hover::before{opacity:1;}
        .cat-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
        .exp-info{flex:1;min-width:0;}
        .exp-desc{font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-0.01em;}
        .exp-meta{font-size:11px;color:var(--text-secondary);font-family:'JetBrains Mono',monospace;}
        .exp-amount{font-size:17px;font-weight:800;letter-spacing:-0.02em;font-family:'JetBrains Mono',monospace;}
        .del-btn{
          width:34px;height:34px;display:flex;align-items:center;justify-content:center;
          background:var(--bg-secondary);border:1px solid var(--border-color);
          border-radius:9px;cursor:pointer;font-size:14px;color:var(--text-tertiary);
          transition:all 0.2s ease;flex-shrink:0;
        }
        .del-btn:hover{background:rgba(255,107,107,0.1);border-color:var(--accent-coral);color:var(--accent-coral);transform:scale(1.1);}

        /* charts */
        .charts-row{display:grid;grid-template-columns:1.4fr 1fr;gap:20px;animation:fadeInUp 0.5s ease-out 0.4s both;margin-bottom:24px;}
        .chart-box{background:var(--bg-card);border:1px solid var(--border-color);border-radius:14px;padding:22px;box-shadow:0 2px 8px var(--shadow-color);}
        .chart-title{font-size:14px;font-weight:800;color:var(--text-primary);margin-bottom:3px;letter-spacing:-0.01em;}
        .chart-sub{font-size:11px;color:var(--text-secondary);margin-bottom:18px;}
        .pie-legend{display:flex;flex-direction:column;gap:8px;margin-top:14px;}
        .pie-row{display:flex;align-items:center;gap:10px;}
        .pie-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .pie-name{font-size:12px;color:var(--text-secondary);flex:1;}
        .pie-val{font-size:12px;font-weight:700;color:var(--text-primary);font-family:'JetBrains Mono',monospace;}

        /* empty */
        .empty{text-align:center;padding:44px 20px;color:var(--text-secondary);font-size:14px;}
        .empty-icon{font-size:44px;margin-bottom:12px;}

        @media(max-width:1100px){.form-grid{grid-template-columns:1fr 1fr;}.add-btn{grid-column:span 2;justify-content:center;}}
        @media(max-width:900px){.charts-row{grid-template-columns:1fr;}.stats-row{grid-template-columns:1fr 1fr;}}
        @media(max-width:768px){
          .exp-sidebar{position:fixed;left:-260px;top:0;bottom:0;z-index:1000;box-shadow:8px 0 30px rgba(0,0,0,0.4);transition:left 0.3s cubic-bezier(.4,0,.2,1);}
          .exp-root.collapsed .exp-sidebar{left:0;width:260px;}
          .exp-main{padding:20px 16px;}
          .stats-row{grid-template-columns:1fr 1fr;gap:10px;}
          .topbar h1{font-size:22px;}
          .cat-chips{gap:6px;}
          .cat-chip{padding:5px 12px;font-size:11px;}
        }
        @media(max-width:480px){.stats-row{grid-template-columns:1fr;}.stat-value{font-size:26px;}}
      `}</style>

      <div className={`exp-root ${collapsed ? "collapsed" : ""}`}>

        {/* ── SIDEBAR ── */}
        <aside className="exp-sidebar">
          <div className="sb-logo">
            <span className="sb-logo-icon">⚡</span>
            <span className="sb-logo-text sb-text">TaskMaster</span>
          </div>

          <nav className="sb-nav">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={`sb-link ${location.pathname === to ? "active" : ""}`}>
                <span className="sb-text">{label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <main className="exp-main">

          {/* topbar */}
          <div className="topbar">
            <h1>Daily <span>Expenses</span></h1>
            <button className="icon-btn" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} title="Toggle theme">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button className="icon-btn" onClick={() => setCollapsed(c => !c)}>☰</button>
          </div>

          {/* stat cards */}
          <div className="stats-row">
            {[
              { cls: "c1", label: "Today's Spend",   value: `₹${totalDay.toLocaleString()}`, sub: `${todayExp.length} transaction${todayExp.length !== 1 ? "s" : ""}` },
              { cls: "c2", label: "Biggest Expense",  value: todayExp.length ? `₹${Math.max(...todayExp.map(e => e.amount)).toLocaleString()}` : "₹0", sub: todayExp.length ? todayExp.reduce((a, e) => e.amount > a.amount ? e : a, todayExp[0]).desc : "—" },
              { cls: "c3", label: "Categories Used",  value: [...new Set(todayExp.map(e => e.category))].length, sub: "out of 6 total" },
            ].map((s, i) => (
              <div key={i} className={`stat-card ${s.cls}`} style={{ animationDelay: `${0.05 + i * 0.07}s` }}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* add form */}
          <div className="add-form">
            <div className="form-title">+ New Expense</div>
            <div className="form-grid">
              <div className="form-field">
                <label>Description</label>
                <input className="form-input" placeholder="e.g. Lunch, Petrol…"
                  value={desc} onChange={e => setDesc(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addExpense()} />
              </div>
              <div className="form-field">
                <label>Amount (₹)</label>
                <input className="form-input" type="number" min="1" placeholder="0.00"
                  value={amount} onChange={e => setAmount(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addExpense()} />
              </div>
              <div className="form-field">
                <label>Category</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Date</label>
                <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <button className="add-btn" onClick={addExpense}>
                <span style={{ fontSize: 17, lineHeight: 1 }}>+</span> Add
              </button>
            </div>
            {formErr && <div className="form-error">⚠ {formErr}</div>}
          </div>

          {/* filter row */}
          <div className="filter-row">
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Date</label>
            <input className="date-input" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            <span className="filter-summary">{filtered.length} item{filtered.length !== 1 ? "s" : ""} · ₹{totalFilt.toLocaleString()}</span>
          </div>

          {/* category chips */}
          <div className="cat-chips">
            <button
              className={`cat-chip ${filterCat === "all" ? "active" : ""}`}
              style={filterCat === "all" ? { background: "var(--gradient-primary)" } : {}}
              onClick={() => setFilterCat("all")}
            >All</button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`cat-chip ${filterCat === cat.id ? "active" : ""}`}
                style={filterCat === cat.id ? { background: cat.color } : {}}
                onClick={() => setFilterCat(cat.id)}
              >{cat.icon} {cat.label}</button>
            ))}
          </div>

          {/* expense list */}
          <div className="expense-list">
            {filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">💸</div>
                <div>No expenses for this filter.</div>
                <div style={{ fontSize: 12, marginTop: 6, color: "var(--text-tertiary)" }}>Add one above or change date / category.</div>
              </div>
            ) : (
              filtered
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((exp, i) => {
                  const cat = getCat(exp.category);
                  return (
                    <div
                      key={exp._id}
                      className="expense-row"
                      style={{ animationDelay: `${i * 0.04}s`, borderLeft: `3px solid ${cat.color}33` }}
                    >
                      <style>{`.expense-row:nth-child(${i + 1}):hover::before{background:${cat.color};}`}</style>
                      <div className="cat-icon" style={{ background: `${cat.color}18` }}>{cat.icon}</div>
                      <div className="exp-info">
                        <div className="exp-desc">{exp.desc}</div>
                        <div className="exp-meta">
                          {cat.label} · {new Date(exp.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <div className="exp-amount" style={{ color: cat.color }}>₹{exp.amount.toLocaleString()}</div>
                      <button className="del-btn" onClick={() => deleteExpense(exp._id)} title="Delete">🗑</button>
                    </div>
                  );
                })
            )}
          </div>

          {/* charts — shown only when data exists */}
          {todayExp.length > 0 && (
            <div className="charts-row">
              <div className="chart-box">
                <div className="chart-title">7-Day Spending</div>
                <div className="chart-sub">Daily totals across all categories</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-tertiary)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--text-tertiary)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" name="Spend" fill="#00d4aa" radius={[6, 6, 0, 0]}
                      background={{ fill: "var(--bg-secondary)", radius: [6, 6, 0, 0] }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-box">
                <div className="chart-title">Today by Category</div>
                <div className="chart-sub">Breakdown of ₹{totalDay.toLocaleString()}</div>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={60}
                      dataKey="value" paddingAngle={3} strokeWidth={0}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {pieData.map((d, i) => (
                    <div className="pie-row" key={i}>
                      <div className="pie-dot" style={{ background: d.color }} />
                      <div className="pie-name">{d.icon} {d.name}</div>
                      <div className="pie-val">₹{d.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
