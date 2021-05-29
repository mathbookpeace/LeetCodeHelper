import { fileURLToPath } from 'node:url';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "leetcodehelper" is now active!');
	
	let disposable = vscode.commands.registerCommand('leetcodehelper.format_input', async () => {
		let e = vscode.window.activeTextEditor;
		if (!e) return;
		
		let replace = async function (e: vscode.TextEditor, to: string) {
			await e.edit(async function (builder) {
				let p1 = e.document.positionAt(0);
				let p2 = e.document.positionAt(e.document.getText().length);
				if (!p1 || !p2) return;
				
				let range = new vscode.Range(p1, p2);
				await builder.replace(range, to);
			});
		}
		
		let text = e.document.getText();
		let new_text = '';
		for (let i = 0; i < text.length; ++i) {
			if (text[i] == '[') {
				new_text += '{';
			} else if (text[i] == ']') {
				new_text += '}';
			} else {
				new_text += text[i];
			}
		}
		replace(e, new_text);
		vscode.window.showInformationMessage('Formatted!!');
	});
	
	
	let disposable2 = vscode.commands.registerCommand('leetcodehelper.reset', async () => {
		let e = vscode.window.activeTextEditor;
		if (!e) return;
		
		let path = e.document.uri.path + ".template";
		let uri = vscode.Uri.file(path);
		
		try {
			await vscode.workspace.fs.stat(uri);
		} catch {
			vscode.window.showInformationMessage('template file does not exist!');
			return;
		}
		let file = await vscode.workspace.openTextDocument(uri);
		
		let replace = async function (e: vscode.TextEditor, to: string) {
			await e.edit(async function (builder) {
				let p1 = e.document.positionAt(0);
				let p2 = e.document.positionAt(e.document.getText().length);
				if (!p1 || !p2) return;
				
				let range = new vscode.Range(p1, p2);
				await builder.replace(range, to);
			});
		}
		
		let text = file.getText();
		replace(e, text);
	});
	
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// this method is called when your extension is deactivated
export function deactivate() {}
