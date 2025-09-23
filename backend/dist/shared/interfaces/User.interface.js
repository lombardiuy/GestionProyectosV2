"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDepartment = exports.userRole = void 0;
var userRole;
(function (userRole) {
    userRole["Admin"] = "admin";
    userRole["Supervisor"] = "supervisor";
    userRole["Analyst"] = "analyst";
    userRole["Viewer"] = "viewer";
})(userRole || (exports.userRole = userRole = {}));
var userDepartment;
(function (userDepartment) {
    userDepartment["ResearchAndDevelopment"] = "researchAndDevelopment";
    userDepartment["TechnologyTransfer"] = "technologyTransfer";
    userDepartment["Validation"] = "validation";
    userDepartment["Auditor"] = "auditor";
    userDepartment["Testing"] = "testing";
})(userDepartment || (exports.userDepartment = userDepartment = {}));
