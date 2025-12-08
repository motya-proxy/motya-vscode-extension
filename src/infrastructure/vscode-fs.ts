import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { IFileSystem } from '../core/interfaces';

export class VsCodeFileSystem implements IFileSystem {
    dirname(p: string): string {
        return path.dirname(p);
    }

    join(...paths: string[]): string {
        return path.join(...paths);
    }

    async exists(p: string): Promise<boolean> {
        return fs.existsSync(p); 
    }

    async findKdlFiles(rootPath: string): Promise<string[]> {
        const rootUri = vscode.Uri.file(rootPath);
        const pattern = new vscode.RelativePattern(rootUri, '**/*.kdl');
        
        const uris = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
        return uris.map(u => u.fsPath);
    }

    async readFileContent(filePath: string): Promise<string> {

        const openDoc = vscode.workspace.textDocuments.find(d => d.uri.fsPath === filePath);
        if (openDoc) {
            return openDoc.getText();
        }
        
        const uri = vscode.Uri.file(filePath);
        const bytes = await vscode.workspace.fs.readFile(uri);
        return new TextDecoder().decode(bytes);
    }
}