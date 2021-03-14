"use strict";
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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    console.log('Congratulations, your extension "leetcodehelper" is now active!');
    let disposable = vscode.commands.registerCommand('leetcodehelper.format_input', () => __awaiter(this, void 0, void 0, function* () {
        let e = vscode.window.activeTextEditor;
        if (!e)
            return;
        let replace = function (e, to) {
            return __awaiter(this, void 0, void 0, function* () {
                yield e.edit(function (builder) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let p1 = e.document.positionAt(0);
                        let p2 = e.document.positionAt(e.document.getText().length);
                        if (!p1 || !p2)
                            return;
                        let range = new vscode.Range(p1, p2);
                        yield builder.replace(range, to);
                    });
                });
            });
        };
        let text = e.document.getText();
        let new_text = '';
        for (let i = 0; i < text.length; ++i) {
            if (text[i] == '[') {
                new_text += '{';
            }
            else if (text[i] == ']') {
                new_text += '}';
            }
            else {
                new_text += text[i];
            }
        }
        replace(e, new_text);
        vscode.window.showInformationMessage('Formatted!!');
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map