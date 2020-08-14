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
const decrypted_1 = __importDefault(require("./decrypted"));
const decryptedfile_1 = __importDefault(require("./decryptedfile"));
const components_1 = require("../../components");
const electron_1 = require("electron");
const grpc = __importStar(require("@grpc/grpc-js"));
const keys_1 = require("../../rpc/keys");
const pull_1 = require("../../store/pull");
const openFile = () => __awaiter(void 0, void 0, void 0, function* () {
    clearOut();
    const win = electron_1.remote.getCurrentWindow();
    const open = yield electron_1.remote.dialog.showOpenDialog(win, {});
    if (open.canceled) {
        return;
    }
    if (open.filePaths.length == 1) {
        const file = open.filePaths[0];
        pull_1.DecryptStore.update((s) => {
            s.fileIn = file;
        });
    }
});
const clear = () => {
    // TODO: Stream cancel?
    pull_1.DecryptStore.update((s) => {
        s.input = '';
        s.output = '';
        s.fileIn = '';
        s.fileOut = '';
        s.sender = undefined;
        s.mode = undefined;
        s.error = undefined;
    });
};
const clearOut = () => {
    pull_1.DecryptStore.update((s) => {
        s.output = '';
        s.fileOut = '';
        s.sender = undefined;
        s.mode = undefined;
        s.error = undefined;
    });
};
const setError = (err) => {
    pull_1.DecryptStore.update((s) => {
        s.error = err;
    });
};
const reloadSender = (kid) => {
    if (!kid) {
        pull_1.DecryptStore.update((s) => {
            s.sender = undefined;
        });
        return;
    }
    const req = {
        key: kid,
        search: false,
        update: false,
    };
    keys_1.key(req)
        .then((resp) => {
        pull_1.DecryptStore.update((s) => {
            s.sender = resp.key;
        });
    })
        .catch(setError);
};
const decryptInput = (input) => {
    if (input == '') {
        clearOut();
        return;
    }
    console.log('Decrypting...');
    const data = new TextEncoder().encode(input);
    const req = {
        data: data,
    };
    keys_1.decrypt(req)
        .then((resp) => {
        const decrypted = new TextDecoder().decode(resp.data);
        pull_1.DecryptStore.update((s) => {
            s.sender = resp.sender;
            s.error = undefined;
            s.output = decrypted;
            s.fileOut = '';
            s.mode = resp.mode;
        });
    })
        .catch(setError);
};
const decryptFileIn = (fileIn, dir) => {
    clearOut();
    if (fileIn == '')
        return;
    const req = {
        in: fileIn,
        out: dir,
    };
    console.log('Decrypting file...');
    pull_1.DecryptStore.update((s) => {
        s.loading = true;
    });
    const send = keys_1.decryptFile((event) => {
        const { err, res, done } = event;
        if (err) {
            if (err.code == grpc.status.CANCELLED) {
                pull_1.DecryptStore.update((s) => {
                    s.loading = false;
                });
            }
            else {
                pull_1.DecryptStore.update((s) => {
                    s.error = err;
                    s.loading = false;
                });
            }
            return;
        }
        if (res) {
            pull_1.DecryptStore.update((s) => {
                s.fileOut = (res === null || res === void 0 ? void 0 : res.out) || '';
                s.sender = res === null || res === void 0 ? void 0 : res.sender;
                s.error = undefined;
                s.output = '';
                s.mode = res === null || res === void 0 ? void 0 : res.mode;
            });
        }
        if (done) {
            pull_1.DecryptStore.update((s) => {
                s.loading = false;
            });
        }
    });
    send(req, false);
};
const decryptFileTo = (fileIn) => __awaiter(void 0, void 0, void 0, function* () {
    const open = yield electron_1.remote.dialog.showOpenDialog(electron_1.remote.getCurrentWindow(), {
        properties: ['openDirectory'],
    });
    if (open.canceled) {
        return;
    }
    if (open.filePaths.length == 1) {
        const dir = open.filePaths[0];
        decryptFileIn(fileIn, dir);
    }
});
const DecryptToButton = (props) => (React.createElement(core_1.Box, { style: { marginLeft: 10, marginTop: 10 } },
    React.createElement(core_1.Button, { color: "primary", variant: "outlined", disabled: props.disabled, onClick: props.onClick }, "Decrypt to")));
exports.default = (props) => {
    const inputRef = React.useRef();
    const onInputChange = React.useCallback((e) => {
        let target = e.target;
        pull_1.DecryptStore.update((s) => {
            s.input = target.value || '';
        });
    }, []);
    const { input, output, fileIn, fileOut, error, sender, mode, loading } = pull_1.DecryptStore.useState();
    React.useEffect(() => {
        if (fileIn == '') {
            decryptInput(input);
        }
    }, [input]);
    const showDecryptFileButton = fileIn && !fileOut;
    return (React.createElement(core_1.Box, { display: "flex", flex: 1, flexDirection: "column", style: { overflow: 'hidden' } },
        React.createElement(core_1.Box, { style: { position: 'relative', height: '40%' } },
            fileIn && (React.createElement(core_1.Box, { style: { paddingTop: 8, paddingLeft: 8 } },
                React.createElement(core_1.Typography, { style: Object.assign(Object.assign({}, components_1.styles.mono), { display: 'inline' }) },
                    fileIn,
                    "\u00A0"),
                React.createElement(components_1.Link, { inline: true, onClick: clear }, "Clear"))),
            !fileIn && (React.createElement(core_1.Box, { style: { height: '100%' } },
                React.createElement(core_1.Input, { multiline: true, autoFocus: true, onChange: onInputChange, value: input, disableUnderline: true, inputProps: {
                        spellCheck: 'false',
                        ref: inputRef,
                        style: Object.assign(Object.assign({}, components_1.styles.mono), { height: '100%', overflow: 'auto', paddingTop: 8, paddingLeft: 8, paddingBottom: 0, paddingRight: 0 }),
                    }, style: {
                        height: '100%',
                        width: '100%',
                    } }),
                !input && (React.createElement(core_1.Box, { style: { position: 'absolute', top: 6, left: 8 } },
                    React.createElement(core_1.Typography, { style: { display: 'inline', color: '#a2a2a2' }, onClick: () => { var _a; return (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); } },
                        "Enter encrypted text or",
                        ' '),
                    React.createElement(components_1.Link, { inline: true, onClick: openFile }, "select a file"),
                    React.createElement(core_1.Typography, { style: { display: 'inline' } }, "."))))),
            React.createElement(core_1.Box, { style: { position: 'absolute', bottom: 0, width: '100%' } },
                !loading && React.createElement(core_1.Divider, null),
                loading && React.createElement(core_1.LinearProgress, null))),
        React.createElement(core_1.Box, { style: {
                height: '60%',
                width: '100%',
            } },
            error && (React.createElement(core_1.Box, { style: { paddingLeft: 10, paddingTop: 10 } },
                React.createElement(core_1.Typography, { style: Object.assign(Object.assign({}, components_1.styles.mono), { color: 'red', display: 'inline' }) },
                    error,
                    "\u00A0"))),
            !error && showDecryptFileButton && (React.createElement(DecryptToButton, { onClick: () => decryptFileTo(fileIn), disabled: loading })),
            !error && !showDecryptFileButton && fileOut && (React.createElement(decryptedfile_1.default, { fileOut: fileOut, sender: sender, mode: mode, reloadKey: () => reloadSender(sender === null || sender === void 0 ? void 0 : sender.id) })),
            !error && !showDecryptFileButton && !fileOut && (React.createElement(decrypted_1.default, { value: output, sender: sender, mode: mode, reloadSender: () => reloadSender(sender === null || sender === void 0 ? void 0 : sender.id) })))));
};
//# sourceMappingURL=index.js.map