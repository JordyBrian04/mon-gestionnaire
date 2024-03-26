import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('gestionnaire.db');

const LockScreen = ({navigation}:any) => {

    const [code, setCode] = useState<any[]>([]);

    const passcode = ['', '', '', ''];

    const setPasscode = (codeSet: any) => {
        //console.log(codeSet)
        if(code.length < 8){
            setCode([...code, codeSet]);
        }
    }

    const removeLastValue = () => {
        setCode(prevCode => prevCode.slice(0, -1));
    };

    const [userNbr, setuserNbr] = useState(0)

    useEffect(() => {
      const createTable = async () => {
        await db.transaction(tx => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS params (id INTEGER PRIMARY KEY AUTOINCREMENT, code VARCHAR(10));',
            [],
            (_, result) => {
                tx.executeSql(
                  'SELECT * FROM params;',
                  [],
                  (_, results) => {
                    setuserNbr(results.rows.length)
                    console.log('Query result:', results.rows.length); // Log the row count
                  },
                  (_, error) => {
                    console.error('Error querying data:', error);
                    return false
                  }
                );
            },
            (_, error) => {
              console.error('Error creating table:', error);
              return false; // Retourne false en cas d'erreur
            }
          );
        });
      }
  
      createTable()
    }, [])

    const nombre = Array.from({ length: 10 }, (_, index) => ({
        key: index,
        value: index,
    }));

    const handleValider = () =>{
        const passcode = code.join('')
        if(userNbr == 0){
            //setLoading(true)
            db.transaction(tx => {
              tx.executeSql(
                'INSERT INTO params (code) VALUES (?);',
                [passcode],
                (_, result) => {
                //   storeUser(userInfo.username)
                //   setLoading(false)
                  navigation.navigate("Tabs")
                },
                (_, error) => {
                  console.error('Error inserting data:', error);
                  return false;
                }
              );
            });
          }else if(userNbr >= 1){
            //setLoading(true)
            db.transaction(tx => {
              tx.executeSql(
                'SELECT id FROM params WHERE code=?;',
                [passcode],
                (_, result) => {
                  if(result.rows.length > 0){
                    // storeUser(userInfo.username)
                    // setLoading(false)
                    navigation.navigate("Tabs")
                  }else{
                    Alert.alert("Mot de passe incorrect")
                    //setLoading(false)
                  }
                },
                (_, error) => {
                  console.error('Error inserting data:', error);
                  return false;
                }
              );
            });
          }
    }

    // Fonction de comparaison aléatoire pour le mélange
    const randomCompare = () => Math.random() - 0.5;

    // Mélange aléatoire du tableau nombre
    const shuffledNombre = [...nombre].sort(randomCompare);

  return (
    <SafeAreaView className='flex-1 pt-7 pr-4 pl-4 bg-gray-800 items-center justify-center'>
      <Text className='color-white text-xl font-bold'>
        {userNbr === 0 ? 'Créez un nouveau mot de passe' : 'Entrez votre code'}
      </Text>

      <View className='flex-row justify-between items-center mt-6 w-[56%]'>
        {code.map((p:any) => {
            return (
                <View key={p} className='w-3 h-3 border border-white' style={{ borderRadius: 100, backgroundColor: p !== '' ? '#FFFFFF' : 'none' }}></View>
            )
        })}
        {/* <View className='w-3 h-3 border border-white' style={{ borderRadius: 100 }}></View>
        <View className='w-3 h-3 border border-white' style={{ borderRadius: 100 }}></View>
        <View className='w-3 h-3 border border-white' style={{ borderRadius: 100 }}></View>
        <View className='w-3 h-3 border border-white' style={{ borderRadius: 100 }}></View> */}
      </View>

      <View className='mt-14 flex-row flex-wrap items-center justify-center'>
        {shuffledNombre.map(n => {
            return (
                <TouchableOpacity key={n.key} className='bg-slate-200/30 w-16 h-16 items-center justify-center rounded-full m-3' onPress={() => setPasscode(n.value)}>
                    <Text className='text-white text-2xl font-bold'>{n.value}</Text>
                </TouchableOpacity>
            )
        })}
        {/* <TouchableOpacity className='bg-slate-200/30 w-16 h-16 items-center justify-center rounded-full m-3'>
            <Text className='text-white text-2xl font-bold'>1</Text>
        </TouchableOpacity>
        <TouchableOpacity className='bg-slate-200/30 w-16 h-16 items-center justify-center rounded-full m-3'>
            <Text className='text-white text-2xl font-bold'>2</Text>
        </TouchableOpacity>
        <TouchableOpacity className='bg-slate-200/30 w-16 h-16 items-center justify-center rounded-full m-3'>
            <Text className='text-white text-2xl font-bold'>3</Text>
        </TouchableOpacity>
        <TouchableOpacity className='bg-slate-200/30 w-16 h-16 items-center justify-center rounded-full m-3'>
            <Text className='text-white text-2xl font-bold'>4</Text>
        </TouchableOpacity>
        <TouchableOpacity className='bg-slate-200/30 w-16 h-16 items-center justify-center rounded-full m-3'>
            <Text className='text-white text-2xl font-bold'>5</Text>
        </TouchableOpacity>
        <TouchableOpacity className='bg-slate-200/30 w-16 h-16 items-center justify-center rounded-full m-3'>
            <Text className='text-white text-2xl font-bold'>6</Text>
        </TouchableOpacity>
        <TouchableOpacity className='bg-slate-200/30 w-16 h-16 items-center justify-center rounded-full m-3'>
            <Text className='text-white text-2xl font-bold'>7</Text>
        </TouchableOpacity>
        <TouchableOpacity className='bg-slate-200/30 w-16 h-16 items-center justify-center rounded-full m-3'>
            <Text className='text-white text-2xl font-bold'>8</Text>
        </TouchableOpacity>
        <TouchableOpacity className='bg-slate-200/30 w-16 h-16 items-center justify-center rounded-full m-3'>
            <Text className='text-white text-2xl font-bold'>9</Text>
        </TouchableOpacity>
        <TouchableOpacity className='bg-slate-200/30 w-16 h-16 items-center justify-center rounded-full m-3'>
            <Text className='text-white text-2xl font-bold'>0</Text>
        </TouchableOpacity> */}
      </View>

      <View className='mt-4 flex-row justify-between items-center w-full'>

        <TouchableOpacity onPress={handleValider}>
            <Text className='text-white font-semibold text-[15px]'>
                {userNbr === 0 ? 'Valider' : 'Réinitialiser le mot de passe'}
            </Text>
        </TouchableOpacity>

        <TouchableOpacity>
            <Text className='text-white font-semibold text-[15px]' onPress={removeLastValue}>Effacer</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  ) 
}

export default LockScreen