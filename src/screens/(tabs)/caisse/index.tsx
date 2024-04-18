import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
  BackHandler
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { AntDesign, FontAwesome5 } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { initDatabase } from '../../../components/database'
import { useRoute } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { getNom } from '../../../services/AsyncStorage'

const db = initDatabase()

const Caisse = () => {
  const [showModal, setShowModal] = useState(false)
  const [date, setDate] = useState(new Date())
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [solde, setSolde] = useState(0)
  const [data, setData] = useState<any[]>([])
  const [username, setUsername] = useState("")
  const route = useRoute()

  const [caisseData, setCaisseData] = useState({
    description: '',
    dates: '',
    montant: '',
  })

  const options: any = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  // console.log(date.toLocaleDateString('fr-FR', options))

  const getData = async () => {
    await db.transaction(tx => {
      tx.executeSql(
        `SELECT SUM(montant) AS solde FROM caisse;`,
        [],
        (_, result) => {
          //console.log(result.rows._array);
          setSolde(
            result.rows._array[0].solde === null
              ? 0
              : result.rows._array[0].solde
          )
        },
        (_, error) => {
          console.error('Error query on caisse table:', error)
          return false // Retourne false en cas d'erreur
        }
      );
      tx.executeSql(
        `SELECT * FROM caisse ORDER BY dates DESC;`,
        [],
        (_, result) => {
          //console.log(result.rows._array);
          setData(
            result.rows._array
          )
        },
        (_, error) => {
          console.error('Error query get data on caisse table:', error)
          return false // Retourne false en cas d'erreur
        }
      );
    })
  }

  useEffect(() => {
    getNom()
    .then((res) => {
      setUsername(res)
    })

    getData()
    //console.log(labels)
  }, [])



  // useEffect(() => {
  //   if(route.name === 'Caisse'){

  //     const backAction = () => {
  //       BackHandler.exitApp();
  //       return true;
  //     };
    
  //     const backHandler = BackHandler.addEventListener(
  //       'hardwareBackPress',
  //       backAction
  //     );
    
  //     return () => backHandler.remove();
      
  //   }
  // }, []);

  const toggleDatePicker = () => {
    setOpen(!open)
  }

  const onChange = ({ type }: any, selectedDate: any) => {
    if (type === 'set') {
      const currentDate = selectedDate
      setDate(currentDate)

      if (Platform.OS === 'android') {
        toggleDatePicker()

        //On attribu la date à la valeur date (currentDate.toLocaleDateString('fr-FR'))
        setCaisseData({...caisseData, dates: currentDate.toISOString().substring(0, 10)})
        // setTache({
        //   ...tache,
        //   date: currentDate.toLocaleDateString('fr-FR', options)
        // })
      }
    } else {
      toggleDatePicker()
    }
  }

  const confirmIOSDate = () => {
    setCaisseData({...caisseData, dates: date.toISOString().substring(0, 10)})
    toggleDatePicker()
  }

  const handleAddCaisse = async () => {
    if(caisseData.dates !== "" && caisseData.description !== "" && caisseData.montant !==""){
      setLoading(true)
      try {
        await db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO caisse(description, dates, montant) VALUES (?,?,?);',
            [
              caisseData.description,
              caisseData.dates,
              parseInt(caisseData.montant)
            ],
            (_, result) => {
              if (result.rowsAffected >= 1) {
                getData()
                setShowModal(false)
                setCaisseData({
                  description: '',
                  dates: '',
                  montant: '',
                })
                setLoading(false)
              }
            },
            (_, error) => {
              setLoading(false)
              console.log('Error inserting data:', error)
              return false
            }
          )
        })
      } catch (error) {
        console.error(error)
      }

    }else{
      Alert.alert("Alert","Veuillez remplir tous les champs")
    }
  }

  function renderModal() {
    return (
      <Modal visible={showModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View className="flex-1 bg-black/10 items-center justify-center">
            <View className="bg-white w-[99%] z-20 p-3 absolute bottom-0 rounded-t-2xl">
              <Text className="font-bold text-center text-lg">
                Epargner
              </Text>

              <View className="mt-4">

                <View className='mb-2'>
                    {open && (
                      <DateTimePicker
                        mode="date"
                        display="spinner"
                        value={date}
                        onChange={onChange}
                        style={{height: 120, marginTop: 20, width: '100%'}}
                        textColor='#000'
                      />
                    )}

                    {open && Platform.OS === 'ios' && (
                      <View className='flex-row justify-around mb-3'>

                        <TouchableOpacity className='p-3 bg-gray-200 rounded-full'
                          onPress={toggleDatePicker}
                        >
                          <Text className='text-red-500 font-extrabold'>Annuler</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className='p-3 bg-gray-200 rounded-full' 
                          onPress={confirmIOSDate}
                        >
                          <Text className='text-green-500 font-extrabold'>Valider</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {!open && (
                      <TouchableOpacity onPress={toggleDatePicker}>
                        <TextInput
                          placeholder="Date"
                          placeholderTextColor='#000'
                          className="border border-gray-300 p-3 rounded text-black"
                          editable={false}
                          value={caisseData.dates}
                          onChangeText={e => setCaisseData({...caisseData, dates: e})} 
                          onPressIn={toggleDatePicker}
                        />
                      </TouchableOpacity>
                    )}
                </View>
                
                <TextInput
                  placeholder="Description"
                  placeholderTextColor='#000'
                  className="border border-gray-300 p-3 rounded mb-2 text-black"
                  value={caisseData.description}
                  onChangeText={e => setCaisseData({...caisseData, description: e})} 
                />

                <TextInput
                  placeholder="Montant"
                  placeholderTextColor='#000'
                  className="border border-gray-300 p-3 rounded mb-2"
                  keyboardType='numeric'
                  value={caisseData.montant}
                  onChangeText={e => setCaisseData({...caisseData, montant: e})} 
                />

                <TouchableOpacity
                  className="mt-4 mb-1 p-3 bg-black rounded-3xl"
                  onPress={handleAddCaisse}
                >
                  <Text className="text-white text-center font-bold text-[16px]">
                    {loading ? <ActivityIndicator /> : 'Ajouter'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }

  return (
    <View className='flex-1 bg-slate-100 items-center'>
      <StatusBar style='auto' />
      <View className='w-full bg-blue-400 p-2 items-center justify-center h-[130] ' style={{borderBottomLeftRadius: 70, borderBottomRightRadius: 70}}>
        <Text className='text-white font-bold text-3xl'>{solde.toLocaleString('fr-FR')} FCFA</Text>
        <Text className='text-white text-xl font-light'>Montant</Text>
      </View>

      <View className='items-center justify-center m-2'>
        <View className='bg-white p-3 rounded-xl w-[300px] shadow-xl'>

          <View className='items-end justify-end flex-row'>
            <AntDesign name='bank' size={24} color="blue" />
            <Text className='text-blue-500 font-bold text-2xl ml-2'>Caisse</Text>
          </View>

          <View className='items-start justify-center'>
            <Text className='text-black text-3xl font-extrabold mt-4 ml-2'>.... .... .... {new Date().getFullYear()}</Text>
            <Text className='text-black text-2xl font-bold mt-2 mb-2 ml-2'>{username}</Text>
          </View>

        </View>
      </View>

      <TouchableOpacity 
        className='bg-blue-400 p-2 flex-row items-center justify-center w-48 mb-2 rounded-3xl'
        onPress={() => setShowModal(true)}
      >
        <FontAwesome5 name="piggy-bank" size={20} color="white" />
        <Text className='text-white ml-2'>Ajouter</Text>
      </TouchableOpacity>

      <ScrollView className='p-3 bg-white rounded-t-3xl w-full h-full'>
        <Text className='ml-3 font-bold text-[16px]'>Liste de transactions</Text>

        <View className='mt-3 mb-2'>

          {data.map((items, index) => {
            const dat:Date = new Date(items.dates)
            //console.log(dat.toLocaleDateString('fr-FR', options))
            return (
              <View key={index} className='flex-row rounded-2xl p-2 bg-slate-200 justify-between mb-2'>

                <View>
                  <Text className='font-bold text-[15px]'>{items.description}</Text>
                  <Text className='text-[15px] text-gray-600'>{dat.toLocaleDateString('fr-FR', options)}</Text>
                </View>
    
                <Text className='font-bold'>{items.montant.toLocaleString('fr-FR')} FCFA</Text>
  
              </View>
            )
          })}
        </View>
      </ScrollView>
      {renderModal()}
    </View>
  )
}

export default Caisse