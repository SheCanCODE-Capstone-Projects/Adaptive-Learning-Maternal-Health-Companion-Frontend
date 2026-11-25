import { useState } from "react";

function Learn() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [completed, setCompleted] = useState([]);

  const lessons = [
    {
      id: 1,
      title: "Understanding Pregnancy",
      category: "Pregnancy",
      description:
        "Learn about the different stages of pregnancy and the changes that may happen.",
      duration: "5 min read",
      icon: "🤰",
      color: "pink",
    },
    {
      id: 2,
      title: "Healthy Nutrition",
      category: "Nutrition",
      description:
        "Explore general nutrition information and healthy food choices during pregnancy.",
      duration: "7 min read",
      icon: "🥗",
      color: "green",
    },
    {
      id: 3,
      title: "Antenatal Care",
      category: "Pregnancy",
      description:
        "Understand the importance of attending scheduled antenatal clinic visits.",
      duration: "6 min read",
      icon: "🏥",
      color: "blue",
    },
    {
      id: 4,
      title: "Postpartum Care",
      category: "Postpartum",
      description:
        "Learn about general maternal care and support after childbirth.",
      duration: "8 min read",
      icon: "🤱",
      color: "purple",
    },
    {
      id: 5,
      title: "Newborn Care",
      category: "Newborn",
      description:
        "Explore basic newborn care and the importance of professional health support.",
      duration: "6 min read",
      icon: "👶",
      color: "orange",
    },
    {
      id: 6,
      title: "Preparing for Delivery",
      category: "Pregnancy",
      description:
        "Learn about preparing for a maternity facility visit and birth.",
      duration: "5 min read",
      icon: "💗",
      color: "pink",
    },
  ];

  const categories = [
    "All",
    "Pregnancy",
    "Nutrition",
    "Postpartum",
    "Newborn",
  ];

  const filteredLessons =
    selectedCategory === "All"
      ? lessons
      : lessons.filter(
          (lesson) => lesson.category === selectedCategory
        );

  const toggleCompleted = (id) => {
    setCompleted((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const progress = Math.round(
    (completed.length / lessons.length) * 100
  );

  return (
    <div className="page-container">

      <section className="learn-hero">
        <div className="hero-text">
          <span className="eyebrow">MATERNAL HEALTH EDUCATION</span>

          <h1>
            Learn, Grow & <span>Stay Healthy.</span>
          </h1>

          <p>
            Discover educational resources designed to support
            you throughout pregnancy and after childbirth.
          </p>

          <a href="#lessons" className="primary-btn">
            Explore Lessons →
          </a>
        </div>

        <div className="hero-illustration">
          <div className="hero-circle">
            <span>🤰</span>
          </div>

          <div className="floating-card">
            <span>💚</span>
            <div>
              <strong>Your Learning Journey</strong>
              <small>Learn at your own pace</small>
            </div>
          </div>
        </div>
      </section>

      <section className="progress-section">
        <div>
          <span className="section-label">YOUR PROGRESS</span>
          <h2>Keep learning every day!</h2>
          <p>Track your completed learning modules.</p>
        </div>

        <div className="progress-info">
          <strong>{progress}%</strong>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <small>
            {completed.length} of {lessons.length} lessons completed
          </small>
        </div>
      </section>

      <section className="lessons-section" id="lessons">
        <div className="section-heading">
          <div>
            <span className="section-label">EDUCATIONAL RESOURCES</span>
            <h2>Explore Learning Modules</h2>
            <p>Choose a topic to start learning.</p>
          </div>
        </div>

        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="lesson-grid">
          {filteredLessons.map((lesson) => (
            <div className="lesson-card" key={lesson.id}>
              <div className={`lesson-icon ${lesson.color}`}>
                {lesson.icon}
              </div>

              <span className="lesson-category">
                {lesson.category}
              </span>

              <h3>{lesson.title}</h3>

              <p>{lesson.description}</p>

              <div className="lesson-bottom">
                <span>⏱ {lesson.duration}</span>

                <button
                  className={
                    completed.includes(lesson.id)
                      ? "completed-btn"
                      : "read-btn"
                  }
                  onClick={() => toggleCompleted(lesson.id)}
                >
                  {completed.includes(lesson.id)
                    ? "✓ Completed"
                    : "Mark Complete →"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="learning-tip">
        <div className="tip-icon">💡</div>
        <div>
          <h3>Remember!</h3>
          <p>
            These are educational sample lessons. Always consult
            qualified healthcare professionals for personal
            medical advice and care.
          </p>
        </div>
      </section>

    </div>
  );
}

export default Learn;