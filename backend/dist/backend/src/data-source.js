"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
require("dotenv/config");
const User_entity_1 = require("./entities/User.entity");
console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mssql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '1433'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User_entity_1.User],
    synchronize: false,
    options: {
        encrypt: false,
        instanceName: process.env.DB_INSTANCE_NAME,
    },
});
