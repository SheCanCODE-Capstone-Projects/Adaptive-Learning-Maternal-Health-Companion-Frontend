
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "maternal_journey";

const stages = [
  { id: "first", label: "First trimester", weeks: "Weeks 1–12", icon: "🌱" },
  { id: "second", label: "Second trimester", weeks: "Weeks 13–27", icon: "🌷" },
  { id: "third", label: "Third trimester", weeks: "Weeks 28–40", icon: "🤰" },
  { id: "postpartum", label: "Postpartum", weeks: "After birth", icon: "👶" }
];

const lessons = [
  {
    id: 1,
    stage: "first",
    category: "Getting started",
    title: "Understanding Your Maternal Health Journey",
    description:
      "Learn how this companion helps you organize educational resources, appointments and personal questions.",
    duration: "5 min",
    icon: "🌱"
  },
  {
    id: 2,
    stage: "first",
    category: "Preparation",
    title: "Preparing for a Clinic Visit",
    description:
      "Explore ways to organize your appointment information and prepare questions for your healthcare professional.",
    duration: "4 min",
    icon: "📋"
  },
  {
    id: 3,
    stage: "second",
    category: "Learning",
    title: "Keeping Track of Your Journey",
    description:
      "Discover how to keep personal records and organize information discussed during your clinic visits.",
    duration: "5 min",
    icon: "📖"
  },
  {
    id: 4,
    stage: "second",
    category: "Preparation",
    title: "Questions to Discuss at Your Visit",
    description:
      "Learn how to prepare and save questions to discuss with your qualified healthcare provider.",
    duration: "4 min",
    icon: "💬"
  },
  {
    id: 5,
    stage: "third",
    category: "Preparation",
    title: "Planning for Your Upcoming Visits",
    description:
      "Learn how to organize upcoming appointments, important contacts and questions for your care team.",
    duration: "5 min",
    icon: "🗓️"
  },
  {
    id: 6,
    stage: "third",
    category: "Organization",
    title: "Preparing Your Personal Records",
    description:
      "Explore how to organize important documents and information for conversations with your care team.",
    duration: "4 min",
    icon: "📁"
  },
  {
    id: 7,
    stage: "postpartum",
    category: "Postpartum learning",
    title: "Organizing Your Postpartum Visits",
    description:
      "Learn how to record questions and keep track of appointments after childbirth.",
    duration: "5 min",
    icon: "👶"
  },
  {
    id: 8,
    stage: "postpartum",
    category: "Personal wellbeing",
    title: "Keeping a Personal Reflection Journal",
    description:
      "Explore how a private diary can help you record experiences and questions to discuss with your care team.",
    duration: "4 min",
    icon: "💗"
  }
];

function MyJourney() {
  const [journey, setJourney] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        stage: "first",
        expectedDate: "",
        completedLessons: []
      };
    } catch {
      return {
        stage: "first",
        expectedDate: "",
        completedLessons: []
      };
    }
  });

  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(journey)
    );
  }, [journey]);

  const currentStage = stages.find(
    (stage) => stage.id === journey.stage
  );

  const stageLessons = lessons.filter(
    (lesson) => lesson.stage === journey.stage
  );

  const completedCount = stageLessons.filter(
    (lesson) =>
      journey.completedLessons.includes(lesson.id)
  ).length;

  const progress = stageLessons.length
    ? Math.round(
        (completedCount / stageLessons.length) * 100
      )
    : 0;

  const handleStageChange = (e) => {
    setJourney((previous) => ({
      ...previous,
      stage: e.target.value
    }));

    setSelectedLesson(null);
  };

  const handleDateChange = (e) => {
    setJourney((previous) => ({
      ...previous,
      expectedDate: e.target.value
    }));
  };

  const toggleLesson = (id) => {
    setJourney((previous) => {
      const completed = previous.completedLessons.includes(id);

      return {
        ...previous,
        completedLessons: completed
          ? previous.completedLessons.filter(
              (lessonId) => lessonId !== id
            )
          : [...previous.completedLessons, id]
      };
    });
  };

  const allCompleted = stageLessons.every((lesson) =>
    journey.completedLessons.includes(lesson.id)
  );

  return (
    <div className="page-container">

      {/* Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR MATERNAL HEALTH STORY</span>
          <h1>My Journey</h1>
          <p>
            Learn, prepare and keep track of your maternal
            health journey, one step at a time.
          </p>
        </div>

        <div className="heading-icon">💜</div>
      </div>

      {/* Welcome card */}
      <div className="journey-welcome">
        <div className="journey-welcome-content">
          <span>EVERY JOURNEY IS SPECIAL</span>
          <h2>Your journey, your progress.</h2>
          <p>
            Explore educational resources designed around
            the stage you select. Save your learning progress
            and prepare questions for your care team.
          </p>
        </div>

        <div className="journey-illustration">
          🤰🏻
          <span>💗</span>
        </div>
      </div>

      {/* Stage selection */}
      <div className="content-card">
        <div className="card-heading">
          <div>
            <h2>Select Your Stage</h2>
            <p>
              Choose your current pregnancy or postpartum stage.
            </p>
          </div>
          <span className="card-heading-icon">🌸</span>
        </div>

        <div className="stage-grid">
          {stages.map((stage) => (
            <button
              type="button"
              key={stage.id}
              className={`stage-card ${
                journey.stage === stage.id ? "active" : ""
              }`}
              onClick={() => {
                setJourney((previous) => ({
                  ...previous,
                  stage: stage.id
                }));
                setSelectedLesson(null);
              }}
            >
              <span className="stage-icon">
                {stage.icon}
              </span>

              <strong>{stage.label}</strong>
              <small>{stage.weeks}</small>

              {journey.stage === stage.id && (
                <span className="stage-selected">
                  ✓ Selected
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="form-group expected-date">
          <label htmlFor="expectedDate">
            Expected Date (Optional)
          </label>

          <input
            id="expectedDate"
            type="date"
            value={journey.expectedDate}
            onChange={handleDateChange}
          />

          <small>
            This date is optional and is used only to help
            organize your personal timeline. It does not
            calculate medical recommendations.
          </small>
        </div>
      </div>

      {/* Current stage */}
      <div className="journey-stage-banner">
        <div>
          <span className="eyebrow">YOUR CURRENT STAGE</span>
          <h2>
            {currentStage.icon} {currentStage.label}
          </h2>
          <p>{currentStage.weeks}</p>
        </div>

        <div className="stage-progress-circle">
          <strong>{progress}%</strong>
          <span>Completed</span>
        </div>
      </div>

      {/* Learning progress */}
      <div className="content-card">
        <div className="card-heading">
          <div>
            <h2>Your Learning Progress</h2>
            <p>Keep learning at your own pace.</p>
          </div>
          <span className="card-heading-icon">🎯</span>
        </div>

        <div className="progress-info">
          <strong>{completedCount} of {stageLessons.length} lessons</strong>
          <span>{progress}%</span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {allCompleted && (
          <p className="completion-message">
            🎉 You have completed all the sample lessons
            in this stage!
          </p>
        )}
      </div>

      {/* Lessons */}
      <div className="content-card">
        <div className="card-heading">
          <div>
            <h2>Learning Modules</h2>
            <p>
              Educational demonstration material for your
              selected stage.
            </p>
          </div>

          <span className="card-heading-icon">📚</span>
        </div>

        <div className="sample-warning">
          <strong>Demo learning content</strong>
          <p>
            These are fictional sample lessons for demonstrating
            the application. They have not been clinically
            reviewed or approved. Replace them with content
            reviewed by qualified maternal-health professionals
            before public release.
          </p>
        </div>

        <div className="lesson-list">
          {stageLessons.map((lesson) => {
            const completed =
              journey.completedLessons.includes(lesson.id);

            return (
              <article className="lesson-card" key={lesson.id}>
                <div className="lesson-icon">
                  {lesson.icon}
                </div>

                <div className="lesson-details">
                  <span className="lesson-category">
                    {lesson.category}
                  </span>

                  <h3>{lesson.title}</h3>

                  <p>{lesson.description}</p>

                  <span className="lesson-duration">
                    ◷ {lesson.duration} read
                  </span>
                </div>

                <div className="lesson-actions">
                  <span
                    className={
                      completed
                        ? "lesson-completed"
                        : "lesson-pending"
                    }
                  >
                    {completed ? "✓ Completed" : "Not started"}
                  </span>

                  <button
                    className={
                      completed
                        ? "btn-secondary"
                        : "btn-primary"
                    }
                    onClick={() =>
                      setSelectedLesson(
                        selectedLesson === lesson.id
                          ? null
                          : lesson.id
                      )
                    }
                  >
                    {selectedLesson === lesson.id
                      ? "Close"
                      : "Open lesson"}
                  </button>
                </div>

                {selectedLesson === lesson.id && (
                  <div className="lesson-expanded">
                    <h4>{lesson.title}</h4>

                    <p>{lesson.description}</p>

                    <p>
                      <strong>Learning activity:</strong>{" "}
                      Think about what information you would
                      like to discuss with your healthcare
                      professional. You can record your
                      questions in My Diary.
                    </p>

                    <Link
                      to="/diary"
                      className="lesson-diary-link"
                    >
                      Write a question in My Diary →
                    </Link>

                    <button
                      className="btn-primary lesson-done-btn"
                      onClick={() => toggleLesson(lesson.id)}
                    >
                      {completed
                        ? "Mark as not completed"
                        : "Mark lesson as completed"}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="journey-quick-links">
        <Link to="/appointments" className="quick-link-card">
          <span>📅</span>
          <div>
            <h3>My Appointments</h3>
            <p>Manage your clinic visits.</p>
          </div>
          <strong>→</strong>
        </Link>

        <Link to="/diary" className="quick-link-card">
          <span>📔</span>
          <div>
            <h3>My Diary</h3>
            <p>Save your personal notes and questions.</p>
          </div>
          <strong>→</strong>
        </Link>
      </div>

      {/* Safety notice */}
      <div className="privacy-notice">
        <span>💜</span>
        <p>
          This application provides educational information
          and personal organization tools. It does not
          diagnose, treat or replace professional medical
          care. For urgent health concerns, contact a
          qualified healthcare professional or seek urgent
          care at a health facility.
        </p>
      </div>

    </div>
  );
}

export default MyJourney;
