
import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    onLogin();
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
            <span className="welcome-label">WELCOME BACK</span>
            <h1>Welcome back!</h1>
            <p>
              Your journey matters. Sign in to continue your
              maternal health journey with us.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                Remember me
              </label>

              <a href="#forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-button">
              Sign In
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?
              <a href="#create-account"> Create account</a>
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

export default Login;
