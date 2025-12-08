import { IValidator, ValidationError } from '../core/interfaces';

import * as wasm from '../../pkg/motya_vscode'; 

export class WasmAdapter implements IValidator {
    async validate(entryPoint: string, snapshot: Record<string, string>): Promise<ValidationError | null> {
        
        try {
            const rawErrors = await wasm.validate_workspace(entryPoint, snapshot);
            return rawErrors || []; 
        } catch (e) {
            console.error("Wasm validation crashed:", e);
            return null;
        }
    }
}