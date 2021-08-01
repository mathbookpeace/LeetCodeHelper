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
	
	context.subscriptions.push(vscode.commands.registerCommand('leetcodehelper.copy', async () => {
		await cmdCopy();
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('leetcodehelper.copy_between_symbol', async () => {
		await cmdCopyBetweenSymbol();
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

async function cmdCopy()
{
	let edi = vscode.window.activeTextEditor;
	if (!edi) { return; }
	
	let start = parseNumberFromFirstLine("copy_start", edi.document);
	if (start === -1) { start = 1; }
	let end = parseNumberFromFirstLine("copy_end", edi.document);
	if (end === -1) { end = edi.document.lineCount; }
	
	start = Math.min(edi.document.lineCount - 1, Math.max(0, start - 1));
	end = Math.max(start, Math.min(edi.document.lineCount - 1, end - 1));
	
	let range = new vscode.Range(start, 0, end, edi.document.lineAt(end).text.length);
	let text = edi.document.getText(range);
	await vscode.env.clipboard.writeText(text);
}


async function cmdCopyBetweenSymbol()
{
	let edi = vscode.window.activeTextEditor;
	if (!edi) { return; }
	
	let start = 0;
	let end = edi.document.lineCount-1;
	
	let start_symbol = parseStringFromFirstLine("copy_start_symbol", edi.document);
	if (start_symbol) {
		let ss_line = searchWord(start_symbol, edi.document, 1);
		if (ss_line != -1) {
			start = ss_line;
		}
	}
	let end_symbol = parseStringFromFirstLine("copy_end_symbol", edi.document);
	if (end_symbol) {
		let es_line = searchWord(end_symbol, edi.document, start + 1);
		if (es_line != -1) {
			end = es_line;
		}
	}
	start = Math.min(edi.document.lineCount - 1, Math.max(0, start + 1));
	end = Math.max(start, Math.min(edi.document.lineCount - 1, end - 1));
	
	let range = new vscode.Range(start, 0, end, edi.document.lineAt(end).text.length);
	let text = edi.document.getText(range);
	await vscode.env.clipboard.writeText(text);
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
	
	let lineNum = parseNumberFromFirstLine("line", file);
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


function parseNumberFromFirstLine(key: string, file: vscode.TextDocument) : number
{
	if (file.lineCount === 0) { return -1; }
	let firstLine = file.lineAt(0).text;
	
	let keyPos = firstLine.search(key + "=");
	if (keyPos === -1) { return -1; }
	
	let val = 0;
	for (let i = keyPos + key.length + 1; i < firstLine.length; ++i) {
		let ch = firstLine[i];
		if (ch < '0' || ch > '9') { break; }
		val = val * 10 + parseInt(ch);
	}
	return val;
}


function parseStringFromFirstLine(key: string, file: vscode.TextDocument) : string | undefined
{
	if (file.lineCount === 0) { return undefined; }
	let firstLine = file.lineAt(0).text;
	
	let keyPos = firstLine.search(key + "=");
	if (keyPos === -1) { return undefined; }
	
	let val = "";
	for (let i = keyPos + key.length + 1; i < firstLine.length; ++i) {
		let ch = firstLine[i];
		if (ch === ' ') { break; }
		val += ch;
	}
	return val;
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


function searchWord(word: string, file: vscode.TextDocument, off: number) : number
{
	for (let line = Math.max(0, off); line < file.lineCount; ++line) {
		if (file.lineAt(line).text.search(word) != -1)
			return line;
	}
	return -1;
}