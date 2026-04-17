import fs from "node:fs";
import path from "node:path";

import type { IFileSystemRepository } from "./interfaces/file-system-repository-interface.js";
import type { ListFilesOptionsEntity } from "../entities/list-files-options-entity.js";
import type { ReplaceTextOptionsEntity } from "../entities/replace-text-options-entity.js";
import type { InsertTextOptionsEntity } from "../entities/insert-text-options-entity.js";
import type { RemoveTextOptionsEntity } from "../entities/remove-text-options-entity.js";

export class FileSystemRepository implements IFileSystemRepository
{
    public exists(targetPath: string): boolean
    {
        return fs.existsSync(targetPath);
    }

    public isFile(targetPath: string): boolean
    {
        if (!this.exists(targetPath))
        {
            return false;
        }

        return fs.statSync(targetPath).isFile();
    }

    public isDirectory(targetPath: string): boolean
    {
        if (!this.exists(targetPath))
        {
            return false;
        }

        return fs.statSync(targetPath).isDirectory();
    }

    public ensureDirectory(targetPath: string): void
    {
        fs.mkdirSync(targetPath, { recursive: true });
    }

    public ensureFile(targetPath: string): void
    {
        const directoryPath = path.dirname(targetPath);
        this.ensureDirectory(directoryPath);

        if (!this.exists(targetPath))
        {
            fs.writeFileSync(targetPath, "", "utf-8");
        }
    }

    public listFiles(targetPath: string, options: ListFilesOptionsEntity): string[]
    {
        if (!this.exists(targetPath))
        {
            return [];
        }

        if (this.isFile(targetPath))
        {
            if (this.matchesExtensions(targetPath, options.extensions))
            {
                return [targetPath];
            }

            return [];
        }

        const results: string[] = [];
        const entries = fs.readdirSync(targetPath, { withFileTypes: true });

        for (const entry of entries)
        {
            const fullPath = path.join(targetPath, entry.name);

            if (entry.isFile())
            {
                if (this.matchesExtensions(fullPath, options.extensions))
                {
                    results.push(fullPath);
                }
            }
            else if (entry.isDirectory() && options.recursive)
            {
                const subFiles = this.listFiles(fullPath, options);
                for (const subFile of subFiles)
                {
                    results.push(subFile);
                }
            }
        }

        return results;
    }

    public readFile(targetPath: string): string
    {
        this.assertFileExists(targetPath);
        return fs.readFileSync(targetPath, "utf-8");
    }

    public readJsonFile(targetPath: string): unknown
    {
        const content = this.readFile(targetPath);

        try
        {
            return JSON.parse(content);
        }
        catch
        {
            throw new Error(`Invalid JSON file: ${targetPath}`);
        }
    }

    public writeFile(targetPath: string, content: string): void
    {
        const directoryPath = path.dirname(targetPath);
        this.ensureDirectory(directoryPath);
        fs.writeFileSync(targetPath, content, "utf-8");
    }

    public writeJsonFile(targetPath: string, content: unknown): void
    {
        const jsonText = JSON.stringify(content, null, 2);
        this.writeFile(targetPath, jsonText);
    }

    public createFile(targetPath: string, content: string, overwrite: boolean): void
    {
        const directoryPath = path.dirname(targetPath);
        this.ensureDirectory(directoryPath);

        if (this.exists(targetPath) && !overwrite)
        {
            throw new Error(`File already exists: ${targetPath}`);
        }

        fs.writeFileSync(targetPath, content, "utf-8");
    }

    public deleteFile(targetPath: string): void
    {
        if (!this.exists(targetPath))
        {
            return;
        }

        if (!this.isFile(targetPath))
        {
            throw new Error(`Path is not a file: ${targetPath}`);
        }

        fs.unlinkSync(targetPath);
    }

    public moveFile(sourcePath: string, targetPath: string): void
    {
        this.assertFileExists(sourcePath);

        const directoryPath = path.dirname(targetPath);
        this.ensureDirectory(directoryPath);

        fs.renameSync(sourcePath, targetPath);
    }

    public renameFile(sourcePath: string, newFileName: string): string
    {
        this.assertFileExists(sourcePath);

        const targetPath = path.join(path.dirname(sourcePath), newFileName);
        fs.renameSync(sourcePath, targetPath);

        return targetPath;
    }

    public renameDirectory(sourcePath: string, newFileName: string): string
    {
        if (!this.exists(sourcePath))
        {
            throw new Error(`Directory not found: ${sourcePath}`);
        }

        if (!this.isDirectory(sourcePath))
        {
            throw new Error(`Path is not a directory: ${sourcePath}`);
        }

        const targetPath = path.join(path.dirname(sourcePath), newFileName);
        fs.renameSync(sourcePath, targetPath);

        return targetPath;
    }

    public replaceText(targetPath: string, options: ReplaceTextOptionsEntity): void
    {
        const content = this.readFile(targetPath);

        if (options.all)
        {
            const escapedSearch = this.escapeRegExp(options.searchValue);
            const regex = new RegExp(escapedSearch, "g");
            const updatedContent = content.replace(regex, options.replaceValue);
            this.writeFile(targetPath, updatedContent);
            return;
        }

        const updatedContent = content.replace(options.searchValue, options.replaceValue);
        this.writeFile(targetPath, updatedContent);
    }

    public insertText(targetPath: string, options: InsertTextOptionsEntity): void
    {
        const content = this.readFile(targetPath);

        if (options.createAnchorText.trim() === "")
        {
            let updatedContent = content;

            if (options.position === "start")
            {
                updatedContent = options.textToInsert + content;
            }
            else
            {
                updatedContent = content + options.textToInsert;
            }

            this.writeFile(targetPath, updatedContent);
            return;
        }

        const anchorIndex = content.indexOf(options.createAnchorText);

        if (anchorIndex < 0)
        {
            throw new Error(`Anchor text not found in file: ${targetPath}`);
        }

        let insertionIndex = anchorIndex;

        if (options.position === "after")
        {
            insertionIndex = anchorIndex + options.createAnchorText.length;
        }

        const updatedContent =
            content.slice(0, insertionIndex) +
            options.textToInsert +
            content.slice(insertionIndex);

        this.writeFile(targetPath, updatedContent);
    }

    public removeText(targetPath: string, options: RemoveTextOptionsEntity): void
    {
        const content = this.readFile(targetPath);

        const startIndex = content.indexOf(options.startMarker);
        if (startIndex < 0)
        {
            throw new Error(`Start marker not found in file: ${targetPath}`);
        }

        const endSearchStart = startIndex + options.startMarker.length;
        const endIndex = content.indexOf(options.endMarker, endSearchStart);
        if (endIndex < 0)
        {
            throw new Error(`End marker not found in file: ${targetPath}`);
        }

        const removeStart = options.includeMarkers
            ? startIndex
            : startIndex + options.startMarker.length;

        const removeEnd = options.includeMarkers
            ? endIndex + options.endMarker.length
            : endIndex;

        const updatedContent =
            content.slice(0, removeStart) +
            content.slice(removeEnd);

        this.writeFile(targetPath, updatedContent);
    }

    public combinePath(...parts: string[]): string
    {
        return path.join(...parts);
    }

    public basename(filePath:string): string
    {
        return path.basename(filePath);
    }
    
    public dirname(filePath:string): string
    {
        return path.dirname(filePath);
    }

    private matchesExtensions(filePath: string, extensions: string[]): boolean
    {
        if (extensions.length === 0)
        {
            return true;
        }

        const currentExtension = path.extname(filePath).toLowerCase();

        for (const extension of extensions)
        {
            const normalizedExtension = extension.startsWith(".")
                ? extension.toLowerCase()
                : `.${extension.toLowerCase()}`;

            if (currentExtension === normalizedExtension)
            {
                return true;
            }
        }

        return false;
    }

    private assertFileExists(targetPath: string): void
    {
        if (!this.exists(targetPath))
        {
            throw new Error(`File not found: ${targetPath}`);
        }

        if (!this.isFile(targetPath))
        {
            throw new Error(`Path is not a file: ${targetPath}`);
        }
    }

    private escapeRegExp(value: string): string
    {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}