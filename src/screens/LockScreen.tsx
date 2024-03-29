import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { initDatabase } from '../components/database';

// const db = SQLite.openDatabase(
//   {
//     name: 'gestionnaire.db',
//     location: 'default',
//     createFromLocation: 'default'
//   },
//   () => { },
//   error => console.log( error )
// );
const db = initDatabase()

const LockScreen = ({navigation}:any) => {

    const [code, setCode] = useState<any[]>([]);
    const [userNbr, setuserNbr] = useState(0)
    const [pass, setPass] = useState("")

    const setPasscode = (codeSet: any) => {

      if(code.length < 8){
        setCode([...code, codeSet]);
      }

    }

    useEffect(() => {
      //console.log(code.length, pass.length)
      if (userNbr > 0 && code.length === pass.length) {
          handleValider()
      }
  }, [code]);

    const removeLastValue = () => {
        setCode(prevCode => prevCode.slice(0, -1));
    };


    useEffect(() => {
      //console.log("remove")
      const createTable = async () => {
        db.transaction(tx => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS param (id INTEGER PRIMARY KEY AUTOINCREMENT, code VARCHAR(10));',
            [],
            (_, result) => {
              console.log('Query result:', result.rows.length); // Log the row count
                tx.executeSql(
                  'SELECT * FROM param;',
                  [],
                  (_, results) => {
                    setuserNbr(results.rows.length)
                    console.log('Query result:', results.rows.length); // Log the row count
                    //console.log('Query result:', (results.rows._array[0].code.length)); // Log the row count
                    if(results.rows.length > 0) {

                      setPass(results.rows._array[0].code)
                    }
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
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS agenda (id INTEGER PRIMARY KEY AUTOINCREMENT, dates DATE, heure TIME, titre VARCHAR(200));',
            [],
            (_, result) => {
              console.log('agenda table created:', result)
            },
            (_, error) => {
              console.error('Error creating table:', error);
              return false; // Retourne false en cas d'erreur
            }
          )
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
        if(code.length > 0){
          if(userNbr === 0){
              //setLoading(true)
              db.transaction(tx => {
                tx.executeSql(
                  'INSERT INTO param (code) VALUES (?);',
                  [passcode],
                  (_, result) => {
                  //   storeUser(userInfo.username)
                  //   setLoading(false)
                    console.log(result)
                    setCode([])
                    navigation.navigate("Tabs")
                  },
                  (_, error) => {
                    console.log('Error inserting data:', error);
                    return false;
                  }
                );
              });
          }
          else if(userNbr >= 1){
              //setLoading(true)
              db.transaction(tx => {
                tx.executeSql(
                  'SELECT id FROM param WHERE code=?;',
                  [passcode],
                  (_, result) => {
                    console.log(result, passcode)
                    if(result.rows.length > 0){
                      // storeUser(userInfo.username)
                      // setLoading(false)
                      setCode([])
                      navigation.navigate("Tabs")
                    }else{
                      Alert.alert("Mot de passe incorrect", "Veuillez entrer le bon mot de passe")
                      setCode([])
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
        }else{
          Alert.alert("Informations non saisie","Veuillez saisir un code")
        }

    }



  return (
    <SafeAreaView className='flex-1 pt-7 pr-4 pl-4 bg-gray-800 items-center justify-center'>
      <Text className='color-white text-xl font-bold'>
        {userNbr === 0 ? 'Créez un nouveau mot de passe' : 'Entrez votre code'}
      </Text>

      <View className='flex-row justify-between items-center mt-6 w-[56%]'>
        {code.map((p:any, index) => {
            return (
                <View key={index} className='w-3 h-3 border border-white' style={{ borderRadius: 100, backgroundColor: p !== '' ? '#FFFFFF' : 'none' }}></View>
            )
        })}

        {/* <View className='w-3 h-3 border border-white' style={{ borderRadius: 100 }}></View>
        <View className='w-3 h-3 border border-white' style={{ borderRadius: 100 }}></View>
        <View className='w-3 h-3 border border-white' style={{ borderRadius: 100 }}></View>
        <View className='w-3 h-3 border border-white' style={{ borderRadius: 100 }}></View> */}
      </View>

      <View className='mt-14 flex-row flex-wrap items-center justify-center'>
        {nombre.sort(() => Math.random() - 0.5).map(n => {
              // Fonction de comparaison aléatoire pour le mélange

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