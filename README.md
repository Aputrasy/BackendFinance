# Finance Tracker Backend

Backend Node.js/Express dengan koneksi SQL Server untuk aplikasi Finance Tracker.

## Fitur

- **Authentication**: Login & Register dengan JWT
- **Master CRUD**: Create, Read, Update, Delete untuk data master
- **Detail CRUD**: Create, Read, Update, Delete untuk detail transaksi
- **PDF Export**: Export laporan keuangan ke PDF
- **Auto-calculation**: Total pemasukan/pengeluaran dihitung otomatis via database trigger

## Struktur Folder

```
backend/
├── config/
│   └── database.js       # Konfigurasi koneksi SQL Server
├── controllers/
│   ├── authController.js # Login & Register
│   ├── masterController.js # Master CRUD & PDF
│   └── detailController.js # Detail CRUD
├── middleware/
│   └── auth.js           # JWT Authentication middleware
├── routes/
│   ├── auth.js           # Auth routes
│   ├── masters.js        # Master routes
│   └── details.js        # Detail routes
├── utils/
│   └── jwt.js            # JWT utilities
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
└── server.js             # Entry point
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file dengan konfigurasi Anda:

```env
DB_SERVER=sql.bsite.net\MSSQL2016
DB_NAME=FinanceTrackerDB
DB_USER=projectsra
DB_PASSWORD=#Syukur12345
DB_PORT=1433
PORT=3000
JWT_SECRET=your-super-secret-key
```

### 3. Setup Database

Jalankan file SQL berikut di SQL Server Management Studio (SSMS):

```sql
-- Buka database/schema.sql dan jalankan semua query
```

Atau jalankan via sqlcmd:

```bash
sqlcmd -S sql.bsite.net\MSSQL2016 -U projectsra -P '#Syukur12345' -i database/schema.sql
```

### 4. Start Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user info |

### Masters
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/masters` | Get all masters |
| GET | `/api/masters/stats` | Get dashboard stats |
| GET | `/api/masters/:id` | Get master by ID |
| POST | `/api/masters` | Create master |
| PUT | `/api/masters/:id` | Update master |
| DELETE | `/api/masters/:id` | Delete master |
| GET | `/api/masters/:id/pdf` | Export master to PDF |

### Details
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/details/master/:masterId` | Get details by master |
| POST | `/api/details/master/:masterId` | Create detail |
| PUT | `/api/details/master/:masterId/:id` | Update detail |
| DELETE | `/api/details/master/:masterId/:id` | Delete detail |

## Request/Response Examples

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

Response:
```json
{
    "success": true,
    "message": "Registration successful",
    "data": {
        "userId": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "token": "eyJhbGciOiJIUzI1NiIs..."
    }
}
```

### Create Master
```bash
POST /api/masters
Authorization: Bearer <token>
Content-Type: application/json

{
    "description": "Keuangan Januari 2025",
    "date": "2025-01-01"
}
```

### Create Detail
```bash
POST /api/details/master/1
Authorization: Bearer <token>
Content-Type: application/json

{
    "description": "Gaji Bulanan",
    "date": "2025-01-01",
    "amount": 5000000,
    "type": "income"
}
```

## Database Schema

### Tables

**Users**
- Id (PK, int)
- Name (nvarchar)
- Email (nvarchar, unique)
- PasswordHash (nvarchar)
- CreatedAt (datetime)
- UpdatedAt (datetime)

**Masters**
- Id (PK, int)
- UserId (FK, int)
- Description (nvarchar)
- Date (date)
- TotalIncome (decimal)
- TotalExpense (decimal)
- CreatedAt (datetime)
- UpdatedAt (datetime)

**Details**
- Id (PK, int)
- MasterId (FK, int)
- Description (nvarchar)
- Date (date)
- Amount (decimal)
- Type (nvarchar: 'income'/'expense')
- CreatedAt (datetime)
- UpdatedAt (datetime)

### Triggers

**trg_UpdateMasterTotals**: Auto-update TotalIncome dan TotalExpense di table Masters ketika detail ditambahkan/diupdate/dihapus.

## Integrasi Frontend

Include file `api.js` di HTML:

```html
<script src="api.js"></script>
<script src="script.js"></script>
```

Gunakan API service:

```javascript
// Login
await financeAPI.login('email@example.com', 'password');

// Get masters
const response = await financeAPI.getAllMasters();
console.log(response.data);

// Create detail
await financeAPI.createDetail(1, 'Belanja', '2025-01-01', 100000, 'expense');
```

## Troubleshooting

### Connection Timeout
Jika terjadi timeout saat koneksi ke SQL Server:
1. Periksa firewall settings
2. Pastikan SQL Server Browser service running
3. Cek SQL Server instance name yang benar

### CORS Error
Jika frontend tidak bisa akses API:
1. Pastikan `cors` middleware aktif
2. Cek `origin` di konfigurasi CORS

### PDF Export Error
Pastikan package `jspdf` dan `jspdf-autotable` sudah terinstall.

## Catatan Keamanan

1. **Jangan commit file `.env`** - sudah di-ignore via `.gitignore`
2. **Ganti JWT_SECRET** di production dengan random string panjang
3. **Gunakan HTTPS** di production
4. **Hash password** sudah otomatis via bcrypt
5. **Input validation** sudah diimplement di setiap controller
# BackendFinanceTracker
