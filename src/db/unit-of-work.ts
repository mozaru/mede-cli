import type Database from 'better-sqlite3';
import type { IDbConnectionFactory } from './db-connection-factory-interface.js';
import type { IUnitOfWork } from './unit-of-work-interface.js';

export class UnitOfWork implements IUnitOfWork {
  private readonly factory: IDbConnectionFactory;

  private _connection: Database.Database | null = null;
  private _isTransactional = false;
  private _hasActiveTransaction = false;

  public constructor(factory: IDbConnectionFactory) {
    this.factory = factory;
  }

  public get connection(): Database.Database {
    this.ensureConnection();
    return this._connection!;
  }

  public get isTransactional(): boolean {
    return this._isTransactional;
  }

  public get hasActiveTransaction(): boolean {
    return this._hasActiveTransaction;
  }

  public requireTransaction(): void {
    this._isTransactional = true;
  }

  public ensureConnection(): void {
    if (this._connection) {
      return;
    }

    this._connection = this.factory.createConnection();
  }

  public ensureTransactionForWrite(): void {
    this.ensureConnection();

    if (!this._isTransactional) {
      return;
    }

    if (this._hasActiveTransaction) {
      return;
    }

    this.connection.exec('BEGIN');
    this._hasActiveTransaction = true;
  }

  public commit(): void {
    if (this._hasActiveTransaction) {
      this.connection.exec('COMMIT');
    }

    this._hasActiveTransaction = false;
    this._isTransactional = false;
  }

  public rollback(): void {
    if (this._hasActiveTransaction) {
      try {
        this.connection.exec('ROLLBACK');
      } catch {}
    }

    this._hasActiveTransaction = false;
    this._isTransactional = false;
  }

  public [Symbol.dispose](): void {
    try {
      if (this._hasActiveTransaction) {
        this.connection.exec('ROLLBACK');
      }
    } catch {}

    try {
      this._connection?.close();
    } catch {}

    this._connection = null;
    this._hasActiveTransaction = false;
    this._isTransactional = false;
  }
}
