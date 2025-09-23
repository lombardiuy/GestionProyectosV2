"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth)
        return res.status(401).json({ message: 'Falta token' });
    try {
        const token = auth.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, 'MegaLabs.2025!!');
        req.userId = decoded.id;
        next();
    }
    catch {
        res.status(401).json({ message: 'Token inválido' });
    }
}
