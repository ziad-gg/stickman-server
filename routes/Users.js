const express = require('express');
const route = express.Router();

const DB = require('../prisma');
const UTILS = require('../utils');

/**
 * Error Code {401} // User Not Found
 * Error Code {402} // Invalid User Id
 * Error Code {400} // Error While Finding User
 */
route.get('/:id', async (req, res) => {
    const body = req.params;

    const data = {
        id: body.id
    };

    const error = UTILS.checkNullProps(data);

    if (error) {
        res.status(201).json({ message: error, code: 402 }).end();
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
        res.status(201).json({ message: error, code: 400 }).end();
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

module.exports = route;