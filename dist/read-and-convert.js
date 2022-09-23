"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAndCovert = void 0;
const node_fs_1 = require("node:fs");
const js_yaml_1 = __importDefault(require("js-yaml"));
const convert_virtual_code_owners_1 = require("./convert-virtual-code-owners");
function readAndCovert(pVirtualCodeOwnersFileName, pVirtualTeamsFileName) {
    const lVirtualCodeOwnersFileAsAString = (0, node_fs_1.readFileSync)(pVirtualCodeOwnersFileName, {
        encoding: "utf-8",
    });
    const lVirtualTeamsYamlAsAString = (0, node_fs_1.readFileSync)(pVirtualTeamsFileName, {
        encoding: "utf-8",
    });
    const lTeamMap = js_yaml_1.default.load(lVirtualTeamsYamlAsAString);
    return (0, convert_virtual_code_owners_1.convert)(lVirtualCodeOwnersFileAsAString, lTeamMap);
}
exports.readAndCovert = readAndCovert;
