# API Authentication Guide

## 🚀 Quick Start - Two Options

### Option A: Static Token (Simple - For Development/Testing)

**Setup:** Edit `.env` file:
```
USE_STATIC_TOKEN=true
STATIC_TOKEN=your-api-token-12345
```

**Usage:** Use token langsung tanpa login:
```bash
curl -X GET http://localhost:3000/api/details/12 \
  -H "Authorization: Bearer your-api-token-12345"
```

**Keuntungan:**
- ✅ Token tetap sama (tidak berubah)
- ✅ Tidak perlu login setiap kali
- ✅ Cocok untuk testing dan development
- ✅ Bisa di-share ke tim

---

### Option B: JWT Token (Dynamic - Production Ready)

**Setup:** Edit `.env` file:
```
USE_STATIC_TOKEN=false
JWT_SECRET=your-secret-key-production
```

**Step 1: Register or Login to Get Token**
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Use Token in API Requests

#### Method 1: Authorization Header (Recommended)
```bash
curl -X GET http://localhost:3000/api/details/12 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Method 2: Query Parameter (Fallback)
```bash
curl -X GET "http://localhost:3000/api/details/12?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Method 3: Request Body (Fallback)
```bash
curl -X GET http://localhost:3000/api/details/12 \
  -H "Content-Type: application/json" \
  -d '{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'
```

---

## JavaScript/Fetch Example

```javascript
// 1. Login and get token
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// 2. Use token for authenticated requests
const detailResponse = await fetch('http://localhost:3000/api/details/12', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const detail = await detailResponse.json();
console.log(detail);
```

---

## Axios Example

```javascript
const axios = require('axios');

// 1. Login
const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
  email: 'john@example.com',
  password: 'password123'
});

const token = loginRes.data.data.token;

// 2. Create axios instance with token
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 3. Use for all requests
const detail = await api.get('/details/12');
console.log(detail.data);
```

---

## React Example

```javascript
import axios from 'axios';

function useAuth() {
  const [token, setToken] = useState(null);

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:3000/api/auth/login', {
      email,
      password
    });
    const { token } = res.data.data;
    setToken(token);
    localStorage.setItem('token', token);
  };

  const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
      'Authorization': `Bearer ${token || localStorage.getItem('token')}`
    }
  });

  return { login, api, token };
}
```

---

## Troubleshooting

### Error: "Access denied. No token provided."
- ✅ Ensure you're sending the Authorization header
- ✅ Format should be: `Authorization: Bearer <token>`
- ✅ Token must be obtained from login/register endpoint
- ✅ Token cannot be empty or malformed

### Error: "Invalid or expired token"
- ✅ Token has expired (valid for 24 hours)
- ✅ Token is corrupted or tampered with
- ✅ JWT_SECRET changed on server
- 🔧 Solution: Re-login to get a new token

### CORS Issues
- ✅ Server allows Authorization header in CORS configuration
- ✅ Make sure to send actual credentials if using `credentials: true`
- 🔧 For production, set `CORS_ORIGIN` in environment variables

---

## Token Expiration

- **Token lifetime:** 24 hours
- **When expired:** Re-login to get a new token
- **Implementation:** Use `setInterval` to refresh token before expiry

```javascript
// Optional: Refresh token before expiry
setInterval(() => {
  const loginRes = await axios.post('/auth/login', credentials);
  const newToken = loginRes.data.data.token;
  localStorage.setItem('token', newToken);
}, 23 * 60 * 60 * 1000); // Every 23 hours
```

---

## Success Indicators

Server logs will show:
```
✓ Authorization header present - Request has token
✗ No Authorization header - Request missing token
```

If you see "✓" in logs, token is being sent correctly.
