import { IFileSystem } from './interfaces';

export class ConfigLocator {
    private ENTRY_FILENAME = 'main.kdl';
    private MAX_DEPTH = 5;

    constructor(private fs: IFileSystem) {}

    async findEntryPoint(startPath: string): Promise<string | null> {
        let currentDir = this.fs.dirname(startPath);

        for (let i = 0; i < this.MAX_DEPTH; i++) {
            const candidate = this.fs.join(currentDir, this.ENTRY_FILENAME);
            
            if (await this.fs.exists(candidate)) {
                return candidate;
            }

            const parent = this.fs.dirname(currentDir);
            if (parent === currentDir) {
                break;
            } 
            currentDir = parent;
        }

        return null;
    }
}