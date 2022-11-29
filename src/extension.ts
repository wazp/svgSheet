// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { JSDOM } from 'jsdom';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let svgsheet = vscode.commands.registerCommand('svgsheet.showPreview', () => {
		// open a new preview window with the svg sheet of the currently selected file
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const currentDocument = editor.document;
			const { document } = new JSDOM(currentDocument.getText()).window;
			const svgs = document.getElementsByTagName('svg');
			let svgList = '';
			for (const svg of svgs) {
				// get ech symbol inside of svg
				const symbols = svg.getElementsByTagName('symbol');
				for (const symbol of symbols) {
					const id = symbol.getAttribute('id');
					const viewBox = symbol.getAttribute('viewBox') ?? '';
					const splitViewBox = viewBox.split(' ');

					// We should probably check if the viewBox is valid, and if it even exists.
					const width = splitViewBox[2];
					const height = splitViewBox[3];
					const content = symbol.innerHTML;
					svgList += `<div class="svg" title="${id}"><svg id="${id}" viewBox="${viewBox}" width="${width}" height="${height}">${content}</svg></div>`;
				}
			}
			const html = `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title>SVG Sheet</title>
	<style type="text/css">
		.svgsheet {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
		}
		.svg {
			margin: 10px;
			fill: var(--vscode-editor-foreground)
		}
	</style>
</head>
<body>
	<div class="svgsheet">
		${svgList}
	</div>
</body>
</html>`;

			const panel = vscode.window.createWebviewPanel(
				'svgsheet',
				'SVG Sheet',
				vscode.ViewColumn.Two,
				{
					enableScripts: true
				}
			);

			panel.webview.html = html;
		} else { // no editor opened
			vscode.window.showErrorMessage('No editor opened, so no SVG sheet to show.');
		}
	});

	context.subscriptions.push(svgsheet);
}

// This method is called when your extension is deactivated
export function deactivate() {}
