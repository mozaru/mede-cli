import type Database from 'better-sqlite3';

export interface IUnitOfWork extends Disposable {
  readonly connection: Database.Database;
  readonly isTransactional: boolean;
  readonly hasActiveTransaction: boolean;

  requireTransaction(): void;
  ensureConnection(): void;
  ensureTransactionForWrite(): void;
  commit(): void;
  rollback(): void;
  [Symbol.dispose](): void;
}