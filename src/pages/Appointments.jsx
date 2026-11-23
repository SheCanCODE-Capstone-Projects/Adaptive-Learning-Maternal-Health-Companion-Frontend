
import { useEffect, useState } from "react";

function Appointments() {
  const [appointments, setAppointments] = useState(() => {
    return JSON.parse(localStorage.getItem("appointments") || "[]");
  });

  const [form, setForm] = useState({
    clinic: "",
    purpose: "",
    date: "",
    time: ""
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (editingId) {
      setAppointments(appointments.map(item =>
        item.id === editingId ? { ...form, id: editingId } : item
      ));
      setEditingId(null);
    } else {
      setAppointments([
        ...appointments,
        { ...form, id: Date.now() }
      ]);
    }

    setForm({ clinic: "", purpose: "", date: "", time: "" });
  }

  function editAppointment(item) {
    setForm({
      clinic: item.clinic,
      purpose: item.purpose,
      date: item.date,
      time: item.time
    });
    setEditingId(item.id);
  }

  function deleteAppointment(id) {
    if (window.confirm("Delete this appointment?")) {
      setAppointments(appointments.filter(item => item.id !== id));
    }
  }

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(`${a.date}T${a.time}`) -
              new Date(`${b.date}T${b.time}`)
  );

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">HEALTH PLANNER</span>
          <h1>Appointments</h1>
          <p>Manage your clinic visits and upcoming appointments.</p>
        </div>
        <div className="heading-icon">📅</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Appointments</span>
          <h2>{appointments.length}</h2>
        </div>
        <div className="stat-card">
          <span>Upcoming Appointments</span>
          <h2>
            {appointments.filter(item =>
              new Date(`${item.date}T${item.time}`) >= new Date()
            ).length}
          </h2>
        </div>
      </div>

      <div className="content-card">
        <h2>{editingId ? "Edit Appointment" : "Add New Appointment"}</h2>

        <form className="appointment-form" onSubmit={handleSubmit}>
          <input
            name="clinic"
            placeholder="Clinic or hospital name"
            value={form.clinic}
            onChange={handleChange}
            required
          />

          <input
            name="purpose"
            placeholder="Appointment purpose"
            value={form.purpose}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />

          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            required
          />

          <button className="primary-btn" type="submit">
            {editingId ? "Update Appointment" : "Save Appointment"}
          </button>

          {editingId && (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setEditingId(null);
                setForm({ clinic: "", purpose: "", date: "", time: "" });
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="content-card">
        <h2>Your Scheduled Appointments</h2>

        {sortedAppointments.length === 0 ? (
          <div className="empty-state">
            <span>📅</span>
            <p>No appointments yet. Add your first appointment above.</p>
          </div>
        ) : (
          <div className="appointment-list">
            {sortedAppointments.map(item => (
              <div className="appointment-item" key={item.id}>
                <div className="appointment-date">
                  <strong>{item.date}</strong>
                  <span>{item.time}</span>
                </div>

                <div className="appointment-info">
                  <h3>{item.clinic}</h3>
                  <p>{item.purpose}</p>
                </div>

                <div className="item-actions">
                  <button onClick={() => editAppointment(item)}>
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteAppointment(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Appointments;
