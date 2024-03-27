import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import moment from 'moment'
import Swiper from 'react-native-swiper'
import { SelectList } from "react-native-dropdown-select-list";

const Agenda = () => {
  const [value, setValue] = useState(new Date())
  const [week, setWeek] = useState(0)
  const [affichage, setAffichage] = useState('Timeline')
  const swiper = useRef()

  const weeks = useMemo(() => {
    const start:any = moment(start).add(week, 'week').startOf('week')

    return [-1, 0, 1].map(adj => {
      return Array.from({ length: 7 }).map((_, index) => {
        const date = moment(start).add(adj, 'week').add(index, 'day')

        return {
          weekday: date.format('ddd'),
          day: date.toDate()
        }
      })
    })
  }, [week])

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  const SelectOptions = [
    {key: 1, value: 'Timeline'},
    {key: 2, value: 'Liste'},
  ]


  return (
    <View className="flex-1 bg-black/80 pt-6 pl-4 pr-4">
      {/* Header */}
      <View>
        <Text className="text-white text-2xl font-bold">Mon agenda</Text>
      </View>
      <View className="h-full bg-white rounded-xl mt-4">

        <View className='flex-1 max-h-24'>
          <Swiper index={1} ref={swiper} showsPagination={false} loop={false} onIndexChanged={ind => {
            if(ind === 1) {
              return;
            }

            setTimeout(() => {
              const newIndex = ind - 1
              const newWeek = week + newIndex
              setWeek(newWeek)
              setValue(moment(value).add(newIndex, 'week').toDate())
              swiper.current.scrollTo(1, false)
            }, 100)
          }}>
          {weeks.map((dates, index) => (
            <View
              key={index}
              className="flex-row items-start justify-between mx-[-4] my-3"
              style={{ paddingHorizontal: 8 }}
            >
              {dates.map((date, dateIndex) => {
                const isActive = value.toDateString() === date.day.toDateString()
                return (
                  <TouchableWithoutFeedback key={dateIndex} onPress={() => setValue(date.day)}>
                    <View
                      className="flex-1 h-14 mx-1 py-2 px-0 border border-slate-200 items-center flex-col rounded-lg"
                      style={isActive && { backgroundColor: '#D6D6D6' }}
                    >
                      <Text
                        className="text-gray-500 mb-0"
                        style={isActive && { color: '#111' }}
                      >
                        {date.weekday}
                      </Text>
                      <Text
                        className="font-bold text-gray-500"
                        style={isActive && { color: '#111' }}
                      >
                        {date.day.getDate()}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                )
              })}
            </View>
          ))}
          </Swiper>
        </View>

        <View className='flex-1 p-3'>
          <View className='flex-row justify-between items-center'>
            <View>
              <Text className='text-black text-xl font-bold'>Tâches</Text>
              <Text className='text-gray-600 text-sm font-bold'>{value.toLocaleDateString('fr-FR', options)}</Text>
            </View>
            <View>
              <SelectList
                setSelected={(val: any) => [setAffichage(val), console.log(val)]}
                data={SelectOptions}
                defaultOption={{ key: affichage, value: affichage }}
                save='value'
              />
            </View>
          </View>

          <View className='mt-6'>
            {affichage === 'Liste' ? (
              <View>
                <ScrollView>
                  <View className='bg-gray-100 p-3 rounded-lg border border-gray-200'>
                    <Text className='font-bold text-lg'>Titre</Text>
                  </View>
                </ScrollView>
              </View>
            ) : 
            <View>

            </View>}
          </View>
        </View>
      </View>


    </View>
  )
}

export default Agenda
