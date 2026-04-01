import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaPlus, FaTrash, FaUtensils, FaCar, FaShoppingBag, FaNotesMedical, FaLightbulb, FaBox } from "react-icons/fa";
import "../expenses.css";

const CATEGORIES = [
  { id: "food",      label: "Food & Drinks", icon: <FaUtensils />, color: "#007AFF" },
  { id: "transport", label: "Transport",      icon: <FaCar />,      color: "#5856D6" },
  { id: "shopping",  label: "Shopping",       icon: <FaShoppingBag />, color: "#FF2D55" },
  { id: "health",    label: "Health",         icon: <FaNotesMedical />, color: "#34C759" },
  { id: "bills",     label: "Bills",          icon: <FaLightbulb />, color: "#FF9500" },
  { id: "other",     label: "Other",          icon: <FaBox />,       color: "#8E8E93" },
];

const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[5];
const TODAY = new Date().toISOString().slice(0, 10);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="apple-card" style={{ padding: '12px', background: 'var(--apple-card)', backdropFilter: 'blur(10px)', border: '1px solid var(--apple-border)' }}>
      {label && <p style={{ fontWeight: 700, marginBottom: 4, color: 'var(--apple-blue)' }}>{label}</p>}
      {payload.map((e) => (
        <p key={e.name} style={{ fontSize: '13px', color: 'var(--apple-text)' }}>
          {e.name}: <strong>₹{e.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

export default function DailyExpense() {
  const [expenses, setExpenses] = useState([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [date, setDate] = useState(TODAY);
  const [formErr, setFormErr] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterDate, setFilterDate] = useState(TODAY);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/expenses`);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.log(err);
    }
  };

  const addExpense = async () => {
    if (!desc.trim()) return setFormErr("Please enter a description.");
    if (!amount || +amount <= 0) return setFormErr("Please enter a valid amount.");
    setFormErr("");
    
    try {
      const res = await fetch(`${API_URL}/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desc: desc.trim(), amount: +amount, category, date }),
      });
      const newExpense = await res.json();
      setExpenses(prev => [newExpense, ...prev]);
      setDesc(""); setAmount(""); setCategory("food"); setDate(TODAY);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await fetch(`${API_URL}/api/expenses/${id}`, { method: "DELETE" });
        setExpenses(prev => prev.filter(e => e._id !== id));
      } catch (err) {
        console.log(err);
      }
    }
  };

  const todayExp = expenses.filter(e => {
    if (!e.date) return false;
    return new Date(e.date).toISOString().slice(0, 10) === filterDate;
  });
  
  const filtered = filterCat === "all" ? todayExp : todayExp.filter(e => e.category === filterCat);
  const totalDay = todayExp.reduce((s, e) => s + e.amount, 0);
  
  const pieData = CATEGORIES.map(cat => ({
    name: cat.label, color: cat.color,
    value: todayExp.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
  })).filter(d => d.value > 0);

  const allDates = [...new Set(expenses.map(e => e.date))].sort().slice(-7);
  const barData = allDates.map(d => ({
    date: d.slice(5),
    total: expenses.filter(e => e.date === d).reduce((s, e) => s + e.amount, 0),
  }));

  return (
    <div className="expenses-container">
      {/* Stats Section */}
      <div className="expenses-stats">
        <div className="apple-card expense-stat-card">
          <div className="expense-stat-label">Daily Spend</div>
          <div className="expense-stat-value">₹{totalDay.toLocaleString()}</div>
        </div>
        <div className="apple-card expense-stat-card">
          <div className="expense-stat-label">Transactions</div>
          <div className="expense-stat-value">{todayExp.length}</div>
        </div>
        <div className="apple-card expense-stat-card">
          <div className="expense-stat-label">Avg. Expense</div>
          <div className="expense-stat-value">
            ₹{todayExp.length ? Math.round(totalDay / todayExp.length).toLocaleString() : 0}
          </div>
        </div>
      </div>

      {/* Add Form */}
      <div className="apple-card expense-form-box">
        <h3 className="section-title">New Expense</h3>
        <div className="expense-form-grid">
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="expense-input" placeholder="Lunch, Uber, Movies..." value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input className="expense-input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="expense-input" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="expense-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <button className="add-expense-btn" onClick={addExpense}><FaPlus /> Add</button>
        </div>
        {formErr && <p style={{ color: "#FF3B30", fontSize: '12px', fontWeight: 600 }}>{formErr}</p>}
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label className="form-label">Entries for:</label>
          <input className="expense-input" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
        <div className="category-chips">
          <button className={`category-chip ${filterCat === "all" ? "active" : ""}`} onClick={() => setFilterCat("all")}>All</button>
          {CATEGORIES.map(c => (
            <button key={c.id} className={`category-chip ${filterCat === c.id ? "active" : ""}`} onClick={() => setFilterCat(c.id)}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expense Rows */}
      <div className="expense-list-grid">
        {filtered.length === 0 ? (
          <p className="empty-state">No expenses found for this selection. 💸</p>
        ) : (
          filtered.map((exp) => {
            const cat = getCat(exp.category);
            return (
              <div key={exp._id} className="apple-card expense-row">
                <div className="expense-info">
                  <div className="cat-icon-container" style={{ background: `${cat.color}15`, color: cat.color }}>
                    {cat.icon}
                  </div>
                  <div className="expense-details">
                    <span className="expense-desc">{exp.desc}</span>
                    <span className="expense-meta">{cat.label} • {new Date(exp.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span className="expense-amount" style={{ color: cat.color }}>₹{exp.amount.toLocaleString()}</span>
                  <button className="action-btn delete" onClick={() => deleteExpense(exp._id)}><FaTrash size={12} /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Charts */}
      {todayExp.length > 0 && (
        <div className="charts-grid">
          <div className="apple-card chart-card">
            <h3 className="section-title" style={{ marginBottom: '20px' }}>Weekly Spending</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(142, 142, 147, 0.1)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--apple-secondary-text)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--apple-secondary-text)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(142, 142, 147, 0.05)' }} />
                <Bar dataKey="total" fill="var(--apple-blue)" radius={[8, 8, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="apple-card chart-card">
            <h3 className="section-title" style={{ marginBottom: '20px' }}>Today's Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={4} stroke="none">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                  <span style={{ color: 'var(--apple-secondary-text)', fontWeight: 600 }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
