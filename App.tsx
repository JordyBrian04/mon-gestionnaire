import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';
import AppContainer from './src/components/app-container';
import * as GestureHandle from 'react-native-gesture-handler';
import { initDatabase } from './src/components/database';
import { useEffect } from 'react';
import Notification from './src/services/notifications';
import * as Calendar from 'expo-calendar';

const db = initDatabase()

export default function App() {

  useEffect(() => {

    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        // console.log('Here are all your calendars:');
        // console.log({ calendars });
      }
    })();

    const migrations = [
      `
      CREATE TABLE IF NOT EXISTS param (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        code VARCHAR(10)
      )`,

      `
        ALTER TABLE param ADD nom VARCHAR(100)
      `,
    
      `
      CREATE TABLE IF NOT EXISTS agenda (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        dates DATE, 
        heure TIME, 
        titre VARCHAR(200),
        calendarId VARCHAR(255) DEFAULT NULL
      )
      `,

      `
      ALTER TABLE agenda ADD calendarId VARCHAR(255) DEFAULT NULL
    `,
    
      `CREATE TABLE IF NOT EXISTS transactions (
        transaction_id INTEGER PRIMARY KEY AUTOINCREMENT, 
        type_transaction varchar(20) NOT NULL,
        description varchar(255) NOT NULL,
        dates date NOT NULL,
        montant INTEGER NOT NULL,
        type_depense varchar(25) DEFAULT NULL
      );`,
    
      `CREATE TABLE IF NOT EXISTS caisse (
        caisse_id INTEGER PRIMARY KEY AUTOINCREMENT, 
        description varchar(255) NOT NULL,
        dates date NOT NULL,
        montant INTEGER NOT NULL
        );`,

      `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        title VARCHAR(200), 
        content LONGTEXT, 
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        epingle INTEGER DEFAULT 0
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
        // tx.executeSql(
        //   `SELECT * FROM sqlite_master WHERE type='table' AND name='agenda';`,
        //   [],
        //   (_, { rows: { _array } }) => {
        //     console.log(_array)
        //   }
        //   // (_, { rows: { _array } }) => {
        //   //   console.log(_array)
        //   // }
        // );
      });
    }

    executeMigrations();
  }, [])

  
  return (
    <>
      <AppContainer/>
      {/* <Notification/> */}
    </>
  );
}
