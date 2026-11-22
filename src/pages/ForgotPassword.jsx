
import { useState } from "react";
import "./Login.css";

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    setEmailSent(true);
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
          {!emailSent ? (
            <>
              <div className="login-welcome">
                <span className="welcome-label">ACCOUNT RECOVERY</span>
                <h1>Forgot password?</h1>
                <p>
                  Don't worry! Enter the email address associated
                  with your account and we'll help you reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="login-field">
                  <label htmlFor="resetEmail">Email Address</label>
                  <input
                    id="resetEmail"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="login-button">
                  Send Reset Link
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </form>
            </>
          ) : (
            <div className="reset-success">
              <div className="reset-success-icon">
                <i className="fa-solid fa-envelope-circle-check"></i>
              </div>

              <span className="welcome-label">REQUEST SUBMITTED</span>
              <h1>Check your email</h1>

              <p>
                If an account exists for <strong>{email}</strong>,
                you will receive instructions to reset your password.
              </p>

              <button
                type="button"
                className="login-button"
                onClick={() => setEmailSent(false)}
              >
                Try another email
              </button>
            </div>
          )}

          <div className="login-footer">
            <p>
              Remember your password?
              <a
                href="#login"
                onClick={(e) => {
                  e.preventDefault();
                  onBackToLogin();
                }}
              >
                {" "}Back to Sign In
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

export default ForgotPassword;
