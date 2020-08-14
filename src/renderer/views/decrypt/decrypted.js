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
const signer_1 = __importDefault(require("../verify/signer"));
const snack_1 = __importDefault(require("../../components/snack"));
const electron_1 = require("electron");
exports.default = (props) => {
    const [snack, setSnack] = React.useState();
    const copyToClipboard = () => {
        electron_1.clipboard.writeText(props.value);
        setSnack({ message: 'Copied to Clipboard', duration: 2000 });
    };
    const disabled = !props.value;
    const unsigned = !disabled && !props.sender;
    return (React.createElement(core_1.Box, { display: "flex", flexDirection: "column", flex: 1, style: { height: '100%' } },
        React.createElement(signer_1.default, { signer: props.sender, mode: props.mode, unsigned: unsigned, reload: props.reloadSender }),
        React.createElement(core_1.Divider, null),
        React.createElement(core_1.Input, { multiline: true, readOnly: true, value: props.value, disableUnderline: true, inputProps: {
                style: {
                    height: '100%',
                    overflow: 'auto',
                    paddingTop: 8,
                    paddingLeft: 8,
                    paddingBottom: 0,
                    paddingRight: 0,
                },
            }, style: {
                height: '100%',
                width: '100%',
            } }),
        React.createElement(core_1.Box, { style: { position: 'absolute', right: 20, bottom: 6 } },
            React.createElement(core_1.Button, { size: "small", variant: "outlined", color: "primary", disabled: disabled, onClick: copyToClipboard, style: { backgroundColor: 'white' } }, "Copy to Clipboard")),
        React.createElement(snack_1.default, { snack: snack, onClose: () => setSnack(undefined) })));
};
//# sourceMappingURL=decrypted.js.map