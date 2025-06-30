# SQL to ERD Generator

Công cụ tự động generate Entity Relationship Diagram (ERD) từ SQL script sử dụng Node.js và React.

## Tính năng

- ✅ Parse SQL CREATE TABLE statements
- ✅ Extract table structure (columns, data types, constraints)
- ✅ Detect foreign key relationships
- ✅ Generate interactive ERD diagram
- ✅ Support PostgreSQL schema (public)
- ✅ Upload SQL file hoặc paste trực tiếp
- ✅ Export diagram (coming soon)
- ✅ Responsive design với Ant Design

## Cài đặt

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Sử dụng

1. Truy cập `http://localhost:5173/schema/sql-to-erd`
2. Upload file SQL hoặc paste SQL script vào textarea
3. Click "Generate ERD" để tạo diagram
4. Sử dụng "Load Sample SQL" để test với dữ liệu mẫu

## SQL Format Support

Hỗ trợ các định dạng SQL sau:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## API Endpoints

- `POST /api/parse-sql` - Parse SQL script và trả về ERD data
- `POST /api/test-connection` - Test database connection (coming soon)

## Cấu trúc Project

```
schema-management/
├── backend/
│   ├── server.js          # Express server
│   ├── utils/
│   │   └── sqlParser.js   # SQL parsing logic
│   │   
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Schema/
│   │   │       ├── SQLToERD.jsx    # Main component
│   │   │       ├── ERDNode.jsx     # Table node
│   │   │       └── ERDEdge.jsx     # Relationship edge
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Dependencies

### Backend
- Express.js - Web server
- sql-parser - SQL parsing
- pg - PostgreSQL client
- cors - Cross-origin resource sharing

### Frontend
- React 19
- @xyflow/react - Diagram library
- Ant Design - UI components
- Axios - HTTP client

## Tính năng sắp tới

- [ ] Export diagram as PNG/SVG
- [ ] Database connection để auto-generate từ existing database
- [ ] Support cho các database khác (MySQL, SQLite)
- [ ] Custom styling cho diagram
- [ ] Save/load diagram projects
- [ ] Collaboration features

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 
