// 🔧 FestieChat Backend URL Reference Guide

/*
❌ INCORRECT URLS (Don't use these):
- http://festiechatplugin-backend.onrender-8g96.com      (Wrong domain format)
- http://festiechatplugin-backend.onrender.com          (Wrong subdomain, no HTTPS)
- https://festiechatplugin-backend.onrender.com         (Wrong subdomain - returns 404)

✅ CORRECT URL (Use this):
- https://festiechatplugin-backend-8g96.onrender.com    (Your actual working backend)

📝 URL Format Explanation:
- Protocol: https:// (always use HTTPS for Render)
- Subdomain: festiechatplugin-backend-8g96 (includes the random suffix from Render)
- Domain: onrender.com (Render's domain)
*/

const BACKEND_URLS = {
  // ✅ Your working backend
  production: 'https://festiechatplugin-backend-8g96.onrender.com',
  
  // 🧪 Development
  local: 'http://localhost:5000',
  
  // 📱 API endpoints
  endpoints: {
    health: '/api/health',
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login'
    },
    chats: '/api/chats',
    messages: '/api/messages'
  }
};

// 🔗 Complete API URLs for frontend
const API_ENDPOINTS = {
  production: {
    base: BACKEND_URLS.production,
    register: `${BACKEND_URLS.production}/api/auth/register`,
    login: `${BACKEND_URLS.production}/api/auth/login`,
    chats: `${BACKEND_URLS.production}/api/chats`,
    messages: `${BACKEND_URLS.production}/api/messages`,
    health: `${BACKEND_URLS.production}/api/health`
  }
};

console.log('🚀 FestieChat Backend URLs:');
console.log('Production Backend:', API_ENDPOINTS.production.base);
console.log('Health Check:', API_ENDPOINTS.production.health);
console.log('Login Endpoint:', API_ENDPOINTS.production.login);

module.exports = { BACKEND_URLS, API_ENDPOINTS };