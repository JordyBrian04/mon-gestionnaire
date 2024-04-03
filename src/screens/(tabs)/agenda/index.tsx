import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  ActivityIndicator
} from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import moment from 'moment'
import Swiper from 'react-native-swiper'
import { SelectList } from 'react-native-dropdown-select-list'
import Timeline from 'react-native-timeline-flatlist'
import { AntDesign } from '@expo/vector-icons'
import { TextInput } from 'react-native-gesture-handler'
import DateTimePicker from '@react-native-community/datetimepicker'
import { initDatabase } from '../../../components/database'

const db = initDatabase()

const Agenda = () => {
  const [value, setValue] = useState(new Date())
  const [week, setWeek] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [affichage, setAffichage] = useState('Timeline')
  const swiper = useRef()
  const [date, setDate] = useState(new Date())
  const [time, setTime] = useState(new Date())
  const [open, setOpen] = useState(false)
  const [openTime, setOpenTime] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [old_data, setOldData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [tache, setTache] = useState({
    titre: '',
    date: '',
    heure: ''
  })

  const weeks = useMemo(() => {
    const start: any = moment(start).add(week, 'week').startOf('week')

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

  const options: any = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  const optionsTime: any = {
    hour: 'numeric',
    minute: 'numeric'
  }

  const SelectOptions = [
    { key: 1, value: 'Timeline' },
    { key: 2, value: 'Liste' }
  ]

  const getData = async () => {
    await db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM agenda order by dates, heure ASC;',
        [],
        (_, result) => {
          setData(
            result.rows._array
              .filter(
                data =>
                  data.dates === value.toLocaleDateString('fr-FR', options)
              )
              //               .sort((a, b) => {
              // const heureA = convertTimeToSortableFormat(a.dates)
              // const heureB = convertTimeToSortableFormat(b.dates)
              // console.log(heureA, heureB)
              // return heureA.localeCompare(heureB);
              //               })
              .map(row => ({
                time: row.heure,
                title: row.titre,
                description: row.dates
              }))
          )

          setOldData(
            result.rows._array.map(row => ({
              time: row.heure,
              title: row.titre,
              description: row.dates
            }))
          )
          // console.log(
          //   result.rows._array.map(row => ({
          //     time: row.heure,
          //     title: row.titre,
          //     description: row.dates
          //   }))
          // )
        },
        (_, error) => {
          console.error('Error creating table:', error)
          return false // Retourne false en cas d'erreur
        }
      )
    })
  }

  useEffect(() => {
    getData()
  }, [])

  const toggleDatePicker = () => {
    setOpen(!open)
  }

  const toggleTimePicker = () => {
    setOpenTime(!openTime)
  }

  const onChange = ({ type }: any, selectedDate: any) => {
    if (type === 'set') {
      const currentDate = selectedDate
      //setDate(currentDate)

      if (Platform.OS === 'android') {
        toggleDatePicker()

        //On attribu la date à la valeur date (currentDate.toLocaleDateString('fr-FR'))
        setTache({
          ...tache,
          date: currentDate.toLocaleDateString('fr-FR', options)
        })
      }
    } else {
      toggleDatePicker()
    }
  }

  const onChangeTime = ({ type }: any, selectedTime: any) => {
    if (type === 'set') {
      const currentTime = selectedTime
      setTime(currentTime)

      if (Platform.OS === 'android') {
        toggleTimePicker()

        //On attribu la date à la valeur date (currentDate.toLocaleDateString('fr-FR'))
        setTache({
          ...tache,
          heure: currentTime.toLocaleTimeString('fr-FR', optionsTime)
        })
      }
    } else {
      toggleTimePicker()
    }
  }

  const handleAddTache = async () => {
    setLoading(true)
    await db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO agenda (dates, heure, titre) VALUES (?,?,?);',
        [tache.date, tache.heure, tache.titre],
        (_, result) => {
          if (result.rowsAffected >= 1) {
            getData()
            setShowModal(false)
            setTache({
              titre: '',
              date: '',
              heure: ''
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
  }

  const onChangeDate = (selectDate: any) => {
    setData(
      old_data
        .filter(data => data.description === selectDate)
        .map(row => ({
          time: row.time,
          title: row.title,
          description: row.description
        }))
    )
  }

  // const data = [
  //   { time: '09:00', title: 'Event 1', description: 'Event 1 Description' },
  //   { time: '10:45', title: 'Event 2', description: 'Event 2 Description' },
  //   { time: '12:00', title: 'Event 3', description: 'Event 3 Description' },
  //   { time: '14:00', title: 'Event 4', description: 'Event 4 Description' },
  //   { time: '16:30', title: 'Event 5', description: 'Event 5 Description' }
  // ]

  function renderModal() {
    return (
      <Modal visible={showModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View className="flex-1 bg-black/10 items-center justify-center">
            <View className="bg-white w-[99%] z-20 p-3 absolute bottom-0 rounded-t-2xl">
              <Text className="font-bold text-center text-lg">
                Ajouter une tâche
              </Text>

              <View className="mt-4">
                <TextInput
                  placeholder="Entrez le titre de la tâche"
                  className="border border-gray-300 p-3 rounded"
                  value={tache.titre}
                  onChangeText={e => setTache({ ...tache, titre: e })}
                />

                <View className="flex-row justify-between items-center mt-2">
                  <View className="w-[55%]">
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
                          value={tache.date}
                          //value={tache.date.toLocaleDateString('fr-FR', options)}
                          onChangeText={e => setTache({ ...tache, date: e })}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View className="w-[40%]">
                    {openTime && (
                      <DateTimePicker
                        mode="time"
                        display="spinner"
                        value={time}
                        onChange={onChangeTime}
                        is24Hour={true}
                      />
                    )}

                    {!openTime && (
                      <TouchableOpacity onPress={toggleTimePicker}>
                        <TextInput
                          placeholder="Heure"
                          className="border border-gray-300 p-3 rounded"
                          editable={false}
                          value={tache.heure}
                          //value={time.toLocaleTimeString('fr-FR', optionsTime)}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  className="mt-4 mb-1 p-3 bg-black rounded-3xl"
                  onPress={handleAddTache}
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
    <View className="flex-1 bg-black/80 pt-6 pl-4 pr-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-white text-2xl font-bold">Mon agenda</Text>
        <TouchableOpacity
          className="bg-blue-200 p-2 rounded"
          onPress={() => setShowModal(true)}
        >
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View className="h-full bg-white rounded-xl mt-2">
        <View className="flex-1 max-h-24">
          <Swiper
            index={1}
            ref={swiper}
            showsPagination={false}
            loop={false}
            onIndexChanged={ind => {
              if (ind === 1) {
                return
              }

              setTimeout(() => {
                const newIndex = ind - 1
                const newWeek = week + newIndex
                setWeek(newWeek)
                setValue(moment(value).add(newIndex, 'week').toDate())
                swiper.current.scrollTo(1, false)
              }, 100)
            }}
          >
            {weeks.map((dates, index) => (
              <View
                key={index}
                className="flex-row items-start justify-between mx-[-4] my-3"
                style={{ paddingHorizontal: 8 }}
              >
                {dates.map((date, dateIndex) => {
                  const isActive =
                    value.toDateString() === date.day.toDateString()
                  return (
                    <TouchableWithoutFeedback
                      key={dateIndex}
                      onPress={() => [
                        setValue(date.day),
                        onChangeDate(
                          date.day.toLocaleDateString('fr-FR', options)
                        )
                      ]}
                    >
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

        <View className="flex-1 p-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-black text-xl font-bold">
                Tâches du jour
              </Text>
              <Text className="text-gray-600 text-sm font-bold">
                {value.toLocaleDateString('fr-FR', options)}
              </Text>
            </View>
            <View>
              <SelectList
                setSelected={(val: any) => [
                  setAffichage(val),
                  console.log(val)
                ]}
                data={SelectOptions}
                defaultOption={{ key: affichage, value: affichage }}
                save="value"
              />
            </View>
          </View>

          <View className="mt-6 flex-1">
            {affichage === 'Liste' ? (
              <View>
                <ScrollView className="mb-10">
                  {data.map(item => {
                    return (
                      <View
                        key={item.title}
                        className="bg-gray-100 p-3 rounded-lg border border-gray-200 mb-2"
                      >
                        <Text className="font-bold text-lg">{item.title}</Text>
                        <Text className="font-normal text-xs">{item.time}</Text>
                      </View>
                    )
                  })}
                </ScrollView>
              </View>
            ) : (
              <View className="flex-1 mb-10">
                <Timeline
                  data={data}
                  //separator={true}
                  circleSize={20}
                  circleColor="rgb(45,156,219)"
                  lineColor="rgb(45,156,219)"
                  timeContainerStyle={{ minWidth: 52, marginTop: 0 }}
                  timeStyle={{
                    textAlign: 'center',
                    color: 'black',
                    padding: 2,
                    borderRadius: 13,
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}
                  descriptionStyle={{ color: 'black', display: 'none' }}
                  style={{ flex: 1, marginTop: 15 }}
                  detailContainerStyle={{
                    backgroundColor: 'rgba(249, 135, 82, 0.3)',
                    borderRadius: 10,
                    marginBottom: 10,
                    padding: 6
                  }}
                  //isUsingFlatlist={false}
                />
              </View>
            )}
          </View>
        </View>
      </View>
      {renderModal()}
    </View>
  )
}

export default Agenda
