
import { useEffect, useState } from "react";

function Diary() {
  const [entries, setEntries] = useState(() => {
    return JSON.parse(localStorage.getItem("diaryEntries") || "[]");
  });

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("Personal Note");

  useEffect(() => {
    localStorage.setItem("diaryEntries", JSON.stringify(entries));
  }, [entries]);

  function saveEntry(e) {
    e.preventDefault();

    const newEntry = {
      id: Date.now(),
      title,
      note,
      type,
      date: new Date().toLocaleString(),
      status: "Pending sync"
    };

    setEntries([newEntry, ...entries]);

    setTitle("");
    setNote("");
    setType("Personal Note");
  }

  function deleteEntry(id) {
    if (window.confirm("Delete this diary entry?")) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR PRIVATE SPACE</span>
          <h1>My Diary</h1>
          <p>Write down your thoughts, experiences and questions.</p>
        </div>
        <div className="heading-icon">📖</div>
      </div>

      <div className="privacy-notice">
        <span>🔒</span>
        <div>
          <strong>Your diary is private</strong>
          <p>
            Entries are saved on this device in this demo.
            They are not uploaded to a server.
          </p>
        </div>
      </div>

      <div className="content-card">
        <h2>Create a New Entry</h2>

        <form onSubmit={saveEntry} className="diary-form">
          <label>Entry title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Give your entry a title"
            required
          />

          <label>Entry category</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option>Personal Note</option>
            <option>Question for Clinician</option>
            <option>Experience</option>
            <option>Symptom Record</option>
          </select>

          <label>Your note or question</label>
          <textarea
            rows="5"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Write your thoughts here..."
            required
          />

          <button type="submit" className="primary-btn">
            Save Diary Entry
          </button>
        </form>
      </div>

      <div className="content-card">
        <div className="section-title">
          <h2>Previous Entries</h2>
          <span>{entries.length} entries</span>
        </div>

        {entries.length === 0 ? (
          <div className="empty-state">
            <span>📝</span>
            <p>Your diary is empty. Start writing your first entry.</p>
          </div>
        ) : (
          <div className="diary-list">
            {entries.map(entry => (
              <article className="diary-entry" key={entry.id}>
                <div className="diary-entry-top">
                  <span className="category-tag">{entry.type}</span>
                  <span className="sync-status">● {entry.status}</span>
                </div>

                <h3>{entry.title}</h3>
                <p>{entry.note}</p>
                <small>{entry.date}</small>

                <button
                  className="delete-btn"
                  onClick={() => deleteEntry(entry.id)}
                >
                  Delete Entry
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Diary;
