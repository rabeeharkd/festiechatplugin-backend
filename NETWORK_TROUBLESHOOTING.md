# Network Error Troubleshooting Guide

## 🔍 **Diagnostic Steps for "Network error. Please check your connection."**

### **1. Verify Backend Deployment**
✅ **Backend Status**: Working (https://festiechatplugin-backend.onrender.com/health)
✅ **Auth Service**: Working (https://festiechatplugin-backend.onrender.com/api/auth/health)

### **2. Test Frontend Connection**
Test this endpoint from your frontend:
```javascript
// Test connection endpoint
POST https://festiechatplugin-backend.onrender.com/api/test-connection
Content-Type: application/json

{
  "test": "connection"
}
```

### **3. Common Network Issues & Solutions**

#### **A. CORS Issues**
- ✅ **Fixed**: Updated CORS to allow more domains and methods
- ✅ **Added**: Preflight OPTIONS handler
- ✅ **Added**: Additional headers support

#### **B. Frontend URL Mismatch**
Make sure your frontend is making requests to:
```
https://festiechatplugin-backend.onrender.com/api/auth/register
```
NOT:
```
http://localhost:5000/api/auth/register
```

#### **C. Request Format Issues**
Ensure your frontend sends:
```javascript
fetch('https://festiechatplugin-backend.onrender.com/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for CORS
  body: JSON.stringify({
    name: 'User Name',
    email: 'user@example.com',
    password: 'password123'
  })
})
```

### **4. Debug Steps for Your Frontend**

#### **Step 1: Test Basic Connectivity**
```javascript
// Add this to your frontend to test
fetch('https://festiechatplugin-backend.onrender.com/health')
  .then(response => response.json())
  .then(data => console.log('Backend accessible:', data))
  .catch(error => console.error('Backend not accessible:', error));
```

#### **Step 2: Test Auth Service**
```javascript
fetch('https://festiechatplugin-backend.onrender.com/api/auth/health')
  .then(response => response.json())
  .then(data => console.log('Auth service accessible:', data))
  .catch(error => console.error('Auth service not accessible:', error));
```

#### **Step 3: Test Connection Endpoint**
```javascript
fetch('https://festiechatplugin-backend.onrender.com/api/test-connection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ test: 'connection' })
})
.then(response => response.json())
.then(data => console.log('Connection test:', data))
.catch(error => console.error('Connection failed:', error));
```

#### **Step 4: Test Registration**
```javascript
fetch('https://festiechatplugin-backend.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => console.log('Registration result:', data))
.catch(error => console.error('Registration failed:', error));
```

### **5. Browser Console Debugging**

Open your browser's Developer Tools (F12) and check:

#### **Network Tab:**
- Look for failed requests (red entries)
- Check if requests are being made to the correct URL
- Verify request method and headers

#### **Console Tab:**
- Look for CORS errors
- Check for JavaScript errors
- Verify API responses

### **6. Possible Frontend Issues**

#### **Check Your Frontend Code:**
1. **API Base URL**: Make sure it points to Render, not localhost
2. **Headers**: Ensure 'Content-Type': 'application/json'
3. **Credentials**: Add `credentials: 'include'` for CORS
4. **Error Handling**: Check if errors are being caught properly

### **7. Quick Fix Checklist**

- [ ] Backend URL is `https://festiechatplugin-backend.onrender.com`
- [ ] Request includes `Content-Type: application/json`
- [ ] Request includes `credentials: 'include'`
- [ ] No localhost URLs in production frontend
- [ ] Backend is deployed with latest changes
- [ ] Browser console shows no CORS errors

### **8. Working Example Request**

```bash
# Test with curl
curl -X POST "https://festiechatplugin-backend.onrender.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "Origin: https://fms-chat.vercel.app" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

If this curl command works but your frontend doesn't, the issue is in your frontend code, not the backend.