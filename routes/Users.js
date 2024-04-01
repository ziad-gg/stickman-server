const express = require('express');
const route = express.Router();

const DB = require('../prisma');
const UTILS = require('../utils');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: APIs for managing users
 * definitions:
 *   User:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         description: The unique identifier for the user.
 *       coins:
 *         type: number
 *         description: The amount of coins the user has.
 *       doors:
 *         type: number
 *         description: The number of doors the user has.
 *       sticks:
 *         type: array
 *         items:
 *           type: string
 *         description: List of sticks the user has.
 *       total:
 *         type: object
 *         properties:
 *           coins:
 *             type: number
 *             description: Total coins collected by the user.
 *           damage:
 *             type: number
 *             description: Total damage dealt by the user.
 *           eggs:
 *             type: number
 *             description: Total eggs collected by the user.
 *           playtime:
 *             type: number
 *             description: Total playtime of the user.
 *           robux:
 *             type: number
 *             description: Total robux owned by the user.
 *           worlds:
 *             type: number
 *             description: Total worlds visited by the user.
 *           levels:
 *             type: number
 *             description: Total levels completed by the user.
 *           xp:
 *             type: number
 *             description: Total experience points earned by the user.
 *     required:
 *       - id
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to get
 *     responses:
 *       200:
 *         description: User found
 *         schema:
 *           $ref: '#/definitions/User'
 *       201:
 *         description: User not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Error message
 *             code:
 *               type: number
 *               description: Error code
 *       400:
 *         description: Error while finding user
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Error message
 *             code:
 *               type: number
 *               description: Error code
 *       402:
 *         description: Invalid user ID
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Error message
 *             code:
 *               type: number
 *               description: Error code
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: User created successfully
 *         schema:
 *           $ref: '#/definitions/User'
 *       201:
 *         description: Error while creating user
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Error message
 *             code:
 *               type: number
 *               description: Error code
 */


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

module.exports = route;