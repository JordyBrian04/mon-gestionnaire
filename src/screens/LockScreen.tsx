import { View, Text, SafeAreaView, TouchableOpacity, Alert, Modal, TextInput, Platform, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { initDatabase } from '../components/database';
import { StatusBar } from 'expo-status-bar'
import { storeNom } from '../services/AsyncStorage';

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
    const [nombres, setNombres] = useState<any[]>([]);
    const [nom, setNom] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [nomInput, setNomInput] = useState("")
    

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

    const nombre = Array.from({ length: 10 }, (_, index) => ({
      key: index,
      value: index,
    }));


    useEffect(() => {
      //console.log("remove")
      const createTable = async () => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM param;',
            [],
            (_, results) => {
              setuserNbr(results.rows.length)
              console.log('Query result:', results.rows._array); // Log the row count
              //console.log('Query result:', (results.rows._array[0].nom === null ? "" : results.rows._array[0].nom)); // Log the row count
              if(results.rows.length > 0) {
                setPass(results.rows._array[0].code)
                setNom(results.rows._array[0].nom === null ? "" : results.rows._array[0].nom)

                if(results.rows._array[0].code !== null && results.rows._array[0].nom === null){
                  setShowModal(true)
                }
              }
            },
            (_, error) => {
              console.error('Error querying data:', error);
              return false
            }
          );

  
          // tx.executeSql(
          // `CREATE TABLE IF NOT EXISTS transactions (
          //   transaction_id INTEGER PRIMARY KEY AUTOINCREMENT, 
          //   type_transaction varchar(20) NOT NULL,
          //   description varchar(255) NOT NULL,
          //   dates date NOT NULL,
          //   montant INTEGER NOT NULL,
          //   type_depense varchar(25) DEFAULT NULL
          //   );`,
          //   [],
          //   (_, result) => {
          //     console.log('transactions table created:', result)
          //   },
          //   (_, error) => {
          //     console.error('Error creating transaction table:', error);
          //     return false; // Retourne false en cas d'erreur
          //   }
          // );
          // tx.executeSql(
          // `CREATE TABLE IF NOT EXISTS caisse (
          //   caisse_id INTEGER PRIMARY KEY AUTOINCREMENT, 
          //   description varchar(255) NOT NULL,
          //   dates date NOT NULL,
          //   montant INTEGER NOT NULL
          //   );`,
          //   [],
          //   (_, result) => {
          //     console.log('caisse table created:', result)
          //   },
          //   (_, error) => {
          //     console.error('Error creating caisse table:', error);
          //     return false; // Retourne false en cas d'erreur
          //   }
          // );
        });
      }

      setNombres(nombre.sort(() => Math.random() - 0.5))
  
      createTable()
    }, [])



    const handleValider = () =>{
        const passcode = code.join('')

        if(nom === "" && nomInput === ""){setShowModal(true); return}
        console.log('ok')

        if(code.length > 0){

          if(userNbr === 0 && nom === ""){
              //setLoading(true)
              db.transaction(tx => {
                tx.executeSql(
                  'INSERT INTO param (code, nom) VALUES (?, ?);',
                  [passcode, nomInput],
                  (_, result) => {
                  //   storeUser(userInfo.username)
                  //   setLoading(false)
                    console.log(result)
                    storeNom(nomInput)
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
                  'SELECT id, nom FROM param WHERE code=?;',
                  [passcode],
                  (_, result) => {
                    //console.log(result, passcode)
                    if(result.rows.length > 0){
                      storeNom(result.rows._array[0].nom)
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

    
    const handleValideNom = () => {
      //console.log(nomInput, nom)
      if(nom === "" && nomInput !== ""){
        db.transaction(tx => {
          tx.executeSql(
            'UPDATE param SET nom=?;',
            [nomInput],
            (_, result) => {
              console.log(result)
              if(result.rowsAffected > 0){
                storeNom(nomInput)
                setShowModal(false)
              }else{
                
                setNomInput("")
                //setLoading(false)
              }
            },
            (_, error) => {
              console.error('Error inserting data:', error);
              return false;
            }
          );
        });
      }else{
        Alert.alert("Informations non saisie","Veuillez saisir un nom")
      }
    }

    function renderModal () {
      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View className='bg-black/20 flex-1 items-center justify-center'>
            <View className='bg-white w-[90%] p-4 rounded-lg'>
              <Text>Entrez votre nom</Text>
              <TextInput
                className='bg-slate-100 border border-slate-200 rounded-lg p-3 mt-2'
                onChangeText={(text) => setNomInput(text)}
                value={nomInput}
              />

              <TouchableOpacity className='mt-3 p-3 items-center justify-center bg-gray-800 rounded-2xl' 
                onPress={() => [nom === "" && userNbr > 0 ? handleValideNom() : handleValider()]}>
                <Text className='text-white font-bold'>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )
    }



  return (
    <SafeAreaView className='flex-1 pt-7 pr-4 pl-4 bg-gray-800 items-center justify-center'>
      <StatusBar style='light' />
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

      <View className='mt-14 flex-row flex-wrap items-center justify-center' style={{width: Platform.OS === 'ios' ? '90%' : Dimensions.get('window').width}}>
        {nombres.map(n => {
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
      {renderModal()}
    </SafeAreaView>
  ) 
}

export default LockScreen