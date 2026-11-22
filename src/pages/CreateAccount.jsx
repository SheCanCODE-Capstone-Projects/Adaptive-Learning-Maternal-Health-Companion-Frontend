
import { useState } from "react";
import "./Login.css";

function CreateAccount({ onCreateAccount, onBackToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    if (password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    onCreateAccount();
  }

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-brand">
          <div className="login-logo">
            <i className="fa-solid fa-heart-pulse"></i>
          </div>
          <h2>MaternalCare</h2>
        </div>

        <div className="login-card">
          <div className="login-welcome">
            <span className="welcome-label">JOIN MATERNALCARE</span>
            <h1>Create your account</h1>
            <p>
              Start your maternal health journey with personalized
              learning, reminders, and helpful resources.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="registerEmail">Email Address</label>
              <input
                id="registerEmail"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="registerPassword">Password</label>

              <div className="password-wrapper">
                <input
                  id="registerPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (at least 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="confirmPassword">Confirm Password</label>

              <div className="password-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  <i className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="login-button">
              Create Account
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </form>

          <div className="login-footer">
            <p>
              Already have an account?
              <a
                href="#login"
                onClick={(e) => {
                  e.preventDefault();
                  onBackToLogin();
                }}
              >
                {" "}Sign in
              </a>
            </p>
          </div>
        </div>

        <p className="login-bottom-text">
          Caring for you, every step of the way.
        </p>

      </div>
    </div>
  );
}

export default CreateAccount;
