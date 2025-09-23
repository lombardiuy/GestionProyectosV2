"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("../services/auth.service");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    const userInput = req.body;
    try {
        const user = await (0, auth_service_1.register)(userInput);
        res.json({ message: 'Usuario creado', user });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const token = await (0, auth_service_1.login)(username, password);
        res.json({ token });
    }
    catch (err) {
        res.status(401).json({ error: err.message });
    }
});
router.get('/getDevToken', async (req, res) => {
    console.log("llamada a ruta");
    try {
        const token = await (0, auth_service_1.getDevToken)();
        res.json({ token });
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message });
    }
});
router.get('/', async (req, res) => {
    console.log("llamada a ruta");
});
/*Ejemplo ruta protegida
router.get('/devToken', authMiddleware, async (req, res) => {
  try {
    const user = await authService.getProfile((req as any).userId);
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'No autorizado' });
  }
});

*/
exports.default = router;
