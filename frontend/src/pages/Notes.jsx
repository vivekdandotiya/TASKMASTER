import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaEdit, FaCalculator, FaSun, FaMoon } from "react-icons/fa";
import "../notes.css";

function Notes() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState(() => {
    // Load notes from localStorage on mount
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showCalc, setShowCalc] = useState(false);
  const [calcValue, setCalcValue] = useState("");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Add / Update Note
  const handleAddNote = () => {
    if (!title.trim() || !content.trim()) return;

    if (editingId) {
      setNotes(
        notes.map((note) =>
          note.id === editingId ? { ...note, title: title.trim(), content: content.trim(), updatedAt: new Date().toISOString() } : note
        )
      );
      setEditingId(null);
    } else {
      setNotes([
        ...notes,
        { 
          id: Date.now(), 
          title: title.trim(), 
          content: content.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
      ]);
    }

    setTitle("");
    setContent("");
  };

  // Delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter((note) => note.id !== id));
    }
  };

  // Edit
  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
    // Scroll to input box
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
  };

  // Calculator
  const handleCalc = (value) => {
    if (value === "=") {
      try {
        // Using Function instead of eval for better security
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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        handleAddNote();
      } else if (e.key === 'Escape' && editingId) {
        handleCancelEdit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [title, content, editingId]);

  return (
    <div className="notes-container">

      {/* Header */}
      <div className="notes-header">
        <h1>📝 Notes</h1>

        <div className="header-buttons">
          <button 
            className="redirect-btn" 
            onClick={() => navigate("/")}
            aria-label="Go to Dashboard"
          >
            <span>Dashboard</span>
          </button>

          <button 
            className="theme-toggle-notes" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>

          <button 
            className="calc-btn" 
            onClick={() => setShowCalc(true)}
            aria-label="Open calculator"
            title="Calculator"
          >
            <FaCalculator />
          </button>
        </div>
      </div>

      {/* Add/Edit Section */}
      <div className="note-input-box">
        <div className="note-input-container">
          <input
            type="text"
            placeholder="Note Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />

          <textarea
            placeholder="Write your note... (Ctrl+Enter to save)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleAddNote} style={{ flex: 1 }}>
              {editingId ? "Update Note" : "Add Note"}
            </button>
            {editingId && (
              <button 
                onClick={handleCancelEdit}
                style={{ 
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'none'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="notes-grid">
        {notes.length === 0 ? (
          <p className="empty">No notes yet... Create your first note above! ✨</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.content}</p>

              <div className="note-actions">
                <FaEdit 
                  onClick={() => handleEdit(note)}
                  title="Edit note"
                />
                <FaTrash 
                  onClick={() => handleDelete(note.id)}
                  title="Delete note"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Calculator Modal */}
      {showCalc && (
        <div 
          className="calc-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCalc(false);
            }
          }}
        >
          <div className="calc-modal">
            <div className="calc-display">{calcValue || '0'}</div>

            <div className="calc-buttons">
              {["7","8","9","/","4","5","6","*","1","2","3","-","0",".","←","+","C","="]
                .map((btn, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleCalc(btn)}
                    style={btn === "=" ? { gridColumn: 'span 2' } : {}}
                  >
                    {btn}
                  </button>
              ))}
            </div>

            <button 
              className="close-btn" 
              onClick={() => {
                setShowCalc(false);
                setCalcValue("");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Notes;