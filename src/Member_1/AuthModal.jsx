import { useEffect, useState } from 'react';
import './member1.css';

const planOptions = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Rs 199',
    quality: 'Good video quality in 720p',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 'Rs 499',
    quality: 'Great video quality in 1080p',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'Rs 649',
    quality: 'Best video quality in 4K + HDR',
  },
];

function isEmailValid(value) {
  return /\S+@\S+\.\S+/.test(value);
}

export default function AuthModal({
  isOpen,
  mode = 'signIn',
  defaultEmail = '',
  onClose,
}) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: defaultEmail,
    password: '',
    remember: true,
    plan: 'standard',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCurrentMode(mode);
    setStep(1);
    setErrors({});
    setFormData((previous) => ({
      ...previous,
      email: defaultEmail || previous.email,
      password: '',
    }));
  }, [isOpen, mode, defaultEmail]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const heading =
    currentMode === 'signIn'
      ? 'Sign In'
      : step === 1
        ? 'Create your account'
        : 'Choose your plan';

  if (!isOpen) {
    return null;
  }

  function updateField(field, value) {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: '' }));
  }

  function validateSignIn() {
    const nextErrors = {};

    if (!isEmailValid(formData.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (formData.password.trim().length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateSignUpStepOne() {
    const nextErrors = {};

    if (!isEmailValid(formData.email)) {
      nextErrors.email = 'Please enter a valid email to continue.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (currentMode === 'signIn') {
      if (validateSignIn()) {
        window.location.href = '/browse';
        onClose();
      }
      return;
    }

    if (step === 1) {
      if (validateSignUpStepOne()) {
        setStep(2);
      }
      return;
    }

    window.location.href = '/browse';
    onClose();
  }

  return (
    <div
      className="auth-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="auth-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={heading}
      >
        <button
          type="button"
          className="auth-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <h2>{heading}</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input
              type="email"
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="Email address"
            />
            {errors.email ? <span className="auth-error">{errors.email}</span> : null}
          </label>

          {currentMode === 'signIn' ? (
            <>
              <label className="auth-label">
                Password
                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  placeholder="Password"
                />
                {errors.password ? (
                  <span className="auth-error">{errors.password}</span>
                ) : null}
              </label>

              <button type="submit" className="auth-submit">
                Sign In
              </button>

              <div className="auth-meta">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(event) => updateField('remember', event.target.checked)}
                  />
                  Remember me
                </label>
                <a href="#forgot-password">Forgot password?</a>
              </div>

              <p className="auth-switch">
                New to Netflix?{' '}
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => {
                    setCurrentMode('signUp');
                    setStep(1);
                  }}
                >
                  Sign up now
                </button>
              </p>
            </>
          ) : (
            <>
              {step === 2 ? (
                <div className="plan-grid">
                  {planOptions.map((plan) => (
                    <button
                      type="button"
                      key={plan.id}
                      className={`plan-card ${
                        formData.plan === plan.id ? 'is-selected' : ''
                      }`}
                      onClick={() => updateField('plan', plan.id)}
                    >
                      <strong>{plan.name}</strong>
                      <span>{plan.price}</span>
                      <small>{plan.quality}</small>
                    </button>
                  ))}
                </div>
              ) : null}

              <button type="submit" className="auth-submit">
                {step === 1 ? 'Next' : 'Create Account'}
              </button>

              <p className="auth-switch">
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => {
                    setCurrentMode('signIn');
                    setStep(1);
                  }}
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
