const express = require('express');
const discord = require('discord.js');

const hook = new discord.WebhookClient({ url: 'https://discord.com/api/webhooks/1228395543223341067/3z-As35rvSbKbWZ9uBO26KSaHJP2qzpiw3eMPQoS1is7MKmJQKWDPCalFUN54Qllkokv' })

const route = express.Router();

const DB = require('../prisma');
const UTILS = require('../utils');

route.get('/:id', async (req, res) => {
    const body = req.params;

    const data = {
        id: body.id
    };

    const error = UTILS.checkNullProps(data);

    if (error) {
        res.status(201).json({ message: error, code: 101 }).end();
        return;
    };

    if (typeof data.id != 'string') {
        return res.status(201).json({ message: 'Argument `id`: Invalid value provided. Expected IntFilter or Int, provided String.', code: 402 }).end();
    };

    data.id = +data.id

    const User = await DB.user.findFirst({ where: data }).catch(e => { return { e } });

    if (User?.e) {
        console.log(User.e);
        return res.status(201).json({ message: 'Error While Getting This User', error: User.e, code: 400 }).end();
    } else if (!User) {
        res.status(201).json({ message: 'User Not Found', code: 401 }).end();
        return;
    };

    res.status(200).json({ message: 'done', code: 200, data: User }).end();
});

route.post('/', async (req, res) => {
    const body = req.body;

    const data = {
        id: body.id,
        coins: body.coins || 0,
        doors: body.doors || 0,
        sticks: body.sticks || [],
        total: {
            coins: body.total?.coins || 0,
            damage: body.total?.damage || 0,
            eggs: body.total?.eggs || 0,
            playtime: body.total?.playtime || 0,
            robux: body.total?.robux || 0,
            worlds: body.total?.worlds || 0,
            levels: body.total?.levels || 0,
            xp: body.total?.xp || 0,
        }
    }

    const error = UTILS.checkNullProps(data);

    if (error) {
        res.status(201).json({ message: error, code: 101 }).end();
        return;
    };

    const Data = await DB.user.create({ data }).catch(e => { return { e } });

    if (Data?.e) {
        console.log(Data.e);
        res.status(201).json({ message: 'Error While Create This User', error: Data.e, code: 400 }).end();
    } else {
        res.status(200).json({ message: 'done', code: 200, data: Data }).end();
    };
});

route.patch('/', async (req, res) => {
    const body = req.body;

    const data = {
        userId: body.userId || body.id,
        key: body.key,
        value: body.value,
        type: body.type || 'set'
    };

    const error = UTILS.checkNullProps(data);

    if (error) {
        res.status(201).json({ message: error, code: 101 }).end();
        return;
    };

    const UData = await DB.user.findFirst({ where: { id: data.userId } });

    if (!UData) {
        return res.status(201).json({ code: 401, message: 'User is not found', type: 'User' }).end();
    }

    const d = {};
    d[data.key] = data.value;

    const UPDATE = await DB.user.update({
        where: {
            id: data.userId
        },
        data: d
    }).catch(e => { return { e } });

    if (UPDATE.e) {
        console.log(UPDATE.e);
        res.status(201).json({ message: '(key/value) Error Please Check Schema', error: UPDATE.e, code: 400 }).end();
    } else {
        res.status(200).json({ message: 'done', code: 200, data: UPDATE }).end();
    }

});

// Define a function to send messages to the hook
function sendHookMessage(res, code, message) {
    hook.send({
        content: `Response code: ${code}, Message: ${message}`
    });
}

// Update the route with the function
route.patch('/update', async (req, res) => {
    const data = req.body;

    if (!data.id) {
        sendHookMessage(res, 1, 'Invalid User Id');
        return res.status(201).json({ message: 'Invalid User Id', code: 1 }).end();
    }

    const odata = await DB.user.findFirst({ where: { id: data.id } });
    if (!odata) {
        sendHookMessage(res, 2, 'User Id Not Found');
        return res.status(201).json({ message: 'User Id Not Found', code: 2 }).end();
    }

    const id = data.id;
    delete data.id;

    DB.user.update({
        where: { id },
        data
    })
        .then((UPDATE) => {
            sendHookMessage(res, 200, 'done');
            res.status(200).json({ message: 'done', code: 200, data: UPDATE }).end();
        })
        .catch(e => {
            sendHookMessage(res, 400, '(key/value) Error Please Check Schema');
            res.status(201).json({ message: '(key/value) Error Please Check Schema', error: e, code: 400 }).end();
        });
});

module.exports = route;