export interface IFileSystem {

    dirname(path: string): string;
    join(...paths: string[]): string;
    exists(path: string): Promise<boolean>;
    findKdlFiles(rootPath: string): Promise<string[]>;
    readFileContent(path: string): Promise<string>;
}

export interface IValidator {
    validate(entryPoint: string, snapshot: Record<string, string>): Promise<ValidationError | null>;
}

export interface ValidationError {
    file_path: string;
    severity: string;
    message: string;
    start_offset: number;
    end_offset: number;
}