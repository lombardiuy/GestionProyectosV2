"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectUserById = exports.getAllUsers = void 0;
const data_source_1 = require("../data-source");
const User_entity_1 = require("../entities/User.entity");
const userRepository = data_source_1.AppDataSource.getRepository(User_entity_1.User);
//READ
const getAllUsers = async () => {
    return await userRepository.find();
};
exports.getAllUsers = getAllUsers;
const selectUserById = async (id) => {
    return await userRepository.findOneBy({ id });
};
exports.selectUserById = selectUserById;
