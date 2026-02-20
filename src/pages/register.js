import { showToast } from '../main.js';

export function renderRegister() {
  const container = document.createElement('div');
  container.className = 'page auth-container';

  container.innerHTML = `
    <div class="auth-card">
      <div class="brand-header stagger-1">
        <h1>KodBank</h1>
        <p>Join the future of banking today.</p>
      </div>
      
      <form id="register-form" autocomplete="on">
        <div class="input-group stagger-2">
          <input type="text" id="username" class="form-input" placeholder=" " required />
          <svg class="input-icon" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <label for="username" class="form-label">Full Name</label>
        </div>

        <div class="input-group stagger-3">
          <input type="email" id="email" class="form-input" placeholder=" " required />
          <svg class="input-icon" viewBox="0 0 24 24"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
          <label for="email" class="form-label">Email Address</label>
        </div>
        
        <div class="input-group stagger-4">
          <input type="password" id="password" class="form-input" placeholder=" " required />
          <svg class="input-icon" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          <label for="password" class="form-label">Password</label>
        </div>

        <div class="password-strength stagger-4" id="pwd-strength">
          <div class="strength-bar bar-1"></div>
          <div class="strength-bar bar-2"></div>
          <div class="strength-bar bar-3"></div>
        </div>
        
        <button type="submit" class="btn btn-primary stagger-5" id="register-btn" style="margin-top: 1.5rem;">
          <span class="btn-text">Create Account</span>
          <div class="spinner"></div>
        </button>
        
        <div class="text-center mt-4 stagger-5">
          <p class="text-muted">Already have an account? <a href="#/login">Sign in</a></p>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector('#register-form');
  const btn = container.querySelector('#register-btn');
  const pwdInput = container.querySelector('#password');
  const pwdStrength = container.querySelector('#pwd-strength');

  pwdInput.addEventListener('input', (e) => {
    const val = e.target.value;
    pwdStrength.className = 'password-strength stagger-4';
    if (val.length > 0) {
      if (val.length < 6) pwdStrength.classList.add('weak');
      else if (val.length < 10) pwdStrength.classList.add('medium');
      else pwdStrength.classList.add('strong');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;

    btn.classList.add('loading');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Account created successfully!', 'success');
        window.location.hash = '#/login';
      } else {
        showToast(data.error || 'Registration failed', 'error');
      }
    } catch (error) {
      showToast('Network error occurred. Make sure backend is running.', 'error');
    } finally {
      btn.classList.remove('loading');
    }
  });

  return container;
}
