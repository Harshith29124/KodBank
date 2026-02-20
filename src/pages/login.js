import { showToast } from '../main.js';

export function renderLogin() {
  const container = document.createElement('div');
  container.className = 'page auth-container';

  container.innerHTML = `
    <div class="auth-card">
      <div class="brand-header stagger-1">
        <h1>KodBank</h1>
        <p>Premium Neo-Banking Experience</p>
      </div>
      
      <form id="login-form" autocomplete="on">
        <div class="input-group stagger-2">
          <input type="email" id="email" class="form-input" placeholder=" " required />
          <svg class="input-icon" viewBox="0 0 24 24"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
          <label for="email" class="form-label">Email Address</label>
        </div>
        
        <div class="input-group stagger-3" style="margin-bottom: 2rem;">
          <input type="password" id="password" class="form-input" placeholder=" " required />
          <svg class="input-icon" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          <label for="password" class="form-label">Password</label>
        </div>
        
        <button type="submit" class="btn btn-primary stagger-4" id="login-btn">
          <span class="btn-text">Sign In</span>
          <div class="spinner"></div>
        </button>
        
        <div class="text-center mt-4 stagger-5">
          <p class="text-muted">New to KodBank? <a href="#/register">Create an account</a></p>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector('#login-form');
  const btn = container.querySelector('#login-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;

    btn.classList.add('loading');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Welcome back!', 'success');
        localStorage.setItem('kod_user', JSON.stringify(data.user));
        window.location.hash = '#/dashboard';
      } else {
        showToast(data.error || 'Login failed', 'error');
        form.password.value = '';
      }
    } catch (error) {
      showToast('Network error occurred. Make sure backend is running.', 'error');
    } finally {
      btn.classList.remove('loading');
    }
  });

  return container;
}
