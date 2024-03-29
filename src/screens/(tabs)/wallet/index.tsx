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
  Platform
} from 'react-native'
import React, { useState } from 'react'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { LineChart } from 'react-native-chart-kit'
import DateTimePicker from '@react-native-community/datetimepicker'
import { SelectList } from 'react-native-dropdown-select-list'

const Wallet = ({navigation}:any) => {
  const [showModal, setShowModal] = useState(false)
  const [affichage, setAffichage] = useState("")
  const [date, setDate] = useState(new Date())
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

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
        // setTache({
        //   ...tache,
        //   date: currentDate.toLocaleDateString('fr-FR', options)
        // })
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
    { key: 3, value: 'Autre' },
  ]

  function renderModal(){
    return(
      <Modal visible={showModal} transparent animationType='slide'>
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
                    console.log(val)
                  ]}
                  data={TypeTransactionOptions}
                  defaultOption={{ key: affichage, value: affichage }}
                  save="value"
                  placeholder='Sélectionnez le type de transaction'
                  
                />

                {affichage === 'Entrée' ? (
                  <View className=''>
                    <View className="mt-2">
                      {open && (
                        <DateTimePicker
                          mode="date"
                          display="spinner"
                          value={date}
                          onChange={onChange}
                        />
                      )}
                      {!open && (
                        <TouchableOpacity onPress={toggleDatePicker}>
                          <TextInput
                            placeholder="Date"
                            className="border border-gray-300 p-3 rounded"
                            editable={false}
                            //value={tache.date}
                            //value={tache.date.toLocaleDateString('fr-FR', options)}
                            //onChangeText={e => setTache({ ...tache, date: e })}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    <TextInput
                      placeholder="Description"
                      className="border border-gray-300 p-3 rounded mt-2"
                      //value={tache.titre}
                      //onChangeText={e => setTache({ ...tache, titre: e })}
                    />

                    <TextInput
                      placeholder="Montant"
                      className="border border-gray-300 p-3 rounded mt-2"
                      keyboardType='numeric'
                      //value={tache.titre}
                      //onChangeText={e => setTache({ ...tache, titre: e })}
                    />
                  </View>
                ): affichage === 'Dépense' ?
                  (<View>
                    <View className="mt-2 mb-2">
                      {open && (
                        <DateTimePicker
                          mode="date"
                          display="spinner"
                          value={date}
                          onChange={onChange}
                        />
                      )}
                      {!open && (
                        <TouchableOpacity onPress={toggleDatePicker}>
                          <TextInput
                            placeholder="Date"
                            className="border border-gray-300 p-3 rounded"
                            editable={false}
                            //value={tache.date}
                            //value={tache.date.toLocaleDateString('fr-FR', options)}
                            //onChangeText={e => setTache({ ...tache, date: e })}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    <SelectList
                      setSelected={(val: any) => [
                        //setAffichage(val),
                        //console.log(val)
                      ]}
                      data={TypeDepense}
                      //defaultOption={{ key: affichage, value: affichage }}
                      save="value"
                      placeholder='Sélectionnez le type de dépense'
                      
                    />

                    <TextInput
                      placeholder="Description"
                      className="border border-gray-300 p-3 rounded mt-2"
                      //value={tache.titre}
                      //onChangeText={e => setTache({ ...tache, titre: e })}
                    />

                    <TextInput
                      placeholder="Montant"
                      className="border border-gray-300 p-3 rounded mt-2"
                      keyboardType='numeric'
                      //value={tache.titre}
                      //onChangeText={e => setTache({ ...tache, titre: e })}
                    />
                  </View>) :
                  (null)
                }

                <TouchableOpacity
                  className="mt-4 mb-1 p-3 bg-black rounded-3xl"
                  //onPress={handleAddTache}
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
    <View className="pt-8 pl-3 pr-3 bg-white flex-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-3xl font-extrabold text-gray-500">
          Mon portefeuille
        </Text>

        <View className='flex-row justify-center'>
          <TouchableOpacity className="w-10 h-10 items-center justify-center bg-gray-300 rounded-full shadow-md" onPress={() => navigation.navigate('Statistique')}>
            <AntDesign name="barschart" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity className="w-10 h-10 items-center justify-center bg-gray-300 rounded-full shadow-md ml-2" onPress={() => setShowModal(true)}>
            <AntDesign name="plus" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-4 flex-row">
        <Text className="text-4xl font-bold">1 168 900</Text>
        <Text className="text-gray-500 text-xl font-semibold mt-4 ml-2">
          FCFA
        </Text>
      </View>

      <ScrollView className="mt-4">
        <View className="flex-row justify-between items-center">
          <View className="bg-red-400 p-3 rounded-xl w-[45%]">
            <Text>Dépenses du jour</Text>

            <Text className="text-xl font-bold mt-1">6 000 FCFA</Text>
          </View>

          <View className="bg-green-400 p-3 rounded-xl w-[45%]">
            <Text>Entrée du jour</Text>

            <Text className="text-xl font-bold mt-1">6 000 FCFA</Text>
          </View>
        </View>

        {/* Chart */}
        <View className="mt-4">
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
                  data: [
                    4000,
                    6000,
                    5000,
                    3500,
                    7000,
                    1000,
                    2000,
                    5900,
                    4300,
                    10000,
                    13000,
                    8000
                  ]
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

        {/* Transactions */}
        <View className='mb-4'>
            <Text className='text-lg font-bold mb-3 mt-2'>Transactions</Text>

            {/* Debut de ligne */}
            <View className='flex-row items-center justify-between'>
              <Text className='text-gray-500 mb-2'>mardi 23 mars 2024</Text>
              <Text className='text-gray-700 mb-2 font-extrabold'>10 000 FCFA</Text>
            </View>

            {/* Depense */}
            <View className='flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full'>

              <View className='bg-red-500 p-1 w-8 h-8 items-center justify-center rounded-full'>
                <MaterialCommunityIcons name="cash-minus" size={24} color="white" />
              </View>

              <View className='items-start w-[60%]'>
                <Text className='text-sm font-bold'>Transport pour le travail par le 4e pont ADO</Text>
              </View>

              <View>
                <Text className='text-sm font-bold'>-800 FCFA</Text>
              </View>
            </View>

            {/* Entrée */}
            <View className='flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full'>

              <View className='bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full'>
                <MaterialCommunityIcons name="cash-plus" size={24} color="white" />
              </View>

              <View className='items-start w-[60%]'>
                <Text className='text-sm font-bold'>Dépot</Text>
              </View>

              <View>
                <Text className='text-sm font-bold'>10 800 FCFA</Text>
              </View>
            </View>

            {/* Entrée */}
            <View className='flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full'>

              <View className='bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full'>
                <MaterialCommunityIcons name="cash-plus" size={24} color="white" />
              </View>

              <View className='items-start w-[60%]'>
                <Text className='text-sm font-bold'>Dépot</Text>
              </View>

              <View>
                <Text className='text-sm font-bold'>10 800 FCFA</Text>
              </View>
            </View>
            {/* Fin de ligne */}

            {/* Debut de ligne */}
            <View className='flex-row items-center justify-between'>
              <Text className='text-gray-500 mb-2'>mardi 23 mars 2024</Text>
              <Text className='text-gray-700 mb-2 font-extrabold'>10 000 FCFA</Text>
            </View>

            <View className='flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full'>

              <View className='bg-red-500 p-1 w-8 h-8 items-center justify-center rounded-full'>
                <MaterialCommunityIcons name="cash-minus" size={24} color="white" />
              </View>

              <View className='items-start w-[60%]'>
                <Text className='text-sm font-bold'>Transport pour le travail par le 4e pont ADO</Text>
              </View>

              <View>
                <Text className='text-sm font-bold'>-800 FCFA</Text>
              </View>
            </View>

            <View className='flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full'>

              <View className='bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full'>
                <MaterialCommunityIcons name="cash-plus" size={24} color="white" />
              </View>

              <View className='items-start w-[60%]'>
                <Text className='text-sm font-bold'>Dépot</Text>
              </View>

              <View>
                <Text className='text-sm font-bold'>10 800 FCFA</Text>
              </View>
            </View>
            {/* Fin de ligne */}

        </View>
      </ScrollView>
      {renderModal()}
    </View>
  )
}

export default Wallet
