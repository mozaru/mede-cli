import fs from "node:fs";
import path from "node:path";

import type { IFileSystemRepository } from "../../domain/interfaces/repositories/file-system-repository-interface.js";
import type { ListFilesOptionsEntity } from "../../domain/entities/list-files-options-entity.js";
import type { ReplaceTextOptionsEntity } from "../../domain/entities/replace-text-options-entity.js";
import type { InsertTextOptionsEntity } from "../../domain/entities/insert-text-options-entity.js";
import type { RemoveTextOptionsEntity } from "../../domain/entities/remove-text-options-entity.js";
import { assertNoNullByte, assertPathWithin } from "../../shared/path-safety.js";
import { I18n } from "../../shared/i18n.js";

export class FileSystemRepository implements IFileSystemRepository {
  // When non-empty, every mutating operation (write/create/delete/move/rename)
  // must target a path contained in one of these roots. Empty by default so
  // existing callers keep their behavior; the composition root can opt in by
  // passing the project root to confine document writes.
  private readonly allowedRoots: string[];

  constructor(allowedRoots: string[] = []) {
    this.allowedRoots = allowedRoots.map((root) => path.resolve(root));
  }

  // Rejects NUL bytes always, and (when roots are configured) any target that
  // escapes the allowed tree. Used to guard writes, not reads.
  private guardWritePath(targetPath: string): void {
    assertNoNullByte(targetPath);

    if (this.allowedRoots.length === 0) {
      return;
    }

    const escapesAll = this.allowedRoots.every((root) => {
      try {
        assertPathWithin(root, targetPath, "write path");
        return false;
      } catch {
        return true;
      }
    });

    if (escapesAll) {
      throw new Error(
        I18n.t('Unsafe write path: "{0}" is outside the allowed project directory.', targetPath),
      );
    }
  }
  public exists(targetPath: string): boolean {
    return fs.existsSync(path.normalize(targetPath));
  }

  public isFile(targetPath: string): boolean {
    const normalized = path.normalize(targetPath);
    if (!this.exists(normalized)) {
      return false;
    }

    return fs.statSync(normalized).isFile();
  }

  public isDirectory(targetPath: string): boolean {
    const normalized = path.normalize(targetPath);
    if (!this.exists(normalized)) {
      return false;
    }

    return fs.statSync(normalized).isDirectory();
  }

  public ensureDirectory(targetPath: string): void {
    fs.mkdirSync(path.normalize(targetPath), { recursive: true });
  }

  public ensureFile(targetPath: string): void {
    const normalized = path.normalize(targetPath);
    this.guardWritePath(normalized);
    const directoryPath = path.dirname(normalized);
    this.ensureDirectory(directoryPath);

    if (!this.exists(normalized)) {
      fs.writeFileSync(normalized, "", "utf-8");
    }
  }

  public listFiles(targetPath: string, options: ListFilesOptionsEntity): string[] {
    const normalized = path.normalize(targetPath);
    if (!this.exists(normalized)) {
      return [];
    }

    if (this.isFile(normalized)) {
      if (this.matchesExtensions(normalized, options.extensions)) {
        return [normalized];
      }

      return [];
    }

    const results: string[] = [];
    const entries = fs.readdirSync(normalized, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(normalized, entry.name);

      if (entry.isFile()) {
        if (this.matchesExtensions(fullPath, options.extensions)) {
          results.push(fullPath);
        }
      } else if (entry.isDirectory() && options.recursive) {
        const subFiles = this.listFiles(fullPath, options);
        for (const subFile of subFiles) {
          results.push(subFile);
        }
      }
    }

    return results;
  }

  public readFile(targetPath: string): string {
    const normalized = path.normalize(targetPath);
    this.assertFileExists(normalized);
    return fs.readFileSync(normalized, "utf-8");
  }

  public readJsonFile(targetPath: string): unknown {
    const normalized = path.normalize(targetPath);
    const content = this.readFile(normalized);

    try {
      return JSON.parse(content);
    } catch {
      throw new Error(I18n.t("Invalid JSON file: {0}", normalized));
    }
  }

  public writeFile(targetPath: string, content: string): void {
    const normalized = path.normalize(targetPath);
    this.guardWritePath(normalized);
    const directoryPath = path.dirname(normalized);
    this.ensureDirectory(directoryPath);
    fs.writeFileSync(normalized, content, "utf-8");
  }

  public writeJsonFile(targetPath: string, content: unknown): void {
    const normalized = path.normalize(targetPath);
    const jsonText = JSON.stringify(content, null, 2);
    this.writeFile(normalized, jsonText);
  }

  public createFile(targetPath: string, content: string, overwrite: boolean): void {
    const normalized = path.normalize(targetPath);
    this.guardWritePath(normalized);
    const directoryPath = path.dirname(normalized);
    this.ensureDirectory(directoryPath);

    if (this.exists(normalized) && !overwrite) {
      throw new Error(I18n.t("File already exists: {0}", normalized));
    }

    fs.writeFileSync(normalized, content, "utf-8");
  }

  public deleteFile(targetPath: string): void {
    const normalized = path.normalize(targetPath);
    this.guardWritePath(normalized);
    if (!this.exists(normalized)) {
      return;
    }

    if (!this.isFile(normalized)) {
      throw new Error(I18n.t("Path is not a file: {0}", normalized));
    }

    fs.unlinkSync(normalized);
  }

  public moveFile(sourcePath: string, targetPath: string): void {
    const normalizedSource = path.normalize(sourcePath);
    const normalizedTarget = path.normalize(targetPath);
    this.guardWritePath(normalizedSource);
    this.guardWritePath(normalizedTarget);
    this.assertFileExists(normalizedSource);

    const directoryPath = path.dirname(normalizedTarget);
    this.ensureDirectory(directoryPath);

    fs.renameSync(normalizedSource, normalizedTarget);
  }

  public renameFile(sourcePath: string, newFileName: string): string {
    const normalizedSource = path.normalize(sourcePath);
    this.assertFileExists(normalizedSource);

    const targetPath = path.join(path.dirname(normalizedSource), newFileName);
    this.guardWritePath(targetPath);
    fs.renameSync(normalizedSource, targetPath);

    return targetPath;
  }

  public renameDirectory(sourcePath: string, newFileName: string): string {
    const normalizedSource = path.normalize(sourcePath);
    if (!this.exists(normalizedSource)) {
      throw new Error(I18n.t("Directory not found: {0}", normalizedSource));
    }

    if (!this.isDirectory(normalizedSource)) {
      throw new Error(I18n.t("Path is not a directory: {0}", normalizedSource));
    }

    const targetPath = path.join(path.dirname(normalizedSource), newFileName);
    fs.renameSync(normalizedSource, targetPath);

    return targetPath;
  }

  public replaceText(targetPath: string, options: ReplaceTextOptionsEntity): void {
    const normalized = path.normalize(targetPath);
    const content = this.readFile(normalized);

    if (options.all) {
      const escapedSearch = this.escapeRegExp(options.searchValue);
      const regex = new RegExp(escapedSearch, "g");
      const updatedContent = content.replace(regex, options.replaceValue);
      this.writeFile(normalized, updatedContent);
      return;
    }

    const updatedContent = content.replace(options.searchValue, options.replaceValue);
    this.writeFile(normalized, updatedContent);
  }

  public insertText(targetPath: string, options: InsertTextOptionsEntity): void {
    const normalized = path.normalize(targetPath);
    const content = this.readFile(normalized);

    if (options.createAnchorText.trim() === "") {
      let updatedContent = content;

      if (options.position === "start") {
        updatedContent = options.textToInsert + content;
      } else {
        updatedContent = content + options.textToInsert;
      }

      this.writeFile(normalized, updatedContent);
      return;
    }

    const anchorIndex = content.indexOf(options.createAnchorText);

    if (anchorIndex < 0) {
      throw new Error(I18n.t("Anchor text not found in file: {0}", normalized));
    }

    let insertionIndex = anchorIndex;

    if (options.position === "after") {
      insertionIndex = anchorIndex + options.createAnchorText.length;
    }

    const updatedContent =
      content.slice(0, insertionIndex) + options.textToInsert + content.slice(insertionIndex);

    this.writeFile(normalized, updatedContent);
  }

  public removeText(targetPath: string, options: RemoveTextOptionsEntity): void {
    const normalized = path.normalize(targetPath);
    const content = this.readFile(normalized);

    const startIndex = content.indexOf(options.startMarker);
    if (startIndex < 0) {
      throw new Error(I18n.t("Start marker not found in file: {0}", normalized));
    }

    const endSearchStart = startIndex + options.startMarker.length;
    const endIndex = content.indexOf(options.endMarker, endSearchStart);
    if (endIndex < 0) {
      throw new Error(I18n.t("End marker not found in file: {0}", normalized));
    }

    const removeStart = options.includeMarkers
      ? startIndex
      : startIndex + options.startMarker.length;

    const removeEnd = options.includeMarkers ? endIndex + options.endMarker.length : endIndex;

    const updatedContent = content.slice(0, removeStart) + content.slice(removeEnd);

    this.writeFile(normalized, updatedContent);
  }

  public combinePath(...parts: string[]): string {
    return path.normalize(path.join(...parts));
  }

  public basename(filePath: string): string {
    return path.basename(path.normalize(filePath));
  }

  public dirname(filePath: string): string {
    return path.dirname(path.normalize(filePath));
  }

  private matchesExtensions(filePath: string, extensions: string[]): boolean {
    if (extensions.length === 0) {
      return true;
    }

    const currentExtension = path.extname(filePath).toLowerCase();

    for (const extension of extensions) {
      const normalizedExtension = extension.startsWith(".")
        ? extension.toLowerCase()
        : `.${extension.toLowerCase()}`;

      if (currentExtension === normalizedExtension) {
        return true;
      }
    }

    return false;
  }

  private assertFileExists(targetPath: string): void {
    if (!this.exists(targetPath)) {
      throw new Error(I18n.t("File not found: {0}", targetPath));
    }

    if (!this.isFile(targetPath)) {
      throw new Error(I18n.t("Path is not a file: {0}", targetPath));
    }
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
