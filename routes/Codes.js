const express = require('express');
const route = express.Router();

const DB = require('../prisma');
const UTILS = require('../utils');

/**
 * @swagger
 * tags:
 *   name: Codes
 *   description: The codes managing API
 * components:
 *   schemas:
 *     Code:
 *       type: object
 *       required:
 *         - code
 *         - reward
 *         - limit
 *       properties:
 *         code:
 *           type: string
 *           description: The name of code
 *         reward:
 *           type: string
 *           description: The code reward
 *         limit:
 *           type: number
 *           description: The maximum number of users who can redeem the code
 *         used:
 *           type: array
 *           items:
 *             type: number
 *           description: Users who have redeemed the code
 *     Response:
 *       type: object
 *       required:
 *         - code
 *         - message
 *       properties:
 *         code:
 *           type: number
 *           description: Response code
 *         message:
 *           type: string
 *           description: Response message
 * /api/codes/{code}:
 *   get:
 *     summary: Get code info
 *     tags: [Codes]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Code name
 *     responses:
 *       200:
 *         description: Code info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Code'
 *       201:
 *         description: Code creation response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 * /api/codes/:
 *   post:
 *     summary: Create code
 *     tags: [Codes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Code'
 *     responses:
 *       200:
 *         description: Code created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Code'
 *       404:
 *         description: Code With The Same Name Already Exist
 *         content: 
 *          application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Code'
 *       201:
 *         description: Error while creating code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 * /api/codes/redeem:
 *   post:
 *     summary: Redeem a code
 *     tags: [Codes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: The code to redeem
 *               userId:
 *                 type: number
 *                 description: The ID of the user redeeming the code
 *             required:
 *               - code
 *               - userId
 *     responses:
 *       200:
 *         description: Code redeemed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   description: Response code
 *                 reward:
 *                   type: string
 *                   description: The reward for redeeming the code
 *       201:
 *         description: Error while redeeming code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       401:
 *         description: Code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       500:
 *         description: Code already redeemed by the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       501:
 *         description: Code limit reached
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 */


/**
 * Error Code {401} // Code Not Found
 * Error Code {402} // Invalid Code Id
 * Error Code {400} // Error While Finding Code
 */
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