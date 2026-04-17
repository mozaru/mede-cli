import type Database from 'better-sqlite3';

export interface IDbConnectionFactory {
  createConnection(): Database.Database;
}
