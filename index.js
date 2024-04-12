const express = require('express');

const app = express();
require('dotenv').config();

app.use(express.json({ limit: '50mb' }));

app.all('/ping', (req, res) => {
    res.json({ message: 'pong' }).end();
});

app.all('/', (req, res) => {
    res.json({ message: 'pong' }).end();
});

app.use('/api/users', require('./routes/Users'));
app.use('/api/codes', require('./routes/Codes'));

app.listen(3000, "0.0.0.0", () => {
    console.log('Server is ready (3000)');
});