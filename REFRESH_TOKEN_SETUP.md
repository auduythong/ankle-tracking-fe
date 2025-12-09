# Refresh Token Implementation Guide

## Backend Setup

### 1. Database Migration

Chạy SQL script để tạo bảng `refresh_tokens`:

```bash
# Chạy file: migrations/create_refresh_tokens_table.sql
```

Hoặc copy và execute SQL này trong SQL Server Management Studio:

```sql
CREATE TABLE refresh_tokens (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    token NVARCHAR(500) NOT NULL,
    user_id NVARCHAR(50) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_revoked BIT DEFAULT 0,
    created_date DATETIME DEFAULT GETDATE(),
    ip_address NVARCHAR(100) NULL,
    user_agent NVARCHAR(500) NULL,
    CONSTRAINT FK_refresh_tokens_users FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE NONCLUSTERED INDEX IX_refresh_tokens_token ON refresh_tokens(token);
CREATE NONCLUSTERED INDEX IX_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE NONCLUSTERED INDEX IX_refresh_tokens_user_revoked ON refresh_tokens(user_id, is_revoked);
CREATE NONCLUSTERED INDEX IX_refresh_tokens_expires_revoked ON refresh_tokens(expires_at, is_revoked);
```

### 2. Environment Variables

Thêm vào file `.env`:

```env
# Refresh Token Configuration
VTC_REFRESH_TOKEN_SECRET=your-refresh-token-secret-key-here
REFRESH_TOKEN_EXPIRY_DAYS=7
```

**Lưu ý:**
- `VTC_REFRESH_TOKEN_SECRET`: Secret key riêng cho refresh token (khác với JWT_SECRET)
- `REFRESH_TOKEN_EXPIRY_DAYS`: Số ngày refresh token có hiệu lực (mặc định: 7 ngày)

### 3. API Endpoints

Backend đã implement các endpoints sau:

#### Login (đã update)
- **POST** `/api/v1/auth_management/login_admin`
- **POST** `/api/v1/auth_management/login_mobile`

Response mới:
```json
{
  "code": 0,
  "message": "Success",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username"
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "refresh-token-string",
    "agentToken": null,
    "isAgent": false
  }
}
```

#### Refresh Token (mới)
- **POST** `/api/v1/auth_management/refresh_token`

Request:
```json
{
  "refreshToken": "your-refresh-token-here"
}
```

Response:
```json
{
  "code": 0,
  "message": "Success",
  "data": {
    "accessToken": "new-jwt-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

#### Logout (mới)
- **POST** `/api/v1/auth_management/logout`

Request:
```json
{
  "refreshToken": "your-refresh-token-here"
}
```

Response:
```json
{
  "code": 0,
  "message": "Đăng xuất thành công"
}
```

### 4. Token Cleanup (Optional)

Để tự động xóa token đã hết hạn, thêm scheduled task vào codebase:

```typescript
// Trong service hoặc cron job
@Cron('0 0 * * *') // Chạy mỗi ngày lúc 00:00
async cleanupExpiredTokens() {
  await this.authenticateService.cleanupExpiredTokens();
}
```

---

## Frontend Integration

### 1. Store Tokens

Sau khi login thành công, lưu cả access token và refresh token:

```javascript
// Sử dụng localStorage hoặc sessionStorage
const login = async (username, password) => {
  const response = await fetch('/api/v1/auth_management/login_admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const result = await response.json();

  if (result.code === 0) {
    // Lưu tokens
    localStorage.setItem('accessToken', result.data.accessToken);
    localStorage.setItem('refreshToken', result.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(result.data.user));

    return result.data;
  }
};
```

### 2. Axios Interceptor (Recommended)

Tự động refresh token khi access token hết hạn:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

// Request interceptor - thêm access token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - tự động refresh khi 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, đợi trong queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // Không có refresh token, redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        const response = await axios.post('/api/v1/auth_management/refresh_token', {
          refreshToken
        });

        if (response.data.code === 0) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Lưu tokens mới
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Update header và retry request gốc
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);

          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh token thất bại, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 3. Logout Implementation

```javascript
const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  try {
    // Revoke refresh token trên server
    await fetch('/api/v1/auth_management/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Redirect to login
    window.location.href = '/login';
  }
};
```

### 4. React Hook Example (Optional)

```javascript
import { useState, useEffect } from 'react';
import api from './axios-instance';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth_management/login_admin', {
      username,
      password
    });

    if (response.data.code === 0) {
      const { accessToken, refreshToken, user } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      return user;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      await api.post('/auth_management/logout', { refreshToken });
    } finally {
      localStorage.clear();
      setUser(null);
      window.location.href = '/login';
    }
  };

  return { user, login, logout, loading };
};
```

---

## Security Best Practices

### Backend
1. **Refresh token** nên có thời hạn dài hơn access token (7-30 ngày)
2. **Access token** nên ngắn (15-60 phút) để giảm thiểu rủi ro
3. Lưu IP address và User Agent để phát hiện anomaly
4. Implement rate limiting cho `/refresh_token` endpoint
5. Chạy cleanup job định kỳ để xóa token đã hết hạn

### Frontend
1. **Không lưu tokens trong cookie** nếu có XSS risk
2. Sử dụng `httpOnly` cookie cho production (cần update backend)
3. Clear tokens khi logout
4. Implement token refresh trước khi expiry
5. Handle network errors gracefully

---

## Testing

### Test Refresh Token Flow

```bash
# 1. Login
curl -X POST http://localhost:3000/api/v1/auth_management/login_admin \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'

# 2. Use access token (should work)
curl -X GET http://localhost:3000/api/v1/some-protected-route \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 3. Refresh token
curl -X POST http://localhost:3000/api/v1/auth_management/refresh_token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'

# 4. Logout
curl -X POST http://localhost:3000/api/v1/auth_management/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

---

## Troubleshooting

### Token không refresh được
- Check xem refresh token có trong database không
- Verify `is_revoked = 0` và `expires_at > GETDATE()`
- Check network tab xem có lỗi 401/403 không

### Multiple refresh calls
- Implement queue mechanism như trong axios interceptor example
- Chỉ cho phép 1 refresh request tại một thời điểm

### Token bị revoke không đúng
- Check cascade delete constraint trong database
- Verify logout API được gọi đúng cách
