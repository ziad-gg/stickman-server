const express = require('express');
const route = express.Router();

const DB = require('../prisma');
const UTILS = require('../utils');

route.get('/:code', async (req, res) => {
    const body = req.params;

    const data = {
        code: body.code
    };

    const error = UTILS.checkNullProps(data);

    if (error) {
        res.status(201).json({ message: error, code: 101 }).end();
        return;
    };

    const Code = await DB.code.findFirst({ where: data }).catch(e => { return { e } });

    if (Code?.e) {
        console.log(Code.e);
        return res.status(201).json({ message: 'Error While Getting This User', error: Code.e, code: 400 }).end();
    } else if (!Code) {
        res.status(201).json({ message: 'Code Not Found', code: 401 }).end();
        return;
    };

    res.status(200).json({ message: 'done', code: 200, data: Code }).end();
});

route.post('/', async (req, res) => {
    const body = req.body;

    const data = {
        code: body.code,
        reward: body.reward,
        limit: body.limit,
    }

    const error = UTILS.checkNullProps(data);

    data.limit = data.limit == 0 ? 10 : data.limit;

    if (error) {
        res.status(201).json({ message: error, code: 101 }).end();
        return;
    };

    const oData = await DB.code.findFirst({ where: { code: data.code } });

    if (oData) {
        return res.status(201).json({ code: 404, message: 'code is already found' }).end();
    }

    const Data = await DB.code.create({ data }).catch(e => { return { e } });

    if (Data?.e) {
        console.log(Data.e);
        res.status(201).json({ message: 'Error While Create This Code', error: Data.e, code: 400 }).end();
    } else {
        res.status(200).json({ message: 'done', code: 200, data: Data }).end();
    };
});

route.post('/redeem', async (req, res) => {
    const body = req.body;

    const data = {
        code: body.code,
        userId: body.userId
    }

    const error = UTILS.checkNullProps(data);

    if (error) {
        res.status(201).json({ message: error, code: 101 }).end();
        return;
    };

    const CData = await DB.code.findFirst({ where: { code: data.code } });
    const UData = await DB.user.findFirst({ where: { id: data.userId } });

    if (!CData) {
        return res.status(201).json({ code: 401, message: 'code is not found', type: 'Code' }).end();
    }

    if (!UData) {
        return res.status(201).json({ code: 401, message: 'User is not found', type: 'User' }).end();
    }

    if (CData.used.length >= CData.limit) {
        return res.status(201).json({ code: 501, message: 'Code Reached The Limit' }).end();
    }

    if (CData.used.includes(UData.id)) {
        return res.status(201).json({ code: 500, message: 'Already Redeemed', type: 'User' }).end();
    }

    await DB.code.update({
        where: {
            code: data.code
        },
        data: {
            used: {
                push: UData.id
            }
        }
    });

    res.status(200).json({ code: 200, reward: CData.reward }).end();
});

module.exports = route;