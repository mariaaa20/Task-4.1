import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

const STORAGE_KEY = "acl-course-pulse-v2";

const COURSES = {
  CSEN701: {
    name: "Advanced Computer Lab",
    category: "Computer Science",
    description: "A project-focused course emphasizing teamwork, planning, software development, and delivery across several milestones.",
    history: [
      { year: "2025/26", instructors: ["Dr. Mariam Farouk"], tas: ["Yara Hassan", "Omar Fawzy"] },
      { year: "2024/25", instructors: ["Dr. Karim Nabil"], tas: ["Nour Adel", "Mina Sameh"] }
    ]
  },
  MATH204: {
    name: "Linear Algebra",
    category: "Mathematics",
    description: "Vectors, matrices, linear systems, and mathematical methods used in technical problem solving.",
    history: [
      { year: "2025/26", instructors: ["Dr. Salma Younis"], tas: ["Layla Maher", "Ahmed Sherif"] },
      { year: "2024/25", instructors: ["Dr. Rana Hamdy"], tas: ["Youssef Tarek", "Dina Mourad"] }
    ]
  },
  CSEN401: {
    name: "Software Engineering",
    category: "Computer Science",
    description: "Software requirements, architecture, implementation practices, testing, and collaborative development.",
    history: [
      { year: "2025/26", instructors: ["Dr. Tamer Elsayed"], tas: ["Rana Fathy", "Adham Khalil"] },
      { year: "2024/25", instructors: ["Dr. Hala Mansour"], tas: ["Malak Samir", "Ali Mahmoud"] }
    ]
  },
  HUMA101: {
    name: "Critical Thinking & Communication",
    category: "Humanities",
    description: "A discussion-based course about assessing arguments, presenting ideas, and communicating effectively.",
    history: [
      { year: "2025/26", instructors: ["Dr. Dina Saad"], tas: ["Mariam Hossam", "Youssef Nader"] },
      { year: "2024/25", instructors: ["Dr. Reem Taha"], tas: ["Farah Amr", "Sara Magdy"] }
    ]
  },
  CSEN202: {
    name: "Data Structures",
    category: "Computer Science",
    description: "Core data organization techniques and algorithms, with a focus on selecting suitable structures for different problems.",
    history: [
      { year: "2025/26", instructors: ["Dr. Amina Rashed"], tas: ["Rami Elshamy", "Nada Wael"] },
      { year: "2024/25", instructors: ["Dr. Yasser Salem"], tas: ["Hana Ehab", "Bassel Mostafa"] }
    ]
  }
};

const SEED_REVIEWS = [
  { id: "r1", courseCode: "CSEN701", rating: 4, comment: "A challenging team project. The weekly milestones helped.", owner: "you", name: "You", date: "2026-10-06" },
  { id: "r2", courseCode: "CSEN701", rating: 5, comment: "You learn the most when your group communicates well.", owner: "other", name: "Farida", date: "2026-10-02" },
  { id: "r3", courseCode: "MATH204", rating: 3, comment: "Useful material but the pace felt fast.", owner: "other", name: "Karim", date: "2026-09-28" },
  { id: "r4", courseCode: "CSEN401", rating: 4, comment: "Tutorial exercises are very important.", owner: "you", name: "You", date: "2026-09-24" },
  { id: "r5", courseCode: "HUMA101", rating: 5, comment: "Well organized and approachable.", owner: "other", name: "Mariam", date: "2026-09-21" },
  { id: "r6", courseCode: "CSEN701", rating: 3, comment: "Good practical work, but demanding during exam week.", owner: "other", name: "Youssef", date: "2026-09-15" },
  { id: "r7", courseCode: "MATH204", rating: 5, comment: "Excellent explanation of difficult concepts.", owner: "other", name: "Nadine", date: "2026-08-30" },
  { id: "r8", courseCode: "CSEN401", rating: 2, comment: "More worked examples in lectures would help.", owner: "other", name: "Adam", date: "2026-08-17" },
  { id: "r9", courseCode: "CSEN202", rating: 4, comment: "The assignments strengthened problem-solving skills.", owner: "other", name: "Hassan", date: "2026-08-09" }
];

function loadReviews() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : SEED_REVIEWS;
  } catch {
    return SEED_REVIEWS;
  }
}

const courseInfo = code => COURSES[code] || {
  name: "Course details not yet added",
  category: "Other",
  description: "This course does not have a profile in the example catalog.",
  history: []
};

const average = items => items.length
  ? (items.reduce((sum, review) => sum + review.rating, 0) / items.length).toFixed(1)
  : "—";

const stars = rating => "★".repeat(rating) + "☆".repeat(5 - rating);

export default function App() {
  const [reviews, setReviews] = useState(loadReviews);
  const [page, setPage] = useState("overview");
  const [activeCourse, setActiveCourse] = useState(null);
  const [search, setSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    const syncRoute = () => {
      const match = window.location.hash.match(/^#\/courses\/([^/?#]+)$/);
      setActiveCourse(match ? decodeURIComponent(match[1]).toUpperCase() : null);
      if (!match) setPage("overview");
    };

    syncRoute();
    window.addEventListener("hashchange", syncRoute);

    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  const openCourse = code => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;

    window.location.hash = `#/courses/${encodeURIComponent(normalized)}`;
    setActiveCourse(normalized);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goTo = destination => {
    window.location.hash = "/";
    setActiveCourse(null);
    setPage(destination);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const courseReviews = code =>
    reviews.filter(review => review.courseCode === code);

  const filteredReviews = useMemo(() =>
    reviews.filter(review => {
      const matchesRating =
        ratingFilter === "all" ||
        review.rating === Number(ratingFilter);

      const text =
        `${review.courseCode} ${courseInfo(review.courseCode).name} ${review.comment} ${review.name}`.toLowerCase();

      return matchesRating && text.includes(search.toLowerCase());
    }), [reviews, ratingFilter, search]);

  const myReviews = reviews.filter(review => review.owner === "you");

  const courseCards = Object.entries(COURSES).filter(([code, course]) =>
    `${code} ${course.name} ${course.category}`
      .toLowerCase()
      .includes(courseSearch.toLowerCase())
  );

  function openEditor(review = null, presetCourse = "") {
    if (review && review.owner !== "you") return;

    setError("");

    setEditor({
      id: review?.id || null,
      courseCode: review?.courseCode || presetCourse,
      rating: review ? String(review.rating) : "",
      comment: review?.comment || ""
    });
  }

  function submitReview(event) {
    event.preventDefault();

    const code = editor.courseCode.trim().toUpperCase();

    if (!code) {
      return setError("Enter a course code.");
    }

    if (!/^[1-5]$/.test(editor.rating)) {
      return setError("Rating must be a whole number from 1 to 5.");
    }

    const duplicate = reviews.some(review =>
      review.id !== editor.id &&
      review.owner === "you" &&
      review.courseCode.toUpperCase() === code
    );

    if (duplicate) {
      return setError(
        "You have already reviewed this course. Edit your existing review instead."
      );
    }

    const payload = {
      courseCode: code,
      rating: Number(editor.rating),
      comment: editor.comment.trim(),
      name: "You",
      owner: "you",
      date: new Date().toISOString().slice(0, 10)
    };

    if (editor.id) {
      setReviews(current =>
        current.map(review =>
          review.id === editor.id
            ? { ...review, ...payload }
            : review
        )
      );

      setNotice("Your review has been updated.");
    } else {
      setReviews(current => [
        { ...payload, id: `r-${Date.now()}` },
        ...current
      ]);

      setNotice("Your review has been published.");
    }

    setEditor(null);
  }

  function resetDemo() {
    setReviews(SEED_REVIEWS);
    setSearch("");
    setCourseSearch("");
    setRatingFilter("all");
    setNotice("Example data restored.");
  }

  const allAverage = average(reviews);

  const ratedCourses =
    new Set(reviews.map(review => review.courseCode)).size;

  const distribution = [5, 4, 3, 2, 1].map(value => ({
    value,
    count: reviews.filter(review => review.rating === value).length
  }));

  const maxDistribution = Math.max(
    ...distribution.map(item => item.count),
    1
  );

  return (
    <div className="app-shell">

      {/* LEFT SIDEBAR */}
      <aside className="sidebar">

        <button
          className="brand"
          onClick={() => goTo("overview")}
          aria-label="CoursePulse home"
        >
          <span className="brand-mark">c.</span>
          <span>
            course<span className="brand-accent">pulse</span>
          </span>
        </button>

        <div className="nav-label">WORKSPACE</div>

        <button
          className={`nav-item ${page === "overview" && !activeCourse ? "active" : ""}`}
          onClick={() => goTo("overview")}
        >
          <span>⌂</span> Overview
        </button>

        <button
          className={`nav-item ${page === "courses" ? "active" : ""}`}
          onClick={() => goTo("courses")}
        >
          <span>▦</span> Explore courses
        </button>

        <button
          className={`nav-item ${page === "reviews" ? "active" : ""}`}
          onClick={() => goTo("reviews")}
        >
          <span>☷</span> Browse reviews
        </button>

        <div className="nav-label nav-spaced">YOUR SPACE</div>

        <button
          className={`nav-item ${page === "mine" ? "active" : ""}`}
          onClick={() => goTo("mine")}
        >
          <span>♡</span> Your reviews
        </button>

        <div className="sidebar-bottom">
          <div className="avatar">Y</div>
          <div>
            <strong>You</strong>
            <small>Student account</small>
          </div>
        </div>

      </aside>

      <main className="main-content">

        {notice && (
          <div className="notice" role="status">
            {notice}
            <button onClick={() => setNotice("")} aria-label="Dismiss notice">
              ×
            </button>
          </div>
        )}

        {activeCourse ? (

          <CoursePage
            code={activeCourse}
            reviews={courseReviews(activeCourse)}
            onBack={() => goTo("courses")}
            onWrite={() => openEditor(null, activeCourse)}
            onEdit={openEditor}
          />

        ) : page === "courses" ? (

          <>
            <PageHeading
              eyebrow="FIND YOUR NEXT CLASS"
              title="Explore courses"
              description="Compare course feedback before making your choice."
            />

            <div className="toolbar">
              <div className="search-field">
                <span>⌕</span>
                <input
                  value={courseSearch}
                  onChange={event => setCourseSearch(event.target.value)}
                  placeholder="Search by course name or code..."
                />
              </div>
              <span className="result-count">
                {courseCards.length} courses
              </span>
            </div>

            <div className="course-grid">
              {courseCards.map(([code, course]) => {
                const items = courseReviews(code);

                return (
                  <button
                    className="course-card"
                    key={code}
                    onClick={() => openCourse(code)}
                  >
                    <div className="card-topline">
                      <span className="course-category">
                        {course.category}
                      </span>
                      <span className="card-arrow">↗</span>
                    </div>

                    <span className="course-code">{code}</span>

                    <h2>{course.name}</h2>

                    <p>{course.description}</p>

                    <div className="course-card-footer">
                      <span className="stars">
                        {items.length
                          ? stars(Math.round(Number(average(items))))
                          : "☆☆☆☆☆"}
                      </span>

                      <strong>
                        {average(items)} <small>/ 5</small>
                      </strong>

                      <span className="review-count">
                        {items.length} reviews
                      </span>
                    </div>
                  </button>
                );
              })}

              {!courseCards.length && (
                <div className="empty-state">
                  No courses match your search.
                </div>
              )}
            </div>
          </>

        ) : page === "reviews" || page === "mine" ? (

          <>
            <PageHeading
              eyebrow="STUDENT VOICES"
              title={page === "mine" ? "Your reviews" : "Browse reviews"}
              description={
                page === "mine"
                  ? "All the feedback you have shared with the community."
                  : "Realistic sample feedback to help you compare courses."
              }
            />

            <ReviewList
              reviews={page === "mine" ? myReviews : filteredReviews}
              onEdit={openEditor}
              onCourse={openCourse}
              search={search}
              setSearch={setSearch}
              ratingFilter={ratingFilter}
              setRatingFilter={setRatingFilter}
              onReset={resetDemo}
              showReset={page === "reviews"}
            />
          </>

        ) : (

          <>
            <PageHeading
              eyebrow="ACADEMIC FEEDBACK PORTAL"
              title="Choose with confidence."
              description="A clearer view of courses, student experiences, and academic feedback."
            />

            <section className="welcome-panel">
              <div>
                <span className="welcome-kicker">
                  YOUR COURSE COMPANION
                </span>

                <h2>
                  Make your next course choice
                  <br />
                  a more informed one.
                </h2>

                <p>
                  Explore course profiles, compare student ratings,
                  and learn from previous experiences.
                </p>

                <button
                  className="light-button"
                  onClick={() => goTo("courses")}
                >
                  Explore courses <span>→</span>
                </button>
              </div>

              <div className="welcome-art">
                <div className="art-circle circle-one"></div>
                <div className="art-circle circle-two"></div>

                <div className="art-card">
                  <span>COURSE INSIGHT</span>
                  <strong>{allAverage}</strong>
                  <small>community average / 5</small>
                  <div className="art-stars">★★★★★</div>
                </div>
              </div>
            </section>

            <section className="stats-grid">
              <StatCard
                label="STUDENT REVIEWS"
                value={reviews.length}
                note="Community contributions"
                icon="✎"
              />

              <StatCard
                label="AVERAGE RATING"
                value={`${allAverage} / 5`}
                note="Across all submitted reviews"
                icon="★"
              />

              <StatCard
                label="COURSES REVIEWED"
                value={ratedCourses}
                note="Unique course codes"
                icon="▦"
              />
            </section>

            <div className="section-heading">
              <div>
                <span className="section-kicker">START EXPLORING</span>
                <h2>Popular course profiles</h2>
              </div>

              <button
                className="text-button"
                onClick={() => goTo("courses")}
              >
                View all courses →
              </button>
            </div>

            <div className="featured-grid">
              {Object.entries(COURSES).slice(0, 3).map(([code, course]) => {
                const items = courseReviews(code);

                return (
                  <button
                    className="featured-card"
                    key={code}
                    onClick={() => openCourse(code)}
                  >
                    <span className="course-code">{code}</span>
                    <h3>{course.name}</h3>
                    <p>{course.category}</p>

                    <div>
                      <strong>{average(items)}</strong>
                      <span> / 5 · {items.length} reviews</span>
                      <b>↗</b>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="overview-bottom">

              <section className="surface rating-breakdown">
                <div className="section-heading compact">
                  <div>
                    <span className="section-kicker">COMMUNITY SIGNAL</span>
                    <h2>Rating breakdown</h2>
                  </div>
                </div>

                {distribution.map(item => (
                  <div className="distribution-row" key={item.value}>
                    <span>{item.value} ★</span>

                    <div className="distribution-track">
                      <i
                        style={{
                          width: `${item.count / maxDistribution * 100}%`
                        }}
                      />
                    </div>

                    <small>{item.count}</small>
                  </div>
                ))}
              </section>

              <section className="surface quick-review">
                <span className="section-kicker">HAVE AN OPINION?</span>

                <h2>
                  Your experience can help someone choose.
                </h2>

                <p>
                  Share what worked, what was challenging,
                  and what future students should know.
                </p>

                <button
                  className="primary-button"
                  onClick={() => openEditor()}
                >
                  Write your review <span>→</span>
                </button>
              </section>

            </div>
          </>
        )}

      </main>

      {editor && (
        <ReviewModal
          editor={editor}
          setEditor={setEditor}
          error={error}
          onSubmit={submitReview}
        />
      )}

    </div>
  );
}

function PageHeading({ eyebrow, title, description }) {
  return (
    <header className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  );
}

function StatCard({ label, value, note, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function CoursePage({ code, reviews, onBack, onWrite, onEdit }) {
  const course = courseInfo(code);

  return (
    <section className="course-detail">

      <button className="back-link" onClick={onBack}>
        ← Back to courses
      </button>

      <div className="detail-hero">
        <div>
          <span className="eyebrow">
            COURSE PROFILE · {course.category.toUpperCase()}
          </span>

          <span className="course-code detail-code">{code}</span>

          <h1>{course.name}</h1>
          <p>{course.description}</p>
        </div>

        <div className="detail-score">
          <span>AVERAGE RATING</span>
          <strong>{average(reviews)}</strong>
          <small>out of 5 · {reviews.length} reviews</small>
        </div>
      </div>

      <div className="detail-columns">

        <section className="surface history-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">WHO TAUGHT IT?</span>
              <h2>Teaching history</h2>
            </div>
          </div>

          <p className="muted-copy">
            Illustrative teaching information for the previous two academic years.
          </p>

          {course.history.length ? (
            course.history.map(item => (
              <div className="history-entry" key={item.year}>
                <span className="year-pill">{item.year}</span>

                <div>
                  <small>
                    INSTRUCTOR{item.instructors.length > 1 ? "S" : ""}
                  </small>
                  <p>{item.instructors.join(", ")}</p>
                </div>

                <div>
                  <small>TEACHING ASSISTANTS</small>
                  <p>{item.tas.join(", ")}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">
              No teaching records are available for this course.
            </p>
          )}

          <div className="fictional-note">
            ⓘ Sample data only. All staff names are fictional and are not historical GUC records.
          </div>
        </section>

        <section className="surface feedback-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">LEARN FROM OTHERS</span>
              <h2>Student reviews</h2>
            </div>

            <button
              className="primary-button small-button"
              onClick={onWrite}
            >
              ＋ Write review
            </button>
          </div>

          <p className="muted-copy">
            Feedback shared by students about {code}.
          </p>

          {reviews.length ? (
            reviews.map(review => (
              <article className="review-item" key={review.id}>
                <div className="review-item-head">
                  <div className="avatar small-avatar">
                    {review.name === "You" ? "Y" : review.name.charAt(0)}
                  </div>

                  <div>
                    <strong>{review.name}</strong>
                    <small>{review.date}</small>
                  </div>

                  <span className="stars">{stars(review.rating)}</span>
                </div>

                <p>{review.comment || "No comment provided."}</p>

                {review.owner === "you" && (
                  <button
                    className="text-button"
                    onClick={() => onEdit(review)}
                  >
                    Edit your review
                  </button>
                )}
              </article>
            ))
          ) : (
            <div className="empty-state">
              No reviews yet. Be the first to share your experience.
            </div>
          )}
        </section>

      </div>
    </section>
  );
}

function ReviewList({
  reviews,
  onEdit,
  onCourse,
  search,
  setSearch,
  ratingFilter,
  setRatingFilter,
  onReset,
  showReset
}) {
  return (
    <section className="surface review-browser">

      <div className="filter-toolbar">
        <div className="search-field">
          <span>⌕</span>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search course, comment, or student..."
          />
        </div>

        <select
          value={ratingFilter}
          onChange={event => setRatingFilter(event.target.value)}
          aria-label="Filter by rating"
        >
          <option value="all">All ratings</option>
          {[5, 4, 3, 2, 1].map(value => (
            <option value={value} key={value}>
              {value} stars
            </option>
          ))}
        </select>

        {showReset && (
          <button className="secondary-button" onClick={onReset}>
            Reset demo
          </button>
        )}
      </div>

      {reviews.length ? (
        <div className="review-table-wrap">
          <table className="review-table">
            <thead>
              <tr>
                <th>COURSE</th>
                <th>RATING</th>
                <th>STUDENT COMMENT</th>
                <th>REVIEWER</th>
                <th>DATE</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {reviews.map(review => (
                <tr key={review.id}>
                  <td>
                    <button
                      className="table-course-link"
                      onClick={() => onCourse(review.courseCode)}
                    >
                      <strong>{review.courseCode}</strong>
                      <small>{courseInfo(review.courseCode).name}</small>
                    </button>
                  </td>

                  <td className="stars">{stars(review.rating)}</td>

                  <td className="comment-cell">
                    {review.comment || "No comment provided."}
                  </td>

                  <td>{review.name}</td>
                  <td>{review.date}</td>

                  <td>
                    {review.owner === "you" ? (
                      <button
                        className="text-button"
                        onClick={() => onEdit(review)}
                      >
                        Edit
                      </button>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          No reviews match your search.
        </div>
      )}

      <div className="table-footer">
        Showing {reviews.length} review{reviews.length === 1 ? "" : "s"}
      </div>
    </section>
  );
}

function ReviewModal({ editor, setEditor, error, onSubmit }) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={event =>
        event.target === event.currentTarget && setEditor(null)
      }
    >
      <section
        className="review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">YOUR CONTRIBUTION</span>
            <h2 id="modal-heading">
              {editor.id ? "Edit your review" : "Write a review"}
            </h2>
            <p>
              Your feedback helps other students make informed choices.
            </p>
          </div>

          <button
            className="close-button"
            onClick={() => setEditor(null)}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <label>
            Course code
            <input
              autoFocus
              value={editor.courseCode}
              disabled={Boolean(editor.id)}
              onChange={event =>
                setEditor(current => ({
                  ...current,
                  courseCode: event.target.value
                }))
              }
              placeholder="e.g. CSEN701"
              required
            />
          </label>

          <label>
            Rating
            <select
              value={editor.rating}
              onChange={event =>
                setEditor(current => ({
                  ...current,
                  rating: event.target.value
                }))
              }
              required
            >
              <option value="">Choose a rating</option>
              {[5, 4, 3, 2, 1].map(value => (
                <option value={value} key={value}>
                  {value} — {
                    value === 5 ? "Excellent" :
                    value === 4 ? "Very good" :
                    value === 3 ? "Good" :
                    value === 2 ? "Fair" : "Poor"
                  }
                </option>
              ))}
            </select>
          </label>

          <label>
            Comment <span className="optional">(optional)</span>
            <textarea
              rows="5"
              value={editor.comment}
              onChange={event =>
                setEditor(current => ({
                  ...current,
                  comment: event.target.value
                }))
              }
              placeholder="What should other students know about this course?"
            />
          </label>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setEditor(null)}
            >
              Cancel
            </button>

            <button type="submit" className="primary-button">
              {editor.id ? "Save changes" : "Publish review"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}