import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { FaCheckCircle, FaFire, FaChartPie, FaHistory } from "react-icons/fa";
import "../activity.css";

const API_URL = import.meta.env.VITE_API_URL;

const heatColor = (count) => {
  if (count === 0) return "rgba(142, 142, 147, 0.05)";
  const opacity = [0.3, 0.5, 0.7, 0.9, 1][Math.min(count - 1, 4)];
  return `rgba(0, 122, 255, ${opacity})`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="apple-card" style={{ padding: '12px', background: 'var(--apple-card)', backdropFilter: 'blur(10px)', border: '1px solid var(--apple-border)' }}>
      {label && <p style={{ fontWeight: 700, marginBottom: 4, color: 'var(--apple-blue)' }}>{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} style={{ fontSize: '13px', color: 'var(--apple-text)' }}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

function Calendar() {
  const [activeView, setActiveView] = useState("daily");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const totalTasks = tasks.length;
  const totalDone = tasks.filter(t => t.completed).length;
  const rate = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;

  const streak = (() => {
    if (!tasks.length) return 0;
    const completedDates = new Set(
      tasks.filter(t => t.completed && t.updatedAt).map(t => new Date(t.updatedAt).toISOString().split("T")[0])
    );
    let count = 0;
    const today = new Date();
    while (true) {
      const d = new Date(today);
      d.setDate(today.getDate() - count);
      const key = d.toISOString().split("T")[0];
      if (completedDates.has(key)) count++; else break;
      if (count > 365) break;
    }
    return count;
  })();

  const dailyData = Array.from({ length: 24 }, (_, i) => {
    const label = i === 0 ? "12am" : i < 12 ? `${i}am` : i === 12 ? "12pm" : `${i - 12}pm`;
    const created = tasks.filter(t => {
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

  const monthlyData = (() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months.map((month, mi) => {
      const monthTasks = tasks.filter(t => new Date(t.createdAt).getMonth() === mi);
      const done = monthTasks.filter(t => t.completed).length;
      return { month, tasks: monthTasks.length, completed: done, pending: monthTasks.length - done };
    });
  })();

  return (
    <div className="activity-container">
      {/* Stats Row */}
      <div className="activity-stats">
        <div className="apple-card activity-stat-card">
          <span className="activity-stat-label">Completion Rate</span>
          <div className="activity-stat-value">{rate}%</div>
        </div>
        <div className="apple-card activity-stat-card">
          <span className="activity-stat-label">Total Done</span>
          <div className="activity-stat-value">{totalDone}</div>
        </div>
        <div className="apple-card activity-stat-card">
          <span className="activity-stat-label">Day Streak</span>
          <div className="activity-stat-value" style={{ color: '#FF9500' }}><FaFire size={24} /> {streak}</div>
        </div>
        <div className="apple-card activity-stat-card">
          <span className="activity-stat-label">Total Tasks</span>
          <div className="activity-stat-value">{totalTasks}</div>
        </div>
      </div>

      {loading ? (
        <p className="empty-state">Loading activity data...</p>
      ) : (
        <>
          {/* Main Chart */}
          <div className="apple-card activity-chart-card">
            <div className="chart-header">
              <h3 className="section-title">{activeView === "daily" ? "Today's Productivity" : "Yearly Overview"}</h3>
              <div className="view-toggle">
                <button className={`view-btn ${activeView === "daily" ? "active" : ""}`} onClick={() => setActiveView("daily")}>Daily</button>
                <button className={`view-btn ${activeView === "monthly" ? "active" : ""}`} onClick={() => setActiveView("monthly")}>Monthly</button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              {activeView === "daily" ? (
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--apple-blue)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--apple-blue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(142, 142, 147, 0.1)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "var(--apple-secondary-text)" }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--apple-secondary-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="tasks" name="Active" stroke="var(--apple-gray)" strokeWidth={1} fill="transparent" strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="completed" name="Completed" stroke="var(--apple-blue)" strokeWidth={3} fill="url(#colorDone)" dot={false} activeDot={{ r: 6, fill: "var(--apple-blue)" }} />
                </AreaChart>
              ) : (
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(142, 142, 147, 0.1)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--apple-secondary-text)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--apple-secondary-text)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="completed" fill="var(--apple-blue)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="tasks" fill="rgba(142, 142, 147, 0.2)" radius={[8, 8, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="breakdown-row">
            {/* Priority Progress */}
            <div className="apple-card breakdown-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaChartPie className="recent-icon" />
                <h3 className="section-title">Priority Stats</h3>
              </div>
              <div className="priority-bar-container">
                {[
                  { label: "High",   color: "#FF3B30", key: "high" },
                  { label: "Medium", color: "#FFCC00", key: "medium" },
                  { label: "Low",    color: "#34C759", key: "low" },
                ].map(({ label, color, key }) => {
                  const count = tasks.filter(t => t.priority === key).length;
                  const done = tasks.filter(t => t.priority === key && t.completed).length;
                  const pct = count ? Math.round((done / count) * 100) : 0;
                  return (
                    <div className="priority-bar-group" key={key}>
                      <div className="priority-bar-meta">
                        <span>{label}</span>
                        <span style={{ color }}>{pct}%</span>
                      </div>
                      <div className="priority-bar-bg">
                        <div className="priority-bar-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--apple-secondary-text)', marginTop: 2 }}>{done} of {count} done</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent History */}
            <div className="apple-card breakdown-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaHistory className="recent-icon" />
                <h3 className="section-title">Recent Completions</h3>
              </div>
              <div className="recent-list">
                {tasks.filter(t => t.completed).length === 0 ? (
                  <p className="empty-state">No tasks completed yet. Go for it! 🏁</p>
                ) : (
                  tasks
                    .filter(t => t.completed)
                    .sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                    .slice(0, 5)
                    .map(task => (
                      <div key={task._id} className="recent-item">
                        <FaCheckCircle className="recent-icon" />
                        <span className="recent-title">{task.title}</span>
                        <span className="recent-date">{new Date(task.updatedAt).toLocaleDateString()}</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Calendar;
