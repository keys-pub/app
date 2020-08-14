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
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const core_1 = require("@material-ui/core");
const components_1 = require("../../components");
const keys_d_1 = require("../../rpc/keys.d");
const keys_1 = require("../../rpc/keys");
class KeyExportDialog extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            export: '',
            password: '',
            passwordConfirm: '',
        };
        this.export = () => __awaiter(this, void 0, void 0, function* () {
            const password = this.state.password;
            const confirm = this.state.passwordConfirm;
            if (password != confirm) {
                this.setState({
                    error: new Error("Passwords don't match"),
                });
                return;
            }
            let noPassword = false;
            if (!password) {
                noPassword = true;
            }
            this.setState({ error: undefined });
            const req = {
                kid: this.props.kid,
                password: this.state.password,
                noPassword: noPassword,
                public: false,
                type: keys_d_1.ExportType.DEFAULT_EXPORT_TYPE,
            };
            keys_1.keyExport(req)
                .then((resp) => {
                const out = new TextDecoder().decode(resp.export);
                this.setState({ password: '', passwordConfirm: '', export: out });
            })
                .catch((err) => {
                this.setState({ error: err });
            });
        });
        this.close = () => {
            this.props.close();
            this.setState({ password: '', passwordConfirm: '', export: '', error: undefined });
        };
        this.onInputChangePassword = (e) => {
            let target = e.target;
            this.setState({ password: target ? target.value : '', error: undefined });
        };
        this.onInputChangeConfirm = (e) => {
            let target = e.target;
            this.setState({ passwordConfirm: target ? target.value : '', error: undefined });
        };
    }
    renderExport() {
        var _a;
        // TODO: Export type
        return (React.createElement(core_1.Box, { display: "flex", flexDirection: "column", style: { height: 200 } },
            React.createElement(core_1.Typography, { style: { paddingBottom: 10 } }, "Export a key encrypted with a password."),
            React.createElement(core_1.Typography, { style: Object.assign(Object.assign({}, components_1.styles.mono), { paddingBottom: 20 }) }, this.props.kid),
            React.createElement(core_1.FormControl, { error: !!this.state.error },
                React.createElement(core_1.TextField, { autoFocus: true, label: "Password", variant: "outlined", type: "password", onChange: this.onInputChangePassword, value: this.state.password }),
                React.createElement(core_1.Box, { padding: 1 }),
                React.createElement(core_1.TextField, { label: "Confirm Password", variant: "outlined", type: "password", onChange: this.onInputChangeConfirm, value: this.state.passwordConfirm }),
                React.createElement(core_1.FormHelperText, { id: "component-error-text" }, ((_a = this.state.error) === null || _a === void 0 ? void 0 : _a.message) || ' '))));
    }
    renderExported() {
        return (React.createElement(core_1.Box, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", style: { height: 200 } },
            React.createElement(core_1.Typography, { style: Object.assign(Object.assign({}, components_1.styles.mono), { backgroundColor: 'black', color: 'white', paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, width: '100%', height: '100%' }) }, this.state.export)));
    }
    render() {
        return (React.createElement(core_1.Dialog, { onClose: this.props.close, open: this.props.open, maxWidth: "sm", fullWidth: true, disableBackdropClick: true },
            React.createElement(components_1.DialogTitle, { onClose: this.props.close }, "Export Key"),
            React.createElement(core_1.DialogContent, { dividers: true },
                this.state.export == '' && this.renderExport(),
                this.state.export !== '' && this.renderExported()),
            React.createElement(core_1.DialogActions, null,
                React.createElement(core_1.Button, { onClick: this.close }, "Close"),
                this.state.export == '' && (React.createElement(core_1.Button, { color: "primary", onClick: this.export }, "Export")))));
    }
}
exports.default = KeyExportDialog;
// const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
//   return {
//     kid: query(state, 'kid'),
//   }
// }
// export default connect(mapStateToProps)(KeyExportView)
//# sourceMappingURL=index.js.map