"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = require("../services/user.service");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const users = await (0, user_service_1.getAllUsers)();
        res.json(users);
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message });
    }
});
router.post('/select', async (req, res) => {
    const { id } = req.body;
    if (!id || typeof id !== 'number') {
        return res.status(400).json({ error: 'ID inválido' });
    }
    try {
        const user = await (0, user_service_1.selectUserById)(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(user);
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
