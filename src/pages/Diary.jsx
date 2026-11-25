
import { useEffect, useState } from "react";

const DB_NAME = "MaternalHealthDiary";
const STORE_NAME = "diaryEntries";

function openDiaryDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id"
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function diaryRequest(mode, action, data) {
  const db = await openDiaryDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    let request;

    if (action === "getAll") {
      request = store.getAll();
    } else if (action === "put") {
      request = store.put(data);
    } else if (action === "delete") {
      request = store.delete(data);
    }

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => reject(transaction.error);
  });
}

function Diary() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "Personal note",
    content: ""
  });

  const loadEntries = async () => {
    try {
      const saved = await diaryRequest(
        "readonly",
        "getAll"
      );

      saved.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setEntries(saved);
    } catch (error) {
      console.error("Could not load diary:", error);
      setMessage("Unable to load your diary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setForm({
      title: "",
      category: "Personal note",
      content: ""
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const existing = entries.find(
        (entry) => entry.id === editingId
      );

      const entry = {
        id: editingId || crypto.randomUUID(),
        title: form.title.trim(),
        category: form.category,
        content: form.content.trim(),
        date: existing?.date || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: "pending"
      };

      await diaryRequest("readwrite", "put", entry);

      await loadEntries();

      setMessage(
        editingId
          ? "Your diary entry was updated."
          : "Your diary entry was saved."
      );

      resetForm();
    } catch (error) {
      console.error("Could not save diary entry:", error);
      setMessage("Could not save your entry. Please try again.");
    }
  };

  const handleEdit = (entry) => {
    setForm({
      title: entry.title,
      category: entry.category,
      content: entry.content
    });

    setEditingId(entry.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this diary entry?")) return;

    try {
      await diaryRequest("readwrite", "delete", id);
      await loadEntries();
      setMessage("Diary entry deleted.");
    } catch {
      setMessage("Unable to delete diary entry.");
    }
  };

  const handleSync = () => {
    if (!online) {
      setMessage("Connect to the internet before syncing.");
      return;
    }

    setMessage(
      "Your entries are safely saved locally. Connect the secure sync API to upload them to your account."
    );
  };

  const questions = entries.filter(
    (entry) => entry.category === "Question for clinician"
  );

  const notes = entries.filter(
    (entry) => entry.category === "Personal note"
  );

  return (
    <div className="page-container">

      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR PRIVATE SPACE</span>
          <h1>My Diary</h1>
          <p>
            A safe personal space to write your thoughts,
            experiences and questions.
          </p>
        </div>

        <div className="heading-icon">📔</div>
      </div>

      {/* Privacy information */}
      <div className="privacy-notice">
        <span>🔐</span>
        <div>
          <strong>Your diary is private</strong>
          <p>
            Entries are saved on this device using IndexedDB.
            This demonstration does not upload your notes
            to a server.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon purple">📖</span>
          <div>
            <h3>{entries.length}</h3>
            <p>Total entries</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon pink">💭</span>
          <div>
            <h3>{notes.length}</h3>
            <p>Personal notes</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon teal">❔</span>
          <div>
            <h3>{questions.length}</h3>
            <p>Questions saved</p>
          </div>
        </div>
      </div>

      {/* New entry form */}
      <div className="content-card">
        <div className="card-heading">
          <div>
            <h2>
              {editingId ? "Edit Entry" : "Write in Your Diary"}
            </h2>
            <p>
              Save something important about your journey.
            </p>
          </div>

          <span className="card-heading-icon">✍️</span>
        </div>

        {message && (
          <div className="success-message" role="status">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        <form className="diary-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Entry Title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Give your entry a title..."
              value={form.title}
              onChange={handleChange}
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Entry Type</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="Personal note">
                Personal note
              </option>
              <option value="Question for clinician">
                Question for clinician
              </option>
              <option value="Journey reflection">
                Journey reflection
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Your Entry</label>
            <textarea
              id="content"
              name="content"
              placeholder="Write your thoughts or questions here..."
              value={form.content}
              onChange={handleChange}
              rows="6"
              required
            />
          </div>

          <div className="form-actions">
            {editingId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}

            <button className="btn-primary" type="submit">
              {editingId ? "Update Entry" : "+ Save Entry"}
            </button>
          </div>
        </form>
      </div>

      {/* Diary entries */}
      <div className="content-card">
        <div className="card-heading">
          <div>
            <h2>My Saved Entries</h2>
            <p>Your personal diary history.</p>
          </div>

          <span className="card-heading-icon">📚</span>
        </div>

        {loading ? (
          <p>Loading your diary...</p>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <span>📔</span>
            <h3>Your diary is waiting</h3>
            <p>
              Start writing your first personal note or question.
            </p>
          </div>
        ) : (
          <div className="diary-list">
            {entries.map((entry) => (
              <article className="diary-entry" key={entry.id}>
                <div className="diary-entry-top">
                  <span className="diary-category">
                    {entry.category === "Question for clinician"
                      ? "❔"
                      : entry.category === "Journey reflection"
                      ? "💗"
                      : "📝"}{" "}
                    {entry.category}
                  </span>

                  <span className="sync-status pending">
                    ● Pending sync
                  </span>
                </div>

                <h3>{entry.title}</h3>

                <p className="diary-date">
                  {new Date(entry.date).toLocaleString()}
                </p>

                <p className="diary-content">
                  {entry.content}
                </p>

                <div className="diary-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => handleEdit(entry)}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(entry.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Offline and sync status */}
      <div className="sync-card">
        <div>
          <h3>
            {online ? "You are online" : "You are offline"}
          </h3>

          <p>
            {online
              ? "Your local entries are available. Server synchronization is not connected yet."
              : "Your entries remain saved on this device."}
          </p>
        </div>

        <span className={`connection-badge ${online ? "online" : "offline"}`}>
          ● {online ? "Online" : "Offline"}
        </span>

        <button
          className="btn-primary"
          onClick={handleSync}
        >
          Sync information
        </button>
      </div>

    </div>
  );
}

export default Diary;
