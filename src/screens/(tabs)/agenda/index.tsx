import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  ActivityIndicator,
  BackHandler,
  Alert
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
import { useRoute } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import * as Calendar from 'expo-calendar';
import { v4 as uuidv4 } from 'uuid';
import * as Localization from 'expo-localization';

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
  const [alarmTime, setAlarmTime] = useState(moment().format());
  const [currentDay, setCurrentDay] = useState(moment().format());
  const route = useRoute()

  const [tache, setTache] = useState({
    id: 0,
    titre: '',
    date: '',
    heure: '',
    calendarId:''
  })

  // useEffect(() => {
  //   if(route.name === 'Agenda'){

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
                id: row.id,
                time: row.heure,
                title: row.titre,
                description: row.dates
              }))
          )

          setOldData(
            result.rows._array.map(row => ({
              id: row.id,
              time: row.heure,
              title: row.titre,
              description: row.dates,
              dates: row.dates,
              calendarId: row.calendarId
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

  const confirmIOSDate = () => {
    setTache({
      ...tache,
      date: date.toLocaleDateString('fr-FR', options)
    })
    toggleDatePicker()
  }

  const onChange = ({ type }: any, selectedDate: any) => {
    if (type === 'set') {
      const currentDate = selectedDate
      setCurrentDay(currentDate)
      setDate(currentDate)

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
      //console.log(moment(currentDay).hour(currentTime.getHours()).minute(currentTime.getMinutes()))
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

  const confirmIOSTime = () => {
    setTache({
      ...tache,
      heure: time.toLocaleTimeString('fr-FR', optionsTime)
    })
    toggleTimePicker()
  }

  const handleAddTache = async (calendarId:any) => {
    //setLoading(true)
    await db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO agenda (dates, heure, titre, calendarId) VALUES (?,?,?,?);',
        [tache.date, tache.heure, tache.titre, calendarId],
        (_, result) => {
          if (result.rowsAffected >= 1) {
            getData()
            setShowModal(false)
            emptyData()
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

  async function getDefaultCalendarSource() {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    return defaultCalendar.source;
  }

  const createNewCalendar = async () => {
    const defaultCalendarSource =
      Platform.OS === 'ios'
        ? await getDefaultCalendarSource()
        : { isLocalAccount: true, name: 'Google Calendar' };

    let calendarId = null;

    try {
      calendarId = await Calendar.createCalendarAsync({
        title: 'Personnel',
        color: 'blue',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource?.sourceId || undefined,
        source: defaultCalendarSource,
        name: 'internal',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });
    } catch (error:any) {
      Alert.alert(error);
      return false;
    }
        

    console.log(`Your new calendar ID is: ${calendarId}`);

    return calendarId;
  }

  const synchronizeCalendar = async () => {
    setLoading(true)
    const calendarId = await createNewCalendar();
    try {
      const createEventId = await addEventsToCalendar(calendarId);
      //console.log('event ID : ', createEventId)
      handleAddTache(createEventId)
    } catch (e:any) {
      Alert.alert(e.message);
      //return false;
    }
  };

  const addEventsToCalendar = async (calendarId:any) => {
    const selectedDatePicked = moment(currentDay).hour(time.getHours()).minute(time.getMinutes())
    const event = {
      title: tache.titre,
      notes: tache.titre,
      startDate: moment(selectedDatePicked).add(0, 'm').toDate(),
      endDate: moment(selectedDatePicked).add(5, 'm').toDate(),
      timeZone: Localization.timezone,
      alarms: [{
        relativeOffset: '-PT15M', // Déclencher l'alarme à l'heure exacte de l'événement
        method: Calendar.AlarmMethod.ALERT // Méthode d'alarme, peut être 'ALERT', 'EMAIL', ou 'SMS'
      }],
      allowsModifications: true
    };

    try {
      const createEventAsyncResNew = await Calendar.createEventAsync(
        calendarId.toString(),
        event
      );
      return createEventAsyncResNew;
    } catch (error) {
      console.log('addEventsToCalendar ', error);
    }
  };

  // const handleCreateEventData = async (createEventId:any) => {
  //   const selectedDatePicked = moment(currentDay).hour(time.getHours()).minute(time.getMinutes())
  //   const creatTodo = {
  //     key: uuidv4(),
  //     date: `${moment(currentDay).format('YYYY')}-${moment(currentDay).format(
  //       'MM'
  //     )}-${moment(currentDay).format('DD')}`,
  //     todoList: [
  //       {
  //         key: uuidv4(),
  //         title: tache.titre,
  //         notes: tache.titre,
  //         alarm: {
  //           time: selectedDatePicked,
  //           isOn: true,
  //           createEventAsyncRes: createEventId
  //         },
  //         color: `rgb(${Math.floor(
  //           Math.random() * Math.floor(256)
  //         )},${Math.floor(Math.random() * Math.floor(256))},${Math.floor(
  //           Math.random() * Math.floor(256)
  //         )})`
  //       }
  //     ],
  //     markedDot: {
  //       date: currentDay,
  //       dots: [
  //         {
  //           key: uuidv4(),
  //           color: '#2E66E7',
  //           selectedDotColor: '#2E66E7'
  //         }
  //       ]
  //     }
  //   };
  //   handleAddTache()
  // };

  const onChangeDate = (selectDate: any) => {
    setData(
      old_data
        .filter(data => data.description === selectDate)
        .map(row => ({
          id: row.id,
          time: row.time,
          title: row.title,
          description: row.description
        }))
    )
  }

  const getAgendaData = (id:number) => {
    const titre = old_data.find(data => data.id === id)?.title
    const date = old_data.find(data => data.id === id)?.dates
    const heure = old_data.find(data => data.id === id)?.time
    const calendarId = old_data.find(data => data.id === id)?.calendarId
    console.log(calendarId)

    setTache({
      ...tache,
      heure: heure,
      titre: titre,
      date: date,
      id: id,
      calendarId: calendarId
    })

    setShowModal(true)
  }

  const emptyData = () => {
    setTache({
      titre: '',
      date: '',
      heure: '',
      id: 0,
      calendarId:''
    })
  }

  const updateData = async () => {
    await db.transaction(tx => {
      tx.executeSql(
        'UPDATE agenda set dates=?, heure=?, titre=? WHERE id=?;',
        [tache.date, tache.heure, tache.titre, tache.id],
        (_, result) => {
          if (result.rowsAffected >= 1) {
            getData()
            emptyData()
            
            if(tache.calendarId !== null){
              updateAlarm()
              setShowModal(false)
              setLoading(false)
            }
          }
        },
        (_, error) => {
          setLoading(false)
          console.log('Error updating data:', error)
          return false
        }
      )
    })
  }

  const updateAlarm = async () => {
    const selectedDatePicked = moment(currentDay).hour(time.getHours()).minute(time.getMinutes())
    const event = {
      title: tache.titre,
      notes: tache.titre,
      startDate: moment(selectedDatePicked).add(0, 'm').toDate(),
      endDate: moment(selectedDatePicked).add(5, 'm').toDate(),
      timeZone: Localization.timezone
    };

    const existingEvent = await Calendar.getEventAsync(tache.calendarId.toString());
    if (!existingEvent) {
      console.log('Event does not exist');
      return; // Sortir de la fonction si l'événement n'existe pas
    }

    try {
      await Calendar.updateEventAsync(
        tache.calendarId.toString(),
        event
      );
    } catch (error) {
      console.log(error);
    }
  }

  const deleteAlarm = async () => {
    try {
      await Calendar.deleteEventAsync(
        tache.calendarId.toString()
      );
    } catch (error) {
      console.log(error);
    }
  }

  const deleteData = async () => {
    await db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM agenda WHERE id=?;',
        [tache.id],
        (_, result) => {
          if (result.rowsAffected >= 1) {
            getData()
            emptyData()

            if(tache.calendarId !== null){
              deleteAlarm()
            }
            setShowModal(false)
            setLoading(false)
          }
        },
        (_, error) => {
          setLoading(false)
          console.log('Error updating data:', error)
          return false
        }
      )
    })
  }

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
                  placeholderTextColor="#000"
                  className="border border-gray-300 p-3 rounded"
                  value={tache.titre}
                  onChangeText={e => setTache({ ...tache, titre: e })}
                />

                <View className="flex-col justify-between items-center mt-2">
                  <View className="w-full">
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
                          placeholderTextColor="#000"
                          className="border border-gray-300 p-3 rounded text-black mb-3"
                          editable={false}
                          onPressIn={toggleDatePicker}
                          value={tache.date}
                          //value={tache.date.toLocaleDateString('fr-FR', options)}
                          onChangeText={e => setTache({ ...tache, date: e })}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View className="w-full">
                    {openTime && (
                      <DateTimePicker
                        mode="time"
                        display="spinner"
                        value={time}
                        onChange={onChangeTime}
                        is24Hour={true}
                        style={{height: 120, marginTop: 20, width: '100%'}}
                        textColor='#000'
                      />
                    )}

                    {openTime && Platform.OS === 'ios' && (
                      <View className='flex-row justify-around mb-3'>

                        <TouchableOpacity className='p-3 bg-gray-200 rounded-full'
                          onPress={toggleTimePicker}
                        >
                          <Text className='text-red-500 font-extrabold'>Annuler</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className='p-3 bg-gray-200 rounded-full' 
                          onPress={confirmIOSTime}
                        >
                          <Text className='text-green-500 font-extrabold'>Valider</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {!openTime && (
                      <TouchableOpacity onPress={toggleTimePicker}>
                        <TextInput
                          placeholder="Heure"
                          placeholderTextColor="#000"
                          className="border border-gray-300 p-3 rounded"
                          editable={false}
                          value={tache.heure}
                          onPressIn={toggleTimePicker}
                          //value={time.toLocaleTimeString('fr-FR', optionsTime)}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {tache.id === 0 ? 
                  <TouchableOpacity
                    className="mt-4 mb-1 p-3 bg-black rounded-3xl"
                    onPress={synchronizeCalendar}
                  >
                    <Text className="text-white text-center font-bold text-[16px]">
                      {loading ? <ActivityIndicator /> : 'Enregistrer'}
                    </Text>
                  </TouchableOpacity>
                  :
                  <TouchableOpacity
                    className="mt-4 mb-1 p-3 bg-black rounded-3xl"
                    onPress={updateData}
                  >
                    <Text className="text-white text-center font-bold text-[16px]">
                      {loading ? <ActivityIndicator /> : 'Enregistrer'}
                    </Text>
                  </TouchableOpacity>
                }

                {tache.id > 0 && (
                  <TouchableOpacity
                    className="mt-2 mb-2 p-3 bg-red-500 rounded-3xl"
                    onPress={() => 
                      
                      Alert.alert(
                        'Confirmation',
                        `Voulez-vous vraiment supprimer cette tâche ?`,
                        [
                          {
                            text: 'Oui',
                            onPress: () => deleteData()
                          },
                          {
                            text: 'Non',
                            onPress: () => false,
                          }
                        ],
                        { cancelable: false }
                      )}
                  >
                    <Text className="text-white text-center font-bold text-[16px]">
                      {loading ? <ActivityIndicator /> : 'Supprimer'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }

  return (
    <View className="flex-1 bg-black/80 pt-8 pl-4 pr-4">
      <StatusBar style='light' />
      {/* Header */}
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-white text-2xl font-bold">Mon agenda</Text>
        <TouchableOpacity
          className="bg-blue-200 p-2 rounded"
          onPress={() => [setShowModal(true), emptyData()]}
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
                  //console.log(val)
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
                        key={item.id}
                        className="bg-gray-100 p-3 rounded-lg border border-gray-200 mb-2"
                      >
                        <TouchableOpacity onPress={() => getAgendaData(item.id)}>
                          <Text className="font-bold text-lg">{item.title}</Text>
                          <Text className="font-normal text-xs">{item.time}</Text>
                        </TouchableOpacity>
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
