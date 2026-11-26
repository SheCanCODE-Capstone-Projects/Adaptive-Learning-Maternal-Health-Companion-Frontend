
import React from "react";
import Sidebar from "../components/Sidebar";
import heroImg from "../assets/hero.png";

function Dashboard({
  currentPage,
  onNavigate,
}) {
  return (
    <div className="dashboard-layout">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
      />

      <main className="dashboard-main">

        {/* Pregnancy Stage Banner */}
        <section className="pregnancy-banner">
          <div className="pregnancy-image">
            <img src={heroImg} alt="Expectant mother" />
          </div>

          <div className="stage-info">
            <h3>Your Current Stage</h3>
            <h2>Second Trimester</h2>
            <p>(Weeks 13 – 27)</p>
            <button
              className="primary-button"
              onClick={() => onNavigate("my-journey")}
            >
              View My Journey <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          <div className="next-appointment">
            <i className="fa-regular fa-calendar-days"></i>
            <div>
              <p>Next Appointment</p>
              <h3>Dec 5, 2026</h3>
              <span>Prenatal Checkup</span>
            </div>
          </div>

          <div className="due-soon">
            <h3>
              <i className="fa-solid fa-circle-exclamation"></i> Due Soon!
            </h3>
            <p>Your next checkup is in 15 days.</p>
          </div>
        </section>

        {/* First Row of Cards */}
        <section className="dashboard-grid top-grid">

          {/* Learning Progress */}
          <article className="dashboard-card learning-card">
            <div className="card-heading">
              <h3>
                <i className="fa-solid fa-chart-simple"></i> Learning Progress
              </h3>
              <button
                className="card-link"
                onClick={() => onNavigate("progress")}
              >
                View All <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            <div className="learning-content">
              <div className="progress-circle">
                <div className="progress-inner">
                  <strong>60%</strong>
                  <span>Completed</span>
                </div>
              </div>

              <div className="lesson-list">
                <p><i className="fa-solid fa-circle-check completed"></i> Nutrition in Pregnancy</p>
                <p><i className="fa-solid fa-circle-check completed"></i> Danger Signs</p>
                <p><i className="fa-regular fa-circle circle-empty"></i> Birth Preparation</p>
                <p><i className="fa-regular fa-circle circle-empty"></i> Postpartum Care</p>
              </div>
            </div>
          </article>

          {/* Upcoming Appointments */}
          <article className="dashboard-card appointments-card">
            <div className="card-heading">
              <h3>
                <i className="fa-regular fa-calendar-days"></i> Upcoming Appointments
              </h3>
              <button
                className="card-link"
                onClick={() => onNavigate("appointments")}
              >
                View All <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            <div className="appointment-details">
              <div className="appointment-date">
                <span>DEC</span>
                <strong>5</strong>
              </div>

              <div>
                <h3>Prenatal Checkup</h3>
                <p>Kigali Health Center</p>
                <span>
                  <i className="fa-regular fa-clock"></i> 9:00 AM
                </span>
              </div>
            </div>
          </article>

          {/* Quick Actions */}
          <article className="dashboard-card quick-actions-card">
            <div className="card-heading">
              <h3>
                <i className="fa-solid fa-bolt"></i> Quick Actions
              </h3>
            </div>

            <div className="quick-actions">
              <button
                className="action-item action-purple"
                onClick={() => onNavigate("learn")}
              >
                <i className="fa-solid fa-graduation-cap"></i>
                <span>Start a Lesson</span>
              </button>

              <button
                className="action-item action-pink"
                onClick={() => onNavigate("diary")}
              >
                <i className="fa-solid fa-book-medical"></i>
                <span>Add Note</span>
              </button>

              <button
                className="action-item action-green"
                onClick={() => onNavigate("appointments")}
              >
                <i className="fa-solid fa-calendar-plus"></i>
                <span>Add Appointment</span>
              </button>

              <button
                className="action-item action-blue"
                onClick={() => onNavigate("facilities")}
              >
                <i className="fa-solid fa-hospital"></i>
                <span>Find a Facility</span>
              </button>
            </div>
          </article>
        </section>

        {/* Second Row of Cards */}
        <section className="dashboard-grid bottom-grid">

          {/* My Diary */}
          <article className="dashboard-card diary-card">
            <div className="card-heading">
              <h3>
                <i className="fa-solid fa-book"></i> My Diary
              </h3>
              <button
                className="card-link"
                onClick={() => onNavigate("diary")}
              >
                View All <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            <div className="diary-note">
              <p>Today, I feel well. Baby is moving a lot! ❤️</p>
              <div>
                <span>Nov 20, 2026 · Private</span>
                <i className="fa-solid fa-pen-to-square"></i>
              </div>
            </div>

            <button
              className="primary-button new-note-button"
              onClick={() => onNavigate("diary")}
            >
              <i className="fa-solid fa-plus"></i> New Note
            </button>
          </article>

          {/* Healthcare Facilities */}
          <article className="dashboard-card facilities-card">
            <div className="card-heading">
              <h3>
                <i className="fa-solid fa-hospital"></i> Healthcare Facilities
              </h3>
              <button
                className="card-link"
                onClick={() => onNavigate("facilities")}
              >
                View All <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            <div className="facility-content">
              <div className="facility-image">
                <img
                  src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600"
                  alt="Healthcare facility"
                />
              </div>

              <div className="facility-info">
                <span className="verified">
                  <i className="fa-solid fa-circle-check"></i> Verified
                </span>

                <h3>Kigali Health Center</h3>

                <p>
                  <i className="fa-solid fa-location-dot"></i>
                  Kigali, Rwanda
                </p>

                <p>
                  <i className="fa-solid fa-phone"></i>
                  0788 123 456
                </p>

                <button
                  className="outline-button"
                  onClick={() => onNavigate("facilities")}
                >
                  View Details <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </article>

          {/* Helpful Articles */}
          <article className="dashboard-card articles-card">
            <div className="card-heading">
              <h3>
                <i className="fa-solid fa-book-open"></i> Helpful Articles & Quizzes
              </h3>
            </div>

            <div className="article-content">
              <div className="article-illustration">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600"
                  alt="Maternal healthcare education"
                />
              </div>

              <div className="article-info">
                <h3>Nutrition During Pregnancy</h3>
                <p>Learn how to eat well for you and your baby.</p>
                <button
                  className="primary-button"
                  onClick={() => onNavigate("learn")}
                >
                  Read Article <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </article>

        </section>
      </main>
    </div>
  );
}

export default Dashboard;
