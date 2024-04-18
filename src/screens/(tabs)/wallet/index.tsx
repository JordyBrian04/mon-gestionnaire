import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
  BackHandler
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { LineChart } from 'react-native-chart-kit'
import DateTimePicker from '@react-native-community/datetimepicker'
import { SelectList } from 'react-native-dropdown-select-list'
import { initDatabase } from '../../../components/database'
import { useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar'

const db = initDatabase()

const Wallet = ({ navigation }: any) => {
  const [showModal, setShowModal] = useState(false)
  const [affichage, setAffichage] = useState('')
  const [date, setDate] = useState(new Date())
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [solde, setSolde] = useState(0)
  const [soldeDay, setSoldeDay] = useState(0)
  const [depense, setDepense] = useState(0)
  const [revenus, setRevenus] = useState(0)
  const [data, setData] = useState<any[]>([])
  const [labels, setLabels] = useState<any[]>([])
  const [soldeData, setSoldeData] = useState<any[]>([])
  const [transaction, setTransaction] = useState({
    type_transaction: '',
    description: '',
    dates: '',
    montant: '',
    type_depense: ''
  })
  const route = useRoute();

  //console.log(route.name)

  const toggleDatePicker = () => {
    setOpen(!open)
  }

  const getData = async () => {
    await db.transaction(tx => {
      tx.executeSql(
        `SELECT SUM(CASE WHEN type_transaction = 'Entrée' THEN montant ELSE 0 END) AS total_entrees, SUM(CASE WHEN type_transaction = 'Dépense' THEN montant ELSE 0 END) AS total_depenses, SUM(CASE WHEN type_transaction = 'Entrée' THEN montant ELSE -montant END) AS solde FROM transactions;`,
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
          console.error('Error creating table:', error)
          return false // Retourne false en cas d'erreur
        }
      )
      tx.executeSql(
        `SELECT SUM(CASE WHEN type_transaction = 'Entrée' THEN montant ELSE 0 END) AS total_entrees, SUM(CASE WHEN type_transaction = 'Dépense' THEN montant ELSE 0 END) AS total_depenses, SUM(CASE WHEN type_transaction = 'Entrée' THEN montant ELSE -montant END) AS solde FROM transactions WHERE dates=?;`,
        [date.toISOString().substring(0, 10)],
        (_, result) => {
          //console.log(result.rows._array);
          setDepense(
            result.rows._array[0].total_depenses === null
              ? 0
              : result.rows._array[0].total_depenses
          )
          setRevenus(
            result.rows._array[0].total_entrees === null
              ? 0
              : result.rows._array[0].total_entrees
          )
          setSoldeDay(
            result.rows._array[0].solde === null
              ? 0
              : result.rows._array[0].solde
          )
        },
        (_, error) => {
          console.error('Error query table:', error)
          return false // Retourne false en cas d'erreur
        }
      )
      tx.executeSql(
        'SELECT * FROM transactions WHERE dates=?;',
        [date.toISOString().substring(0, 10)],
        (_, result) => {
          //console.log(result.rows._array)
          setData(result.rows._array)
        },
        (_, error) => {
          console.error('Error creating table:', error)
          return false // Retourne false en cas d'erreur
        }
      )
      tx.executeSql(
        `SELECT 
          CASE SUBSTR(dates, 6, 2)
              WHEN '01' THEN 'Jan'
              WHEN '02' THEN 'Fév'
              WHEN '03' THEN 'Mar'
              WHEN '04' THEN 'Avr'
              WHEN '05' THEN 'Mai'
              WHEN '06' THEN 'Jui'
              WHEN '07' THEN 'Jul'
              WHEN '08' THEN 'Aoû'
              WHEN '09' THEN 'Sep'
              WHEN '10' THEN 'Oct'
              WHEN '11' THEN 'Nov'
              WHEN '12' THEN 'Déc'
          END AS Mois,
            SUM(CASE WHEN type_transaction = 'Entrée' THEN montant ELSE 0 END) AS total_entrees,
            SUM(CASE WHEN type_transaction = 'Dépense' THEN montant ELSE 0 END) AS total_depenses,
            SUM(CASE WHEN type_transaction = 'Entrée' THEN montant ELSE -montant END) AS solde
        FROM transactions
        GROUP BY SUBSTR(dates, 1, 7)
        ORDER BY SUBSTR(dates, 1, 7) ASC;`,
        [],
        (_, result) => {
          //console.log(result.rows._array)
          if (result.rows._array.length > 0) {
            setLabels(result.rows._array.map(item => item.Mois))
            setSoldeData(result.rows._array.map(item => item.solde))
          } else {
            console.log(
              'Aucune donnée à afficher, valeurs par défaut définies.'
            )
          }
        },
        (_, error) => {
          console.error('Error query on table transactions:', error)
          return false // Retourne false en cas d'erreur
        }
      )
    })
  }

  useEffect(() => {
    getData()
    //console.log(labels)
  }, [])

  // useEffect(() => {
  //   if(route.name === 'Wallet'){

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
  


  const onChange = ({ type }: any, selectedDate: any) => {
    if (type === 'set') {
      const currentDate = selectedDate
      setDate(currentDate)

      if (Platform.OS === 'android') {
        toggleDatePicker()

        //On attribu la date à la valeur date (currentDate.toLocaleDateString('fr-FR'))
        setTransaction({
          ...transaction,
          dates: currentDate.toISOString().substring(0, 10)
        })
        //console.log(currentDate.toISOString().substring(0, 10))
      }
    } else {
      toggleDatePicker()
    }
  }

  const TypeTransactionOptions = [
    { key: 1, value: 'Entrée' },
    { key: 2, value: 'Dépense' }
  ]

  const TypeDepense = [
    { key: 1, value: 'Nourriture' },
    { key: 2, value: 'Transport' },
    { key: 3, value: 'Autre' }
  ]

  const options: any = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  const confirmIOSDate = () => {
    setTransaction({
      ...transaction,
      dates: date.toISOString().substring(0, 10)
    })
    toggleDatePicker()
  }

  const handleAddTransaction = async () => {
    console.log(transaction)
    // await db.transaction(tx => {
    //   tx.executeSql(
    //     'DELETE FROM transactions;',
    //     [],
    //     (_, result) => {
    //       console.log(result)
    //       if (result.rowsAffected >= 1) {
    //         getData()
    //         setShowModal(false)
    //         setTransaction({
    //           type_transaction: '',
    //           description: '',
    //           dates: '',
    //           montant: '',
    //           type_depense: '',
    //         })
    //         setLoading(false)
    //       }
    //     },
    //     (_, error) => {
    //       setLoading(false)
    //       console.log('Error inserting data:', error)
    //       return false
    //     }
    //   );
    // })
    if (
      transaction.dates !== '' &&
      transaction.description !== '' &&
      transaction.montant !== '' &&
      transaction.type_transaction !== ''
    ) {
      if (transaction.type_transaction === 'Dépense') {
        if (transaction.type_depense === '') {
          Alert.alert('Information', 'Veuillez remplir tous les champs')
          return
        }
      }

      setLoading(true)
      await db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO transactions (type_transaction, description, dates, montant, type_depense) VALUES (?,?,?,?,?);',
          [
            transaction.type_transaction,
            transaction.description,
            transaction.dates,
            transaction.montant,
            transaction.type_depense
          ],
          (_, result) => {
            if (result.rowsAffected >= 1) {
              getData()
              setShowModal(false)
              setTransaction({
                type_transaction: '',
                description: '',
                dates: '',
                montant: '',
                type_depense: ''
              })
              setAffichage('')
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
    } else {
      Alert.alert('Information', 'Veuillez remplir tous les champs')
    }
  }

  function renderModal() {
    return (
      <Modal visible={showModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View className="flex-1 bg-black/10 items-center justify-center">
            <View className="bg-white w-[99%] z-20 p-3 absolute bottom-0 rounded-t-2xl">
              <Text className="font-bold text-center text-lg">
                Ajouter une transaction
              </Text>

              <View className="mt-4">
                <SelectList
                  setSelected={(val: any) => [
                    setAffichage(val),
                    setTransaction({ ...transaction, type_transaction: val })
                  ]}
                  data={TypeTransactionOptions}
                  defaultOption={{ key: affichage, value: affichage }}
                  save="value"
                  placeholder="Sélectionnez le type de transaction"
                />

                {affichage === 'Entrée' ? (
                  <View className="">
                    <View className="mt-2">
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
                            className="border border-gray-300 p-3 rounded"
                            editable={false}
                            //value={tache.date}
                            value={transaction.dates}
                            onChangeText={e =>
                              setTransaction({ ...transaction, dates: e })
                            }
                            onPressIn={toggleDatePicker}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    <TextInput
                      placeholder="Description"
                      placeholderTextColor='#000'
                      className="border border-gray-300 p-3 rounded mt-2"
                      value={transaction.description}
                      onChangeText={e =>
                        setTransaction({ ...transaction, description: e })
                      }
                    />

                    <TextInput
                      placeholder="Montant"
                      placeholderTextColor='#000'
                      className="border border-gray-300 p-3 rounded mt-2"
                      keyboardType="numeric"
                      value={transaction.montant}
                      onChangeText={e =>
                        setTransaction({ ...transaction, montant: e })
                      }
                    />
                  </View>
                ) : affichage === 'Dépense' ? (
                  <View>
                    <View className="mt-2 mb-2">
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
                            className="border border-gray-300 p-3 rounded"
                            editable={false}
                            value={transaction.dates}
                            onChangeText={e =>
                              setTransaction({ ...transaction, dates: e })
                            }
                            onPressIn={toggleDatePicker}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    <SelectList
                      setSelected={(val: any) => [
                        setTransaction({ ...transaction, type_depense: val })
                        //console.log(val)
                      ]}
                      data={TypeDepense}
                      //defaultOption={{ key: affichage, value: affichage }}
                      save="value"
                      placeholder="Sélectionnez le type de dépense"
                    />

                    <TextInput
                      placeholder="Description"
                      placeholderTextColor='#000'
                      className="border border-gray-300 p-3 rounded mt-2"
                      value={transaction.description}
                      onChangeText={e =>
                        setTransaction({ ...transaction, description: e })
                      }
                    />

                    <TextInput
                      placeholder="Montant"
                      placeholderTextColor='#000'
                      className="border border-gray-300 p-3 rounded mt-2"
                      keyboardType="numeric"
                      value={transaction.montant}
                      onChangeText={e =>
                        setTransaction({ ...transaction, montant: e })
                      }
                    />
                  </View>
                ) : null}

                <TouchableOpacity
                  className="mt-4 mb-2 p-3 bg-black rounded-3xl"
                  onPress={handleAddTransaction}
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
    <View className="pt-10 pl-3 pr-3 bg-white flex-1">
      <StatusBar style='dark' />
      <View className="flex-row items-center justify-between">
        <Text className="text-3xl font-extrabold text-gray-500">
          Mon portefeuille
        </Text>

        <View className="flex-row justify-center">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center bg-gray-300 rounded-full shadow-md"
            onPress={() => navigation.navigate('Statistique')}
          >
            <AntDesign name="barschart" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-10 h-10 items-center justify-center bg-gray-300 rounded-full shadow-md ml-2"
            onPress={() => setShowModal(true)}
          >
            <AntDesign name="plus" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-4 flex-row">
        <View className='flex-row'>
          <Text className="text-3xl font-bold text-blue-400" style={{color: soldeDay >= 0 ?  'green' : 'red'}}>
            {soldeDay.toLocaleString('fr-FR')}
          </Text>
          <Text className="text-gray-500 text-sm font-semibold mt-4 ml-2">
            FCFA
          </Text>
        </View>
        <View className='flex-row'>
          <Text className="text-4xl font-bold">
            {' '}
            / {solde.toLocaleString('fr-FR')}
          </Text>
          <Text className="text-gray-500 text-sm font-semibold mt-4 ml-2">
            FCFA
          </Text>
        </View>
      </View>

      <ScrollView className="mt-4">
        <View className="flex-row justify-between items-center">
          <View className="bg-red-400 p-3 rounded-xl w-[45%]">
            <Text>Dépenses du jour</Text>

            <Text className="text-xl font-bold mt-1">
              {depense.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>

          <View className="bg-green-400 p-3 rounded-xl w-[45%]">
            <Text>Entrée du jour</Text>

            <Text className="text-xl font-bold mt-1">
              {revenus.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View className="mt-4">
          {soldeData.length > 0 ? (
            <LineChart
              data={{
                labels: labels,
                datasets: [
                  {
                    data: soldeData
                  }
                ]
              }}
              width={Dimensions.get('window').width - 29} // from react-native
              height={250}
              //yAxisLabel="$"
              //yAxisSuffix=" CFA"
              //formatYLabel={(value) => parseInt(value).toFixed(0)}
              //yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(0, 127, 254, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#007FFE'
                },
                propsForVerticalLabels: {
                  fontWeight: 'bold'
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
              verticalLabelRotation={90}
            />
          ) : (
            <View>
              <Text className="text-gray-500 text-xl font-semibold mt-4 ml-2">
                Donnée par défaut
              </Text>
              <LineChart
                data={{
                  labels: [
                    'Jan',
                    'Fév',
                    'Mar',
                    'Avr',
                    'Mai',
                    'Jui',
                    'Jul',
                    'Aou',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Déc'
                  ],
                  datasets: [
                    {
                      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    }
                  ]
                }}
                width={Dimensions.get('window').width - 29} // from react-native
                height={250}
                //yAxisLabel="$"
                //yAxisSuffix=" CFA"
                //formatYLabel={(value) => parseInt(value).toFixed(0)}
                //yAxisInterval={1} // optional, defaults to 1
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0, // optional, defaults to 2dp
                  color: (opacity = 1) => `rgba(0, 127, 254, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: '#007FFE'
                  },
                  propsForVerticalLabels: {
                    fontWeight: 'bold'
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
                verticalLabelRotation={90}
              />
            </View>
          )}
        </View>

        {/* Transactions */}
        <View className="mb-4">
          <Text className="text-lg font-bold mb-3 mt-2">
            Transactions du jour
            <Text className="ml-2 text-sm text-gray-400">
              {' '}
              ({date.toLocaleDateString('fr-FR', options)})
            </Text>
          </Text>

          {data.map((item, index) => {
            return (
              <View
                key={index}
                className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full"
              >
                {item.type_transaction === 'Dépense' ? (
                  <View className="bg-red-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                    <MaterialCommunityIcons
                      name="cash-minus"
                      size={24}
                      color="white"
                    />
                  </View>
                ) : (
                  <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                    <MaterialCommunityIcons
                      name="cash-plus"
                      size={24}
                      color="white"
                    />
                  </View>
                )}

                <View className="items-start w-[60%]">
                  <Text className="text-sm font-bold">{item.description}</Text>
                </View>

                <View>
                  <Text className="text-sm font-bold">
                    {' '}
                    {item.type_transaction === 'Dépense' ? '-' : ''}
                    {item.montant.toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>
      {renderModal()}
    </View>
  )
}

export default Wallet
