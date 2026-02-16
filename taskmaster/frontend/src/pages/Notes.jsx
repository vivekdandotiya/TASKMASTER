import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaEdit, FaCalculator } from "react-icons/fa";
import "../notes.css";

function Notes() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showCalc, setShowCalc] = useState(false);
  const [calcValue, setCalcValue] = useState("");

  // Add / Update Note
  const handleAddNote = () => {
    if (!title || !content) return;

    if (editingId) {
      setNotes(
        notes.map((note) =>
          note.id === editingId ? { ...note, title, content } : note
        )
      );
      setEditingId(null);
    } else {
      setNotes([
        ...notes,
        { id: Date.now(), title, content },
      ]);
    }

    setTitle("");
    setContent("");
  };

  // Delete
  const handleDelete = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  // Edit
  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  // Calculator
  const handleCalc = (value) => {
    if (value === "=") {
      try {
        setCalcValue(eval(calcValue).toString());
      } catch {
        setCalcValue("Error");
      }
    } else if (value === "C") {
      setCalcValue("");
    } else {
      setCalcValue(calcValue + value);
    }
  };

  return (
    <div className="notes-container">

      {/* Header */}
      <div className="notes-header">
        <h1>📝 Notes</h1>

        <div className="header-buttons">
          <button className="redirect-btn" onClick={() => navigate("/")}>
            Dashboard
          </button>

          <button className="calc-btn" onClick={() => setShowCalc(true)}>
            <FaCalculator />
          </button>
        </div>
      </div>

      {/* Add Section */}
      <div className="note-input-box">
        <input
          type="text"
          placeholder="Note Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button onClick={handleAddNote}>
          {editingId ? "Update Note" : "Add Note"}
        </button>
      </div>

      {/* Notes List */}
      <div className="notes-grid">
        {notes.length === 0 ? (
          <p className="empty">No notes yet...</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.content}</p>

              <div className="note-actions">
                <FaEdit onClick={() => handleEdit(note)} />
                <FaTrash onClick={() => handleDelete(note.id)} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Calculator Modal */}
      {showCalc && (
        <div className="calc-overlay">
          <div className="calc-modal">
            <div className="calc-display">{calcValue}</div>

            <div className="calc-buttons">
              {["7","8","9","/","4","5","6","*","1","2","3","-","0",".","C","+","="]
                .map((btn, i) => (
                  <button key={i} onClick={() => handleCalc(btn)}>
                    {btn}
                  </button>
              ))}
            </div>

            <button className="close-btn" onClick={() => setShowCalc(false)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Notes;
