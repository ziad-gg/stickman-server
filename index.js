const express = require('express');
const app = express();
require('dotenv').config();

const DB = require('./prisma');
const UTILS = require('./utils');

app.use(express.json({ limit: '50mb' }));

app.all('/ping', (req, res) => {
    res.json({ message: 'pong' }).end();
});

app.use('/api/users', require('./routes/Users'));
app.use('/api/codes', require('./routes/Codes'));

app.listen(3000, () => {
    console.log('Server is ready (3000)');
});