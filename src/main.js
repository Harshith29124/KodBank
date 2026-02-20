import './style.css';

const app = document.getElementById('app');

// Simple SPA Router
export async function router() {
    const hash = window.location.hash || '#/login';

    // Skeleton / loading state while transitioning
    if (app.innerHTML) {
        app.style.opacity = '0';
        app.style.transition = 'opacity 0.2s';
        await new Promise(r => setTimeout(r, 200));
    }

    app.innerHTML = '';

    try {
        if (hash === '#/register') {
            const { renderRegister } = await import('./pages/register.js');
            app.appendChild(renderRegister());
        } else if (hash === '#/dashboard') {
            const { renderDashboard } = await import('./pages/dashboard.js');
            app.appendChild(await renderDashboard());
        } else {
            const { renderLogin } = await import('./pages/login.js');
            app.appendChild(renderLogin());
        }
    } catch (error) {
        console.error('Route error:', error);
    }

    app.style.opacity = '1';
}

window.addEventListener('hashchange', router);

// Initialize
router();

// Toast System
export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = '';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'warning') icon = '⚠';

    toast.innerHTML = `
    <div class="toast-icon" style="font-weight:bold; font-size:1.2rem;">${icon}</div>
    <div class="toast-message">${message}</div>
    <div class="toast-progress"></div>
  `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toast-leave 0.3s forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}
