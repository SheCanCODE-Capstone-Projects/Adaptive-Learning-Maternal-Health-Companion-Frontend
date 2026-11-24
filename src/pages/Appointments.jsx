
import { useEffect, useState } from "react";

const STORAGE_KEY = "maternal_appointments";

function Appointments() {
  const [appointments, setAppointments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    clinic: "",
    purpose: "",
    date: "",
    time: "",
    notes: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(appointments)
    );
  }, [appointments]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setForm({
      clinic: "",
      purpose: "",
      date: "",
      time: "",
      notes: ""
    });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const appointment = {
      ...form,
      id: editingId || crypto.randomUUID(),
      createdAt: editingId
        ? appointments.find((a) => a.id === editingId)?.createdAt
        : new Date().toISOString(),
      completed: editingId
        ? appointments.find((a) => a.id === editingId)?.completed || false
        : false
    };

    if (editingId) {
      setAppointments((previous) =>
        previous.map((item) =>
          item.id === editingId ? appointment : item
        )
      );
      setMessage("Appointment updated successfully!");
    } else {
      setAppointments((previous) => [
        ...previous,
        appointment
      ]);
      setMessage("Appointment added successfully!");
    }

    resetForm();
  };

  const handleEdit = (appointment) => {
    setForm({
      clinic: appointment.clinic,
      purpose: appointment.purpose,
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes || ""
    });

    setEditingId(appointment.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this appointment?")) return;

    setAppointments((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (editingId === id) resetForm();

    setMessage("Appointment deleted.");
  };

  const toggleCompleted = (id) => {
    setAppointments((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  const today = new Date().toISOString().split("T")[0];

  const sortedAppointments = [...appointments].sort(
    (a, b) =>
      new Date(`${a.date}T${a.time}`) -
      new Date(`${b.date}T${b.time}`)
  );

  const upcoming = sortedAppointments.filter(
    (item) => !item.completed && item.date >= today
  );

  const completed = appointments.filter(
    (item) => item.completed
  );

  const getStatus = (appointment) => {
    if (appointment.completed) return "Completed";

    if (appointment.date < today) return "Past due";

    const difference =
      new Date(appointment.date + "T00:00:00") -
      new Date(today + "T00:00:00");

    const days = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    if (days === 0) return "Today";
    if (days <= 3) return "Due soon";

    return "Upcoming";
  };

  return (
    <div className="page-container">

      {/* Page heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR HEALTH MATTERS</span>
          <h1>Appointments</h1>
          <p>
            Keep track of your clinic visits and important
            maternal healthcare appointments.
          </p>
        </div>

        <div className="heading-icon">📅</div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon purple">📅</span>
          <div>
            <h3>{appointments.length}</h3>
            <p>Total appointments</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon teal">⏰</span>
          <div>
            <h3>{upcoming.length}</h3>
            <p>Upcoming visits</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon pink">✓</span>
          <div>
            <h3>{completed.length}</h3>
            <p>Completed visits</p>
          </div>
        </div>
      </div>

      {/* Appointment form */}
      <div className="content-card">
        <div className="card-heading">
          <div>
            <h2>
              {editingId
                ? "Edit Appointment"
                : "Schedule a Visit"}
            </h2>
            <p>Enter your clinic appointment details.</p>
          </div>

          <span className="card-heading-icon">✚</span>
        </div>

        {message && (
          <div className="success-message" role="status">
            {message}
            <button onClick={() => setMessage("")}>
              ×
            </button>
          </div>
        )}

        <form
          className="appointment-form"
          onSubmit={handleSubmit}
        >
          <div className="form-grid">

            <div className="form-group">
              <label htmlFor="clinic">Clinic / Hospital</label>
              <input
                id="clinic"
                name="clinic"
                type="text"
                placeholder="Enter clinic name"
                value={form.clinic}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="purpose">Purpose of Visit</label>
              <select
                id="purpose"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                required
              >
                <option value="">Select purpose</option>
                <option value="Antenatal checkup">
                  Antenatal checkup
                </option>
                <option value="Postnatal checkup">
                  Postnatal checkup
                </option>
                <option value="Ultrasound appointment">
                  Ultrasound appointment
                </option>
                <option value="General consultation">
                  General consultation
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Appointment Date</label>
              <input
                id="date"
                name="date"
                type="date"
                min={today}
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Appointment Time</label>
              <input
                id="time"
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Write any questions or things to remember..."
                value={form.notes}
                onChange={handleChange}
                rows="3"
              />
            </div>

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

            <button type="submit" className="btn-primary">
              {editingId
                ? "Save Changes"
                : "+ Add Appointment"}
            </button>
          </div>
        </form>
      </div>

      {/* Upcoming appointments */}
      <div className="content-card">
        <div className="card-heading">
          <div>
            <h2>Upcoming Visits</h2>
            <p>Your scheduled clinic appointments.</p>
          </div>
          <span className="card-heading-icon">🗓️</span>
        </div>

        {upcoming.length === 0 ? (
          <div className="empty-state">
            <span>📅</span>
            <h3>No upcoming appointments</h3>
            <p>Your scheduled visits will appear here.</p>
          </div>
        ) : (
          <div className="appointment-list">
            {upcoming.map((appointment) => (
              <div
                className="appointment-item"
                key={appointment.id}
              >
                <div className="appointment-date">
                  <strong>
                    {new Date(
                      appointment.date + "T00:00:00"
                    ).getDate()}
                  </strong>
                  <span>
                    {new Date(
                      appointment.date + "T00:00:00"
                    ).toLocaleDateString("en", {
                      month: "short"
                    })}
                  </span>
                </div>

                <div className="appointment-details">
                  <h3>{appointment.purpose}</h3>
                  <p>🏥 {appointment.clinic}</p>
                  <p>
                    🕒 {appointment.time} · {appointment.date}
                  </p>

                  {appointment.notes && (
                    <p className="appointment-note">
                      {appointment.notes}
                    </p>
                  )}

                  <span
                    className={`status-badge ${getStatus(
                      appointment
                    ).toLowerCase().replace(" ", "-")}`}
                  >
                    {getStatus(appointment)}
                  </span>
                </div>

                <div className="appointment-actions">
                  <button
                    className="icon-btn"
                    title="Edit"
                    onClick={() => handleEdit(appointment)}
                  >
                    ✏️
                  </button>

                  <button
                    className="icon-btn"
                    title="Mark completed"
                    onClick={() =>
                      toggleCompleted(appointment.id)
                    }
                  >
                    ✓
                  </button>

                  <button
                    className="icon-btn delete-btn"
                    title="Delete"
                    onClick={() =>
                      handleDelete(appointment.id)
                    }
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed visits */}
      <div className="content-card">
        <div className="card-heading">
          <div>
            <h2>Completed Visits</h2>
            <p>Your previously completed appointments.</p>
          </div>
        </div>

        {completed.length === 0 ? (
          <p className="muted-text">
            No completed appointments yet.
          </p>
        ) : (
          completed.map((appointment) => (
            <div className="completed-item" key={appointment.id}>
              <div>
                <strong>{appointment.purpose}</strong>
                <p>
                  {appointment.clinic} · {appointment.date}
                </p>
              </div>
              <span className="status-badge completed">
                Completed
              </span>
            </div>
          ))
        )}
      </div>

      <div className="privacy-notice">
        <span>🔒</span>
        <p>
          Your appointment information is stored locally in
          this demonstration. It is not yet synchronized
          with a secure personal account.
        </p>
      </div>

    </div>
  );
}

export default Appointments;
