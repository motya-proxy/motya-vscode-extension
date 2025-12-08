import { IFileSystem, IValidator, ValidationError } from './interfaces';
import { ConfigLocator } from './config-locator';

export class ValidationService {
    private locator: ConfigLocator;

    constructor(
        private fs: IFileSystem,
        private validator: IValidator
    ) {
        this.locator = new ConfigLocator(fs);
    }

    async validateFile(changedFilePath: string): Promise<ValidationError | null> {
        
        const entryPoint = await this.locator.findEntryPoint(changedFilePath);
        
        if (!entryPoint) {
            return null;
        }

        const rootDir = this.fs.dirname(entryPoint);

        
        const filePaths = await this.fs.findKdlFiles(rootDir);
        const snapshot: Record<string, string> = {};

        await Promise.all(filePaths.map(async (p) => {
            snapshot[p] = await this.fs.readFileContent(p);
        }));
        
        const error = await this.validator.validate(entryPoint, snapshot);

        return error;
    }

}