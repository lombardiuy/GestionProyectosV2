"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./data-source");
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/', routes_1.default);
const assetsRoute = path_1.default.resolve("P:\\Desarrollo\\Technology Transfer\\AppProyectos\\dev\\assets\\"); // cambia a tu ruta absoluta real
console.log(assetsRoute);
app.use('/public', express_1.default.static(assetsRoute));
data_source_1.AppDataSource.initialize().then(() => {
    console.log('🟢 Base de datos conectada');
    app.listen(port, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
    });
}).catch(console.error);
