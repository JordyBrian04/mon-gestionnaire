import * as SQLite from 'expo-sqlite';

let db: SQLite.WebSQLDatabase | undefined;

export const initDatabase = (): SQLite.WebSQLDatabase => {
  if (!db) {
    db = SQLite.openDatabase('mon_gestionnaire.db');
    //db = SQLite.openDatabase('test.db');
  }
  return db;
};
//const db = SQLite.openDatabase('mon_gestionnaire.db');
// 