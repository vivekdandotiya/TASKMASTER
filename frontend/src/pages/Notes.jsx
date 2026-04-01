import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaCalculator, FaPlus, FaTimes } from "react-icons/fa";
import "../notes.css";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showCalc, setShowCalc] = useState(false);
  const [calcValue, setCalcValue] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notes`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddNote = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      const url = editingId 
        ? `${API_URL}/api/notes/${editingId}`
        : `${API_URL}/api/notes`;
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      });

      const updatedNote = await res.json();

      if (editingId) {
        setNotes(notes.map(n => n._id === editingId ? updatedNote : n));
      } else {
        setNotes([updatedNote, ...notes]);
      }

      setTitle("");
      setContent("");
      setEditingId(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await fetch(`${API_URL}/api/notes/${id}`, { method: "DELETE" });
        setNotes(notes.filter((note) => note._id !== id));
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
  };

  const handleCalc = (value) => {
    if (value === "=") {
      try {
        const result = Function('"use strict"; return (' + calcValue + ')')();
        setCalcValue(result.toString());
      } catch {
        setCalcValue("Error");
      }
    } else if (value === "C") {
      setCalcValue("");
    } else if (value === "←") {
      setCalcValue(calcValue.slice(0, -1));
    } else {
      setCalcValue(calcValue + value);
    }
  };

  return (
    <div className="notes-container">
      {/* Add/Edit Section */}
      <div className="apple-card add-note-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 className="section-title">{editingId ? "Edit Note" : "New Note"}</h3>
          <button className="note-action-btn" onClick={() => setShowCalc(true)}>
            <FaCalculator />
          </button>
        </div>
        
        <input
          className="note-input"
          placeholder="Note Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />

        <textarea
          className="note-input note-textarea"
          placeholder="Start writing... (Ctrl+Enter to save)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="add-note-btn" onClick={handleAddNote}>
            {editingId ? "Update Note" : "Save Note"}
          </button>
          {editingId && (
            <button 
              className="note-action-btn" 
              onClick={handleCancelEdit}
              style={{ borderRadius: '12px', padding: '0 20px', height: '44px' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Notes List */}
      <div className="notes-grid">
        {notes.length === 0 ? (
          <p className="empty-state">Your thoughts start here... ✍️</p>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="apple-card note-card">
              <h3 className="note-title">{note.title}</h3>
              <p className="note-content">{note.content}</p>

              <div className="note-actions">
                <button className="note-action-btn" onClick={() => handleEdit(note)}>
                  <FaEdit size={14} />
                </button>
                <button className="note-action-btn delete" onClick={() => handleDelete(note._id)}>
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Calculator Modal */}
      {showCalc && (
        <div 
          className="calc-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowCalc(false)}
        >
          <div className="calc-modal apple-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontWeight: 700, opacity: 0.7 }}>CALCULATOR</span>
              <button className="note-action-btn" onClick={() => setShowCalc(false)}><FaTimes /></button>
            </div>
            
            <div className="calc-display">{calcValue || '0'}</div>

            <div className="calc-buttons">
              {["C", "←", "/", "*", "7", "8", "9", "-", "4", "5", "6", "+", "1", "2", "3", "=", "0", "."]
                .map((btn, i) => (
                  <button 
                    key={i} 
                    className={`calc-btn ${["/", "*", "-", "+"].includes(btn) ? "op" : btn === "=" ? "eq" : btn === "C" ? "clr" : ""}`}
                    onClick={() => handleCalc(btn)}
                  >
                    {btn}
                  </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;