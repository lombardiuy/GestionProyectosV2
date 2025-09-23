"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDevToken = exports.login = exports.register = void 0;
const data_source_1 = require("../data-source");
const User_entity_1 = require("../entities/User.entity");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepository = data_source_1.AppDataSource.getRepository(User_entity_1.User);
const register = async (user) => {
    const exists = await userRepository.findOneBy({ username: user.username });
    if (exists)
        throw new Error('El usuario ya existe');
    const hashed = await bcryptjs_1.default.hash(user.password, 10);
    const createdUser = userRepository.create(user);
    return await userRepository.save(createdUser);
};
exports.register = register;
const login = async (username, password) => {
    console.warn("auth/login");
    const user = await userRepository.findOneBy({ username });
    if (!user)
        throw new Error('Usuario no encontrado');
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error('Contraseña incorrecta');
    const { password: _, ...userWithoutPassword } = user;
    return jsonwebtoken_1.default.sign(userWithoutPassword, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};
exports.login = login;
const getDevToken = async () => {
    console.log("llamando");
    console.log("🔧 Valor de process.env.AUTH:", process.env.AUTH);
    if (process.env.AUTH === 'false') {
        const fakeToken = {
            id: 0,
            name: "Usuario prueba",
            username: "testing",
            status: "operative",
            profilePicture: false,
            userRole: "admin",
            activated: true,
            userDepartment: "testing"
        };
        return jsonwebtoken_1.default.sign(fakeToken, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });
    }
    else {
        throw new Error('Debe desactivar la autenticación primero!');
    }
};
exports.getDevToken = getDevToken;
