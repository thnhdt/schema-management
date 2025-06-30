<<<<<<< HEAD
# PostgreSQL Schema Manager

Ứng dụng quản lý và trực quan hóa schema PostgreSQL sử dụng React Flow.

## Tính năng chính

### 🔗 Kết nối Database
- Kết nối đến PostgreSQL database
- Test kết nối trước khi sử dụng
- Hỗ trợ SSL và các tùy chọn nâng cao
- Lưu trữ thông tin kết nối an toàn

### 📊 Schema Flow Visualization
- Hiển thị các bảng trong schema dưới dạng flow diagram
- Tương tác trực quan với các node (bảng)
- Hiển thị mối quan hệ giữa các bảng
- Zoom, pan và điều hướng dễ dàng

### 🗂️ Quản lý Bảng
- Thêm, sửa, xóa bảng
- Xem chi tiết cấu trúc bảng
- Quản lý cột trong bảng
- Hỗ trợ các kiểu dữ liệu PostgreSQL phổ biến

### 🔧 Quản lý Cột
- Thêm, sửa, xóa cột
- Cấu hình kiểu dữ liệu
- Thiết lập Primary Key, Foreign Key
- Thêm comment và giá trị mặc định

### 📤 Export/Import
- Export schema ra file SQL
- Import schema từ file (sắp tới)
- Hỗ trợ nhiều định dạng

## Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js 16+ 
- npm hoặc yarn
- PostgreSQL database

### Cài đặt dependencies
```bash
npm install
```

### Chạy ứng dụng
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Cấu trúc Project

```
frontend/
├── src/
│   ├── components/
│   │   ├── Schema/
│   │   │   ├── Schema.jsx          # Component chính
│   │   │   ├── SchemaFlow.jsx      # React Flow visualization
│   │   │   └── TableSchema.jsx     # Quản lý chi tiết bảng
│   │   └── DatabaseConnection.jsx  # Kết nối database
│   ├── api/
│   │   └── api.js           # API services
│   ├── App.jsx
│   └── App.css
├── package.json
└── README.md
```

## Sử dụng

### 1. Kết nối Database
1. Mở ứng dụng và chuyển đến tab "Kết Nối Database"
2. Nhập thông tin kết nối PostgreSQL:
   - Host: localhost (hoặc địa chỉ server)
   - Port: 5432 (mặc định)
   - Database: tên database
   - Username: tên user
   - Password: mật khẩu
3. Click "Test Kết Nối" để kiểm tra
4. Click "Kết Nối" để bắt đầu sử dụng

### 2. Xem Schema Flow
1. Sau khi kết nối thành công, chuyển đến tab "Schema Flow"
2. Các bảng sẽ được hiển thị dưới dạng node
3. Mối quan hệ giữa các bảng được hiển thị bằng đường nối
4. Click vào bảng để xem chi tiết

### 3. Quản lý Bảng
- **Thêm bảng**: Click "Thêm Bảng" và nhập tên
- **Thêm cột**: Chọn bảng và click "Thêm Cột"
- **Xóa bảng**: Chọn bảng và click "Xóa Bảng"

### 4. Quản lý Cột
- **Thêm cột**: Nhập tên, chọn kiểu dữ liệu, cấu hình thuộc tính
- **Sửa cột**: Click icon edit trên cột cần sửa
- **Xóa cột**: Click icon delete và xác nhận

## API Endpoints

### Database Connection
- `POST /api/schema/test-connection` - Test kết nối
- `POST /api/schema/connect` - Kết nối database

### Schema Operations
- `GET /api/schema/schemas` - Lấy danh sách schemas
- `GET /api/schema/tables/{schemaName}` - Lấy danh sách bảng
- `GET /api/schema/columns/{schemaName}/{tableName}` - Lấy cột của bảng

### Table Operations
- `POST /api/schema/tables/{schemaName}` - Tạo bảng mới
- `PUT /api/schema/tables/{schemaName}/{tableName}` - Cập nhật bảng
- `DELETE /api/schema/tables/{schemaName}/{tableName}` - Xóa bảng

### Column Operations
- `POST /api/schema/columns/{schemaName}/{tableName}` - Thêm cột
- `PUT /api/schema/columns/{schemaName}/{tableName}/{columnName}` - Cập nhật cột
- `DELETE /api/schema/columns/{schemaName}/{tableName}/{columnName}` - Xóa cột

## Kiểu dữ liệu hỗ trợ

- **Số nguyên**: INTEGER, BIGINT, SERIAL, BIGSERIAL
- **Chuỗi**: VARCHAR, TEXT
- **Boolean**: BOOLEAN
- **Thời gian**: TIMESTAMP, DATE
- **Số thập phân**: DECIMAL
- **JSON**: JSON, JSONB
- **UUID**: UUID

## Tính năng nâng cao

### Tùy chọn kết nối
- SSL connection
- Connection timeout
- Query timeout
- Max connections
- Schema selection

### Tương tác Flow
- Zoom in/out
- Pan canvas
- Select multiple nodes
- Fit view
- Mini map navigation

### Responsive Design
- Hỗ trợ mobile và tablet
- Adaptive layout
- Touch gestures

## Troubleshooting

### Lỗi kết nối
1. Kiểm tra thông tin kết nối
2. Đảm bảo PostgreSQL đang chạy
3. Kiểm tra firewall và port
4. Xác nhận quyền truy cập user

### Lỗi hiển thị
1. Refresh trang
2. Kiểm tra console errors
3. Xóa cache browser
4. Restart development server

## Đóng góp

1. Fork project
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License - xem file LICENSE để biết thêm chi tiết.

## Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub repository.
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> d345abb (init frontend)
