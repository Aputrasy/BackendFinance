# ⚡ Static Token Setup (Recommended untuk Development)

## Langkah 1: Setup di .env

Buka file `.env` di folder root project dan set:

```env
USE_STATIC_TOKEN=true
STATIC_TOKEN=my-api-token-12345
```

## Langkah 2: Restart Server

```bash
npm run dev
```

Tunggu sampai muncul:
```
Finance Tracker API is running on port 3000
```

## Langkah 3: Test Token dengan curl

```bash
# Test dengan Authorization header
curl -X GET http://localhost:3000/api/details/12 \
  -H "Authorization: Bearer my-api-token-12345"

# Atau format tanpa Bearer
curl -X GET http://localhost:3000/api/details/12 \
  -H "Authorization: my-api-token-12345"

# Atau di query parameter
curl -X GET "http://localhost:3000/api/details/12?token=my-api-token-12345"
```

---

## Contoh dengan JavaScript

### Fetch API
```javascript
const token = 'my-api-token-12345';

fetch('http://localhost:3000/api/details/12', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

### Axios
```javascript
const axios = require('axios');

const token = 'my-api-token-12345';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

api.get('/details/12')
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
```

### React dengan Axios
```javascript
import axios from 'axios';
import { useEffect, useState } from 'react';

function App() {
  const [details, setDetails] = useState(null);
  const TOKEN = 'my-api-token-12345';

  useEffect(() => {
    const api = axios.create({
      baseURL: 'http://localhost:3000/api',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    api.get('/details/12')
      .then(res => setDetails(res.data.data))
      .catch(err => console.error(err));
  }, []);

  return <div>{details && JSON.stringify(details)}</div>;
}
```

---

## Contoh API Requests

### GET - Ambil Detail by ID
```bash
curl -X GET http://localhost:3000/api/details/12 \
  -H "Authorization: Bearer my-api-token-12345"
```

### POST - Buat Detail Baru
```bash
curl -X POST http://localhost:3000/api/details \
  -H "Authorization: Bearer my-api-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "masterId": 1,
    "description": "Beli Laptop",
    "date": "2024-04-14",
    "amount": 5000000,
    "type": "expense"
  }'
```

### PUT - Update Detail
```bash
curl -X PUT http://localhost:3000/api/details/12 \
  -H "Authorization: Bearer my-api-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "masterId": 1,
    "description": "Beli Laptop (Updated)",
    "date": "2024-04-14",
    "amount": 5500000,
    "type": "expense"
  }'
```

### DELETE - Hapus Detail
```bash
curl -X DELETE "http://localhost:3000/api/details/12?masterId=1" \
  -H "Authorization: Bearer my-api-token-12345"
```

---

## Tips

✅ **Token sama untuk semua request** - Tidak perlu login lagi
✅ **Token tidak expire** - Tidak ada waktu kadaluarsa
✅ **Bisa di-share** - Bisa diberikan ke team yang lain
✅ **Untuk development saja** - Jangan gunakan di production

---

## Untuk Production: Gunakan JWT

Jika ingin production-ready, ganti di `.env`:

```env
USE_STATIC_TOKEN=false
JWT_SECRET=your-very-secret-key-production-123456
```

Kemudian users harus login terlebih dahulu untuk mendapatkan token.
