
import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import heroImg from "../assets/hero.png";

function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Header />

        {/* Pregnancy stage banner */}
        <section className="pregnancy-banner">
          <div className="pregnancy-image">
            <img src={heroImg} alt="Expectant mother" />
          </div>

          <div className="stage-info">
            <h3>Your Current Stage</h3>
            <h2>Second Trimester</h2>
            <p>(Weeks 13 – 27)</p>
            <button className="primary-button">
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
            <h3><i className="fa-solid fa-circle-exclamation"></i> Due Soon!</h3>
            <p>Your next checkup is in 15 days.</p>
          </div>
        </section>

        {/* First row of cards */}
        <section className="dashboard-grid top-grid">

          <article className="dashboard-card learning-card">
            <div className="card-heading">
              <h3><i className="fa-solid fa-chart-simple"></i> Learning Progress</h3>
              <a href="#">View All <i className="fa-solid fa-arrow-right"></i></a>
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

          <article className="dashboard-card appointments-card">
            <div className="card-heading">
              <h3><i className="fa-regular fa-calendar-days"></i> Upcoming Appointments</h3>
              <a href="#">View All <i className="fa-solid fa-arrow-right"></i></a>
            </div>

            <div className="appointment-details">
              <div className="appointment-date">
                <span>DEC</span>
                <strong>5</strong>
              </div>

              <div>
                <h3>Prenatal Checkup</h3>
                <p>Kigali Health Center</p>
                <span><i className="fa-regular fa-clock"></i> 9:00 AM</span>
              </div>
            </div>
          </article>

          <article className="dashboard-card quick-actions-card">
            <div className="card-heading">
              <h3><i className="fa-solid fa-bolt"></i> Quick Actions</h3>
            </div>

            <div className="quick-actions">
              <button className="action-item action-purple">
                <i className="fa-solid fa-graduation-cap"></i>
                <span>Start a Lesson</span>
              </button>

              <button className="action-item action-pink">
                <i className="fa-solid fa-book-medical"></i>
                <span>Add Note</span>
              </button>

              <button className="action-item action-green">
                <i className="fa-solid fa-calendar-plus"></i>
                <span>Add Appointment</span>
              </button>

              <button className="action-item action-blue">
                <i className="fa-solid fa-hospital"></i>
                <span>Find a Facility</span>
              </button>
            </div>
          </article>
        </section>

        {/* Second row of cards */}
        <section className="dashboard-grid bottom-grid">

          <article className="dashboard-card diary-card">
            <div className="card-heading">
              <h3><i className="fa-solid fa-book"></i> My Diary</h3>
              <a href="#">View All <i className="fa-solid fa-arrow-right"></i></a>
            </div>

            <div className="diary-note">
              <p>Today, I feel well. Baby is moving a lot! ❤️</p>
              <div>
                <span>Nov 20, 2026 · Private</span>
                <i className="fa-solid fa-pen-to-square"></i>
              </div>
            </div>

            <button className="primary-button new-note-button">
              <i className="fa-solid fa-plus"></i> New Note
            </button>
          </article>

          <article className="dashboard-card facilities-card">
            <div className="card-heading">
              <h3><i className="fa-solid fa-hospital"></i> Healthcare Facilities</h3>
              <a href="#">View All <i className="fa-solid fa-arrow-right"></i></a>
            </div>

            <div className="facility-content">
              <div className="facility-image">
                <i className="fa-solid fa-hospital"></i>
              </div>

              <div className="facility-info">
                <span className="verified">
                  <i className="fa-solid fa-circle-check"></i> Verified
                </span>
                <h3>Kigali Health Center</h3>
                <p><i className="fa-solid fa-location-dot"></i> Kigali, Rwanda</p>
                <p><i className="fa-solid fa-phone"></i> 0788 123 456</p>
                <button className="outline-button">View Details <i className="fa-solid fa-arrow-right"></i></button>
              </div>
            </div>
          </article>

          <article className="dashboard-card articles-card">
            <div className="card-heading">
              <h3><i className="fa-solid fa-book-open"></i> Helpful Articles & Quizzes</h3>
            </div>

            <div className="article-content">
              <div className="article-illustration">
                <i className="fa-solid fa-person-pregnant"></i>
                <i className="fa-solid fa-book-open"></i>
              </div>

              <div>
                <h3>Nutrition During Pregnancy</h3>
                <p>Learn how to eat well for you and your baby.</p>
                <button className="primary-button">
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
