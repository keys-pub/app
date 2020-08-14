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
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const core_1 = require("@material-ui/core");
const keys_1 = require("../../../rpc/keys");
const keys_d_1 = require("../../../rpc/keys.d");
const electron_1 = require("electron");
const wouter_1 = require("wouter");
const pull_1 = require("../../../store/pull");
exports.default = (props) => {
    // const inputPasswordRef = React.useRef<HTMLInputElement>()
    const inputPasswordConfirmRef = React.useRef();
    const [password, setPassword] = React.useState('');
    const [passwordConfirm, setPasswordConfirm] = React.useState('');
    const [error, setError] = React.useState();
    const [loading, setLoading] = React.useState(false);
    const onInputChangePassword = React.useCallback((e) => {
        let target = e.target;
        setPassword(target.value || '');
    }, []);
    const onInputChangePasswordConfirm = React.useCallback((e) => {
        let target = e.target;
        setPasswordConfirm(target.value || '');
    }, []);
    const authSetPassword = () => {
        if (password != passwordConfirm) {
            setError(new Error("Passwords don't match"));
            return;
        }
        if (password == '') {
            setError(new Error('Oops, password is empty'));
            return;
        }
        const [location, setLocation] = wouter_1.useLocation();
        const req = {
            secret: password,
            type: keys_d_1.AuthType.PASSWORD_AUTH,
        };
        setLoading(true);
        setError(undefined);
        keys_1.authSetup(req)
            .then((resp) => {
            const reqUnlock = {
                secret: password,
                type: keys_d_1.AuthType.PASSWORD_AUTH,
                client: 'app',
            };
            return keys_1.authUnlock(reqUnlock);
        })
            .then((resp) => {
            electron_1.ipcRenderer.send('authToken', { authToken: resp.authToken });
            pull_1.Store.update((s) => {
                s.unlocked = true;
            });
            setLocation('/keys/index');
        })
            .catch(setError)
            .finally(() => {
            setLoading(false);
        });
    };
    const onKeyDownPassword = (event) => {
        var _a;
        if (event.key === 'Enter') {
            (_a = inputPasswordConfirmRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    const onKeyDownPasswordConfirm = (event) => {
        if (event.key === 'Enter') {
            authSetPassword();
        }
    };
    return (React.createElement(core_1.Box, { display: "flex", flexDirection: "column", alignItems: "center" },
        React.createElement(core_1.Typography, { style: { paddingTop: 0, paddingBottom: 20, width: 550, textAlign: 'center' } }, "Hi! If this is the first time you are here, let's create a password. This password will be used to encrypt your keys and secrets and will be required to unlock your vault. This password is not stored or transmitted anywhere."),
        React.createElement(core_1.FormControl, { error: !!error },
            React.createElement(core_1.TextField, { autoFocus: true, label: "Create a Password", variant: "outlined", type: "password", onChange: onInputChangePassword, inputProps: {
                    onKeyDown: onKeyDownPassword,
                    style: { fontSize: 32, height: 18 },
                }, value: password, style: { fontSize: 48, width: 400 }, disabled: loading }),
            React.createElement(core_1.Box, { padding: 1 }),
            React.createElement(core_1.TextField, { label: "Confirm Password", variant: "outlined", type: "password", onChange: onInputChangePasswordConfirm, inputProps: {
                    onKeyDown: onKeyDownPasswordConfirm,
                    style: { fontSize: 32, height: 18 },
                }, value: passwordConfirm, style: { fontSize: 48, width: 400 }, disabled: loading, inputRef: inputPasswordConfirmRef }),
            React.createElement(core_1.FormHelperText, { id: "component-error-text" }, (error === null || error === void 0 ? void 0 : error.message) || ' ')),
        React.createElement(core_1.Box, { display: "flex", flexDirection: "row", justifyContent: "center", style: { width: 400 } },
            React.createElement(core_1.Button, { color: "primary", variant: "outlined", onClick: authSetPassword, disabled: loading }, "Set Password"))));
};
//# sourceMappingURL=password.js.map