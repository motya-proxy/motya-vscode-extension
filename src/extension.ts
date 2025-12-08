import * as vscode from 'vscode';
import { VsCodeFileSystem } from './infrastructure/vscode-fs';
import { WasmAdapter } from './infrastructure/wasm-adapter';
import { ValidationService } from './core/validation-service';
import { ValidationError } from './core/interfaces';

export function activate(context: vscode.ExtensionContext) {
    
    const fs = new VsCodeFileSystem();
    const validator = new WasmAdapter();
    const service = new ValidationService(fs, validator);

    const diagnosticCollection = vscode.languages.createDiagnosticCollection('motya');
    context.subscriptions.push(diagnosticCollection);

    let timeout: NodeJS.Timeout | undefined;

    const triggerValidation = (doc: vscode.TextDocument) => {
        if (doc.languageId !== 'kdl' && !doc.fileName.endsWith('.kdl')) {
			return;
		}

        if (timeout) {
			clearTimeout(timeout);
		}
        
        timeout = setTimeout(async () => {
            try {
                const error = await service.validateFile(doc.fileName);
                diagnosticCollection.clear();
                if(error && error.message) {
                    let diagnostic = mapToVsCodeDiagnostic(doc, error);
                    const uri = vscode.Uri.file(error.file_path);
                    diagnosticCollection.set(uri, [diagnostic]);
                }

            } catch (e) {
                console.error("Validation failed", e);
            }
        }, 300); 
    };

	
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => triggerValidation(e.document)),
        vscode.workspace.onDidOpenTextDocument(triggerValidation),
        vscode.workspace.onDidSaveTextDocument(triggerValidation)
    );

	
    if (vscode.window.activeTextEditor) {
        triggerValidation(vscode.window.activeTextEditor.document);
    }
}


function mapToVsCodeDiagnostic(doc: vscode.TextDocument, err: ValidationError): vscode.Diagnostic {
    
    const startPos = doc.positionAt(err.start_offset);

    const endPos = doc.positionAt(err.end_offset);
    
    const range = new vscode.Range(startPos, endPos); 

    return new vscode.Diagnostic(range, err.message, vscode.DiagnosticSeverity.Error);
}

export function deactivate() {}