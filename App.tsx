import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import AppContainer from './src/components/app-container';
import * as GestureHandle from 'react-native-gesture-handler';
import { initDatabase } from './src/components/database';
import { useEffect } from 'react';

const db = initDatabase()

export default function App() {

  useEffect(() => {

    const migrations = [
      `
      CREATE TABLE IF NOT EXISTS param (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        code VARCHAR(10)
      )`,
    
      `
      CREATE TABLE IF NOT EXISTS agenda (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        dates DATE, heure TIME, titre VARCHAR(200)
      )
      `,
    
      `CREATE TABLE IF NOT EXISTS transactions (
        transaction_id INTEGER PRIMARY KEY AUTOINCREMENT, 
        type_transaction varchar(20) NOT NULL,
        description varchar(255) NOT NULL,
        dates date NOT NULL,
        montant INTEGER NOT NULL,
        type_depense varchar(25) DEFAULT NULL
      )`,
    
      `CREATE TABLE IF NOT EXISTS caisse (
        caisse_id INTEGER PRIMARY KEY AUTOINCREMENT, 
        description varchar(255) NOT NULL,
        dates date NOT NULL,
        montant INTEGER NOT NULL
        );`
      // Ajouter d'autres scripts de migration ici
    ];

    const executeMigrations = async () => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY NOT NULL);`
        );
        tx.executeSql(
          `SELECT name FROM sqlite_master WHERE type='table' AND name='migrations';`,
          [],
          (_, { rows: { _array } }) => {
            if (_array.length === 0) {
              // Table des migrations n'existe pas, donc nous devons exécuter toutes les migrations
              for (let i = 0; i < migrations.length; i++) {
                tx.executeSql(migrations[i]);
              }
              tx.executeSql(`INSERT INTO migrations (id) VALUES (1);`);
            } else {
              // Table des migrations existe, donc nous devons vérifier et exécuter les migrations manquantes
              tx.executeSql(`SELECT * FROM migrations;`, [], (_, { rows: { _array } }) => {
                const currentVersion = _array.length;
                for (let i = currentVersion; i < migrations.length; i++) {
                  tx.executeSql(migrations[i]);
                }
                tx.executeSql(`UPDATE migrations SET id = ${migrations.length};`);
              });
            }
          }
        );
      });
    }

    executeMigrations();
  }, [])
  return (
    <AppContainer/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
