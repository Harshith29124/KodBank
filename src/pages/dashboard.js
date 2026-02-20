import { showToast } from '../main.js';
import confetti from 'canvas-confetti';

export async function renderDashboard() {
  const container = document.createElement('div');
  container.className = 'page';

  // Show skeleton UI immediately
  container.innerHTML = `
    <nav class="dashboard-navbar">
      <div class="nav-brand">KodBank</div>
      <div class="nav-actions">
        <div class="skeleton skeleton-avatar"></div>
        <button class="btn-logout" disabled>Logout</button>
      </div>
    </nav>
    <main class="dashboard-container">
      <div class="balance-card">
        <div class="skeleton skeleton-text" style="margin: 0 auto; width: 100px;"></div>
        <div class="skeleton skeleton-title" style="margin: 1rem auto; width: 300px; height: 4rem;"></div>
      </div>
      <div class="stats-row">
        <div class="stat-card"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-title"></div></div>
        <div class="stat-card"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-title"></div></div>
        <div class="stat-card"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-title"></div></div>
      </div>
    </main>
  `;

  try {
    const res = await fetch('/api/balance', { credentials: 'include' });

    if (res.status === 401) {
      window.location.hash = '#/login';
      return container;
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const user = data.user;
    const initials = user.username.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

    let isUSD = false;

    // Add fallback for invalid created_at fields safely
    let memberSince = 'Recently';
    if (user.created_at) {
      memberSince = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    container.innerHTML = `
      <nav class="dashboard-navbar">
        <div class="nav-brand">KodBank</div>
        <div class="nav-actions">
          <div class="avatar" title="${user.username}">${initials}</div>
          <button class="btn-logout" id="logout-btn">Logout</button>
        </div>
      </nav>
      <main class="dashboard-container stagger-1">
        <div class="balance-card">
          <div class="balance-content">
            <div class="balance-label">Total Balance</div>
            <div class="balance-amount">
              <span id="balance-display">₹0.00</span>
              <button class="currency-toggle" id="currency-toggle">INR</button>
            </div>
          </div>
        </div>
        <div class="stats-row stagger-2">
          <div class="stat-card">
            <div class="stat-label">Account Type</div>
            <div class="stat-value">${user.role}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Member Since</div>
            <div class="stat-value">${memberSince}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Status</div>
            <div class="status-badge">
              <div class="status-dot"></div>
              Active
            </div>
          </div>
        </div>
      </main>
    `;

    // Logout handling
    container.querySelector('#logout-btn').addEventListener('click', async () => {
      try {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        localStorage.removeItem('kod_user');
        window.location.hash = '#/login';
        showToast('Logged out successfully');
      } catch (err) {
        showToast('Logout failed', 'error');
      }
    });

    // Animate Balance Count Up
    const balanceDisplay = container.querySelector('#balance-display');
    const currencyToggle = container.querySelector('#currency-toggle');

    const animateBalance = (target, currency = 'INR') => {
      const duration = 1500;
      const start = 0;
      const startTime = performance.now();

      const format = (val) => new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency
      }).format(val);

      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        const currentVal = start + (target - start) * ease;

        balanceDisplay.textContent = format(currentVal);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          balanceDisplay.textContent = format(target);
        }
      };

      requestAnimationFrame(update);
    };

    animateBalance(parseFloat(user.balance), 'INR');

    currencyToggle.addEventListener('click', () => {
      isUSD = !isUSD;
      currencyToggle.textContent = isUSD ? 'USD' : 'INR';
      const targetVal = isUSD ? parseFloat(user.balance) / 83.0 : parseFloat(user.balance);
      animateBalance(targetVal, isUSD ? 'USD' : 'INR');
    });

    // Fire Confetti on first load
    if (!sessionStorage.getItem('kod_welcomed')) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6c63ff', '#00d4aa', '#ffffff']
        });
        sessionStorage.setItem('kod_welcomed', 'true');
      }, 500);
    }

  } catch (error) {
    showToast('Failed to load dashboard. Session may have expired.', 'error');
  }

  return container;
}
