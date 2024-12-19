import * as vscode from 'vscode';

function findClassName(code: string): string | null {
    const classRegex = /class\s+(\w+)/;
    const match = code.match(classRegex);
    return match ? match[1] : null;
}

function hasAnyConstructor(code: string, className: string): boolean {
    const constructorRegex = new RegExp(`\\b${className}\\s*\\([^)]*\\)\\s*(?:=|{)`, 'g');
    return constructorRegex.test(code);
}

function hasCopyConstructor(code: string, className: string): boolean {
    const copyConstructorRegex = new RegExp(`\\b${className}\\s*\\(const\\s*${className}\\s*&\\w*\\)\\s*(?:=|{)`, 'g');
    return copyConstructorRegex.test(code);
}

function hasAssignmentOperator(code: string, className: string): boolean {
    const assignmentOperatorRegex = new RegExp(`\\b${className}\\s*&\\s*operator=\\s*\\(const\\s*${className}\\s*&\\w*\\)\\s*(?:=|{)`, 'g');
    return assignmentOperatorRegex.test(code);
}

function findPublicSection(code: string): number {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trimStart();
        if (line.startsWith('public:')) {
            return i;
        } else if (line.startsWith('private:') || line.startsWith('protected:')) {
            return -1;
        }
    }
    return -1;
}

function CopyConstructor(className: string): string {
    return `\t${className}(const ${className}& other) {\n\t\t// TODO: Copy all members\n\t}\n`;
}

function AssignmentOperator(className: string): string {
    return `\t${className}& operator=(const ${className}& other) {\n\t\tif (this == &other)\n\t\treturn *this;\n\t\t// TODO: Copy all members\n\t\treturn *this;\n\t}\n`;
}

function insertCode(code: string, publicIndex: number, newCode: string): string {
    const lines = code.split('\n');
    lines.splice(publicIndex + 1, 0, newCode);
    return lines.join('\n');
}


export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('cpp-rule-of-three', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        if (document.languageId !== 'cpp') {
            vscode.window.showInformationMessage('This command is only available for C++ files.');
            return;
        }

        let code = document.getText();
        const className = findClassName(code);
        if (!className) {
            vscode.window.showErrorMessage('Class name not found.');
            return;
        }
        if (!hasAnyConstructor(code, className)) {
            vscode.window.showErrorMessage('No constructor found.');
            return;
        }
    
        let publicIndex = findPublicSection(code);

        if (publicIndex === -1) {
            vscode.window.showErrorMessage('Public section not found.');
            return;
        }

        let modified = false;
    
        if (!hasCopyConstructor(code, className)) {
            code = insertCode(code, publicIndex, CopyConstructor(className));
            modified = true;
            publicIndex = findPublicSection(code); // publicIndex мог измениться из-за добавления кода
        }

        if (!hasAssignmentOperator(code, className)) {
            code = insertCode(code, publicIndex, AssignmentOperator(className));
            modified = true;
        }


       if (modified) {
        	editor.edit(editBuilder => {
            	const firstLine = document.lineAt(0);
            	const lastLine = document.lineAt(document.lineCount - 1);
            	const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
            	editBuilder.replace(textRange, code);
          	}).then(() => {
        		vscode.commands.executeCommand("editor.action.formatDocument");
				vscode.window.showInformationMessage("Copy constructor and/or assignment operator generated.");
          	});
		} else {
            vscode.window.showInformationMessage('Copy constructor and assignment operator are already implemented.');
        }
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {}