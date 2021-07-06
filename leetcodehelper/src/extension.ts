import { TextEncoder } from 'util';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "leetcodehelper" is now active!');
	
	context.subscriptions.push(vscode.commands.registerCommand('leetcodehelper.format_input', async () => {
		await cmdFormatInput();
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('leetcodehelper.reset', async () => {
		await cmdReset();
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('leetcodehelper.backup', async () => {
		await cmdBackup();
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('leetcodehelper.restore', async () => {
		await cmdRestore();
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}


async function cmdFormatInput()
{
	let e = vscode.window.activeTextEditor;
	if (!e) { return; }
	
	let text = e.document.getText();
	let newText = '';
	for (let i = 0; i < text.length; ++i) {
		if (text[i] === '[') {
			newText += '{';
		} else if (text[i] === ']') {
			newText += '}';
		} else {
			newText += text[i];
		}
	}
	replaceActiveFile(e, newText);
}


async function cmdReset()
{
	let edi = vscode.window.activeTextEditor;
	if (!edi) { return; }
	
	await replaceActiveFileWithAnother(edi, "template");
}


async function cmdBackup()
{
	let options: vscode.InputBoxOptions = {
		placeHolder: "Name"
	};
	vscode.window.showInputBox(options).then(async name => {
		if (!name) { return; }
		let edi = vscode.window.activeTextEditor;
		if (!edi) { return; }
		
		await replaceAnotherFileWithActive(edi, name);
	});
}


async function cmdRestore()
{
	let options: vscode.InputBoxOptions = {
		placeHolder: "Name"
	};
	vscode.window.showInputBox(options).then(async name => {
		if (!name) { return; }
		let edi = vscode.window.activeTextEditor;
		if (!edi) { return; }
		
		await replaceActiveFileWithAnother(edi, name);
	});
}


async function replaceActiveFileWithAnother(edi: vscode.TextEditor, another: string)
{
	let path = edi.document.uri.path + "." + another;
	let uri = vscode.Uri.file(path);
	
	try {
		await vscode.workspace.fs.stat(uri);
	} catch {
		vscode.window.showInformationMessage(`${another} file does not exist!`);
		return;
	}
	let file = await vscode.workspace.openTextDocument(uri);
	
	let text = file.getText();
	replaceActiveFile(edi, text);
	
	let lineNum = parseLineNumberFromFirstLine(file);
	if (lineNum !== -1) {
		moveCursorToLineEnd(edi, lineNum);
	}
}


async function replaceAnotherFileWithActive(edi: vscode.TextEditor, another: string)
{
	let path = edi.document.uri.path + "." + another;
	let uri = vscode.Uri.file(path);
	
	let text = edi.document.getText();
	let enc = new TextEncoder;
	
	await vscode.workspace.fs.writeFile(uri, enc.encode(text));
}


function parseLineNumberFromFirstLine(file: vscode.TextDocument) : number
{
	if (file.lineCount === 0) { return -1; }
	let firstLine = file.lineAt(0).text;
	
	let lineNumPos = firstLine.search("line=");
	if (lineNumPos === -1) { return -1; }
	
	let lineNum = 0;
	for (let i = lineNumPos + 5; i < firstLine.length; ++i) {
		let ch = firstLine[i];
		if (ch < '0' || ch > '9') { break; }
		lineNum = lineNum * 10 + parseInt(ch);
	}
	return lineNum;
}


function moveCursorToLineEnd(edi: vscode.TextEditor, line: number)
{
	let number = Math.max(0, Math.min(line - 1, edi.document.lineCount-1));
	let range = edi.document.lineAt(number).range;
	edi.selection = new vscode.Selection(range.end, range.end);
	edi.revealRange(range);
}


async function replaceActiveFile(edi: vscode.TextEditor, to: string)
{
	await edi.edit(async function (builder) {
		let p1 = edi.document.positionAt(0);
		let p2 = edi.document.positionAt(edi.document.getText().length);
		if (!p1 || !p2) { return; }
		
		let range = new vscode.Range(p1, p2);
		await builder.replace(range, to);
	});
}