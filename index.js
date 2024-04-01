const express = require('express');
const swagger = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
require('dotenv').config();

app.use(express.json({ limit: '50mb' }));
const specs = swaggerJsdoc(require('./swagger.json'));

app.use('/docs', swagger.serve, swagger.setup(specs, {
    explorer: false,
    customSiteTitle: 'Sticks Docs'
}))

app.all('/ping', (req, res) => {
    res.json({ message: 'pong' }).end();
});

app.all('/', (req, res) => {
    res.json({ message: 'pong' }).end();
});

app.use('/api/users', require('./routes/Users'));
app.use('/api/codes', require('./routes/Codes'));

app.listen(3000, () => {
    console.log('Server is ready (3000)');
});