const express = require('express');
const app = express();
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { join, dirname } = require('path');
const { promises: { writeFile, unlink } } = require('fs');
const { tmpdir } = require('os');
const { randomUUID } = require('crypto');
const { spawnSync } = require('child_process');
const ddlToMermaid = require('./testDDL');
const path = require('path');
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
//init dbs 
// require('./v1/databases/init.mongodb')
// require('./v1/databases/init.redis')
require('./v1/config/mongodb');


//user middleware
app.use(helmet())
app.use(morgan('combined'))
// compress responses
app.use(compression())
app.use(
    cors({
        origin: process.env.FRONTEND_URL || '*',
        credentials: true,
        methods: 'GET, POST, PUT,PATCH, DELETE',
        allowedHeaders: 'Content-Type, Authorization, x-requested-with'
    }))
// add body-parser
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({
    extended: true
}))

//router
app.use(require('./v1/routes/index.router'));
app.use('/api/user', require('./v1/routes/user.route'));
app.use('/api/database', require('./v1/routes/database.route'));
app.use('/api/table', require('./v1/routes/table.route'));
app.post('/api/diagram', async (req, res) => {
    const ddl = (req.body.sql || '').trim();
    if (!ddl) return res.status(400).json({ error: 'SQL text required' });
    try {
        /* 1) SQL ➜ Mermaid */
        const mmd = ddlToMermaid(ddl);
        const mmdTmp = join(tmpdir(), `2.mmd`);
        await writeFile(mmdTmp, mmd, 'utf8');

        /* 2) Mermaid ➜ PNG vào thư mục public */
        // await mkdir(PUBLIC_DIR, { recursive: true });      // chắc chắn có thư mục
        const fileName = `diagram-2.png`;      // tên file duy nhất
        const imgPath = join(PUBLIC_DIR, fileName);

        const { status, stderr } = spawnSync(
            'npx',
            ['mmdc', '-i', mmdTmp, '-o', imgPath],
            { encoding: 'utf8', shell: true }
        );
        if (status !== 0) throw new Error(stderr);

        /* 3) Trả URL thay vì base64 */
        const url = `/public/${fileName}`;   // đường dẫn tĩnh
        res.json({ url });                   // { "url": "/public/diagram‑123.png" }

        /* 4) Dọn file tạm .mmd */
        await unlink(mmdTmp).catch(() => { });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Render failed', detail: String(e) });
    }
});
// Error Handling Middleware called

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});


// error handler middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
        error: {
            status: error.status || 500,
            message: error.message || 'Internal Server Error',
            stack: error.stack
        },
    });
});

module.exports = app;