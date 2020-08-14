"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const core_1 = require("@material-ui/core");
const components_1 = require("../../components");
const signer_1 = __importDefault(require("../verify/signer"));
const electron_1 = require("electron");
exports.default = (props) => {
    const openFolder = () => {
        electron_1.shell.showItemInFolder(props.fileOut);
    };
    const unsigned = !!props.fileOut && !props.sender;
    return (React.createElement(core_1.Box, { display: "flex", flexDirection: "column", flex: 1, style: { height: '100%' } },
        React.createElement(core_1.Box, null,
            React.createElement(signer_1.default, { signer: props.sender, mode: props.mode, unsigned: unsigned, reload: props.reloadKey }),
            React.createElement(core_1.Divider, null),
            React.createElement(core_1.Box, { style: { paddingLeft: 10, paddingTop: 10 } },
                React.createElement(core_1.Typography, { style: Object.assign(Object.assign({}, components_1.styles.mono), { display: 'inline' }) },
                    props.fileOut,
                    "\u00A0"),
                React.createElement(components_1.Link, { inline: true, onClick: openFolder }, "Open Folder")))));
};
//# sourceMappingURL=decryptedfile.js.map