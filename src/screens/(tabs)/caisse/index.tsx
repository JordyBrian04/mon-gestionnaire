import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native'
import React, { useState } from 'react'
import { AntDesign, FontAwesome5 } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

const Caisse = () => {
  const [showModal, setShowModal] = useState(false)
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
                  className="border border-gray-300 p-3 rounded mb-2"
                  //value={tache.titre}
                  //onChangeText={e => setTache({ ...tache, titre: e })}
                />

                <TextInput
                  placeholder="Montant"
                  className="border border-gray-300 p-3 rounded mb-2"
                  keyboardType='numeric'
                  //value={tache.titre}
                  //onChangeText={e => setTache({ ...tache, titre: e })}
                />

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
    <View className='flex-1 bg-slate-100 items-center'>
      <View className='w-full bg-blue-400 p-2 items-center justify-center h-[130] ' style={{borderBottomLeftRadius: 70, borderBottomRightRadius: 70}}>
        <Text className='text-white font-bold text-3xl'>100 000 FCFA</Text>
        <Text className='text-white text-xl font-light'>Montant</Text>
      </View>

      <View className='items-center justify-center m-2'>
        <View className='bg-white p-3 rounded-xl w-[300px] shadow-xl'>

          <View className='items-end justify-end flex-row'>
            <AntDesign name='bank' size={24} color="blue" />
            <Text className='text-blue-500 font-bold text-2xl ml-2'>Caisse</Text>
          </View>

          <View className='items-start justify-center'>
            <Text className='text-black text-3xl font-extrabold mt-4 ml-2'>.... .... .... 2024</Text>
            <Text className='text-black text-2xl font-bold mt-2 mb-2 ml-2'>Jordy Brian</Text>
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

          <View className='flex-row rounded-2xl p-2 bg-slate-200 justify-between mb-2'>

            <View>
              <Text className='font-bold text-[15px]'>Epargne de janvier</Text>
              <Text className='text-[15px] text-gray-600'>23 Jan 2024</Text>
            </View>

            <Text className='font-bold'>100 000 FCFA</Text>

          </View>

          <View className='flex-row rounded-2xl p-2 bg-slate-200 justify-between mb-2'>

            <View>
              <Text className='font-bold text-[15px]'>Epargne de janvier</Text>
              <Text className='text-[15px] text-gray-600'>23 Jan 2024</Text>
            </View>

            <Text className='font-bold'>100 000 FCFA</Text>

          </View>

          <View className='flex-row rounded-2xl p-2 bg-slate-200 justify-between mb-2'>

            <View>
              <Text className='font-bold text-[15px]'>Epargne de janvier</Text>
              <Text className='text-[15px] text-gray-600'>23 Jan 2024</Text>
            </View>

            <Text className='font-bold'>100 000 FCFA</Text>

          </View>

          <View className='flex-row rounded-2xl p-2 bg-slate-200 justify-between mb-2'>

            <View>
              <Text className='font-bold text-[15px]'>Epargne de janvier</Text>
              <Text className='text-[15px] text-gray-600'>23 Jan 2024</Text>
            </View>

            <Text className='font-bold'>100 000 FCFA</Text>

          </View>

          <View className='flex-row rounded-2xl p-2 bg-slate-200 justify-between mb-2'>

            <View>
              <Text className='font-bold text-[15px]'>Epargne de janvier</Text>
              <Text className='text-[15px] text-gray-600'>23 Jan 2024</Text>
            </View>

            <Text className='font-bold'>100 000 FCFA</Text>

          </View>

        </View>
      </ScrollView>
      {renderModal()}
    </View>
  )
}

export default Caisse