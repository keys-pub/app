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
const logo_1 = __importDefault(require("../../logo"));
const link_1 = __importDefault(require("../../../components/link"));
const vault_1 = __importDefault(require("./vault"));
const password_1 = __importDefault(require("./password"));
class AuthSetupView extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            step: '',
        };
        this.clear = () => {
            this.setState({ step: '' });
        };
        this.connect = () => {
            this.setState({ step: 'vault' });
        };
    }
    renderIntro() {
        return (React.createElement(core_1.Box, { display: "flex", flexGrow: 1, flexDirection: "column", alignItems: "center" },
            React.createElement(logo_1.default, { top: 60 }),
            React.createElement(password_1.default, null),
            React.createElement(core_1.Box, { style: { paddingTop: 10 } },
                React.createElement(core_1.Typography, { style: { width: 550, marginTop: 10, textAlign: 'center' } },
                    "Do you want to",
                    ' ',
                    React.createElement(link_1.default, { span: true, onClick: this.connect }, "connect to an existing vault")))));
    }
    render() {
        switch (this.state.step) {
            case '':
                return this.renderIntro();
            case 'vault':
                return React.createElement(vault_1.default, { back: this.clear, setup: this.props.refresh });
        }
    }
}
exports.default = AuthSetupView;
//# sourceMappingURL=index.js.map