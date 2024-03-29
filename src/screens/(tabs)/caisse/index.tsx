import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { AntDesign } from '@expo/vector-icons'

const Caisse = () => {
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

      <TouchableOpacity className='bg-blue-400 p-2 items-center justify-center w-48 mb-2 rounded-3xl'>
        <Text className='text-white'>Ajouter</Text>
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
    </View>
  )
}

export default Caisse