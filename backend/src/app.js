const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
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
const fs = require('fs');
// const fsPromises = require('fs').promises;
const logModel = require('../src/v1/models/logs.model');
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
        allowedHeaders: 'Content-Type, Authorization, x-requested-with, userid'
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
app.use('/api/node', require('./v1/routes/node.route'));
app.use('/api/database', require('./v1/routes/database.route'));
app.use('/api/table', require('./v1/routes/table.route'));
app.use('/api/function', require('./v1/routes/function.route'));
app.use('/api/sequence', require('./v1/routes/sequence.route'));

app.get('/api/log/error', async (req, res) => {
    const filePath = path.join(__dirname, 'v1', 'logs', `error.log`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Không thể đọc file log.' });
        }
        res.status(200).send({ data: data });
    });
});
app.post('/api/log/clear', async (req, res) => {
    const filePath = path.join(__dirname, 'v1', 'logs', `error.log`);
    const message = await fs.promises.readFile(filePath, 'utf8');
    const newLogs = await logModel.create({ message: message });
    fs.truncate(filePath, 0, (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ghi file không thành công!' });
        }
        res.status(200).send({ message: 'Ghi file thành công ', data: newLogs });
    });
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