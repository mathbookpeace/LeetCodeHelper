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
        yield cmdFormatInput();
    }));
    let disposable2 = vscode.commands.registerCommand('leetcodehelper.reset', () => __awaiter(this, void 0, void 0, function* () {
        yield cmdReset();
    }));
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
function cmdFormatInput() {
    return __awaiter(this, void 0, void 0, function* () {
        let e = vscode.window.activeTextEditor;
        if (!e) {
            return;
        }
        let replace = function (e, to) {
            return __awaiter(this, void 0, void 0, function* () {
                yield e.edit(function (builder) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let p1 = e.document.positionAt(0);
                        let p2 = e.document.positionAt(e.document.getText().length);
                        if (!p1 || !p2) {
                            return;
                        }
                        let range = new vscode.Range(p1, p2);
                        yield builder.replace(range, to);
                    });
                });
            });
        };
        let text = e.document.getText();
        let newText = '';
        for (let i = 0; i < text.length; ++i) {
            if (text[i] === '[') {
                newText += '{';
            }
            else if (text[i] === ']') {
                newText += '}';
            }
            else {
                newText += text[i];
            }
        }
        replace(e, newText);
    });
}
function cmdReset() {
    return __awaiter(this, void 0, void 0, function* () {
        let e = vscode.window.activeTextEditor;
        if (!e) {
            return;
        }
        let path = e.document.uri.path + ".template";
        let uri = vscode.Uri.file(path);
        try {
            yield vscode.workspace.fs.stat(uri);
        }
        catch (_a) {
            vscode.window.showInformationMessage('template file does not exist!');
            return;
        }
        let file = yield vscode.workspace.openTextDocument(uri);
        let replace = function (e, to) {
            return __awaiter(this, void 0, void 0, function* () {
                yield e.edit(function (builder) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let p1 = e.document.positionAt(0);
                        let p2 = e.document.positionAt(e.document.getText().length);
                        if (!p1 || !p2) {
                            return;
                        }
                        let range = new vscode.Range(p1, p2);
                        yield builder.replace(range, to);
                    });
                });
            });
        };
        let text = file.getText();
        replace(e, text);
        let lineNum = parseLineNumberFromFirstLine(file);
        if (lineNum !== -1) {
            moveCursorToLineEnd(e, lineNum);
        }
    });
}
function parseLineNumberFromFirstLine(file) {
    if (file.lineCount === 0) {
        return -1;
    }
    let firstLine = file.lineAt(0).text;
    let lineNumPos = firstLine.search("line=");
    if (lineNumPos === -1) {
        return -1;
    }
    let lineNum = 0;
    for (let i = lineNumPos + 5; i < firstLine.length; ++i) {
        let ch = firstLine[i];
        if (ch < '0' || ch > '9') {
            break;
        }
        lineNum = lineNum * 10 + parseInt(ch);
    }
    return lineNum;
}
function moveCursorToLineEnd(edi, line) {
    let number = Math.max(0, Math.min(line - 1, edi.document.lineCount - 1));
    let range = edi.document.lineAt(number).range;
    edi.selection = new vscode.Selection(range.end, range.end);
    edi.revealRange(range);
}
//# sourceMappingURL=extension.js.map