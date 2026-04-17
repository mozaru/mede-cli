import type { ListFilesOptionsEntity } from "../../entities/list-files-options-entity.js";
import type { ReplaceTextOptionsEntity } from "../../entities/replace-text-options-entity.js";
import type { InsertTextOptionsEntity } from "../../entities/insert-text-options-entity.js";
import type { RemoveTextOptionsEntity } from "../../entities/remove-text-options-entity.js";

export interface IFileSystemRepository
{
    exists(path: string): boolean;
    isFile(path: string): boolean;
    isDirectory(path: string): boolean;

    ensureDirectory(path: string): void;
    ensureFile(path: string): void;
    listFiles(path: string, options: ListFilesOptionsEntity): string[];

    readFile(path: string): string;
    readJsonFile(path: string): unknown;
    writeFile(path: string, content: string): void;
    writeJsonFile(path: string, content: unknown): void;
    createFile(path: string, content: string, overwrite: boolean): void;
    deleteFile(path: string): void;

    moveFile(sourcePath: string, targetPath: string): void;
    renameFile(sourcePath: string, newFileName: string): string;
    renameDirectory(sourcePath: string, newFileName: string): string;

    replaceText(path: string, options: ReplaceTextOptionsEntity): void;
    insertText(path: string, options: InsertTextOptionsEntity): void;
    removeText(path: string, options: RemoveTextOptionsEntity): void;

    combinePath(...parts: string[]): string;
    basename(path:string): string;
    dirname(path:string): string;
}
