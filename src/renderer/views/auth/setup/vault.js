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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const core_1 = require("@material-ui/core");
const logo_1 = __importDefault(require("../../logo"));
const components_1 = require("../../../components");
const keys_1 = require("../../../rpc/keys");
class AuthVaultView extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            loading: false,
            phrase: '',
        };
        this.onInputChangePhrase = (e) => {
            let target = e.target;
            this.setState({ phrase: target ? target.value : '', error: undefined });
        };
        this.onKeyDownPhrase = (event) => {
            if (event.key === 'Enter') {
                this.authVault();
            }
        };
        this.setError = (err) => {
            this.setState({ error: err });
        };
        this.authVault = () => __awaiter(this, void 0, void 0, function* () {
            const req = {
                phrase: this.state.phrase,
            };
            this.setState({ loading: true, error: undefined });
            keys_1.authVault(req)
                .then((resp) => {
                this.props.setup();
            })
                .catch(this.setError)
                .finally(() => this.setState({ loading: false }));
        });
    }
    renderServerSelect() {
        return (React.createElement(core_1.Select, { variant: "outlined", value: 'keys.pub', style: { width: 250, height: 40 } },
            React.createElement(core_1.MenuItem, { value: 'keys.pub' }, "keys.pub")));
    }
    render() {
        var _a;
        return (React.createElement(core_1.Box, { display: "flex", flexGrow: 1, flexDirection: "column", alignItems: "center" },
            React.createElement(logo_1.default, { loading: this.state.loading, top: 60 }),
            React.createElement(core_1.Typography, { style: { paddingTop: 0, width: 550, textAlign: 'center' }, paragraph: true },
                "Enter in a vault auth phrase to connect to your vault.",
                React.createElement("br", null),
                "You can generate an auth phrase from any of your other devices (in Vault settings)."),
            React.createElement(core_1.Box, { marginBottom: 1 }, this.renderServerSelect()),
            React.createElement(core_1.FormControl, { error: !!this.state.error },
                React.createElement(core_1.TextField, { autoFocus: true, label: "Vault Phrase", variant: "outlined", multiline: true, rows: 4, onChange: this.onInputChangePhrase, inputProps: {
                        onKeyDown: this.onKeyDownPhrase,
                    }, value: this.state.phrase, disabled: this.state.loading, InputProps: {
                        style: Object.assign(Object.assign({}, components_1.styles.mono), { fontSize: 12, width: 450 }),
                    } }),
                React.createElement(core_1.FormHelperText, { id: "component-error-text" }, ((_a = this.state.error) === null || _a === void 0 ? void 0 : _a.message) || ' ')),
            React.createElement(core_1.Box, { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" },
                React.createElement(core_1.Box, { display: "flex", flexDirection: "row", style: { width: 450, paddingTop: 6 } },
                    React.createElement(core_1.Button, { color: "secondary", variant: "outlined", onClick: this.props.back, disabled: this.state.loading }, "Back"),
                    React.createElement(core_1.Box, { flex: 1, flexGrow: 1 }),
                    React.createElement(core_1.Button, { color: "primary", variant: "outlined", onClick: this.authVault, disabled: this.state.loading }, "Connect")))));
    }
}
exports.default = AuthVaultView;
//# sourceMappingURL=vault.js.map