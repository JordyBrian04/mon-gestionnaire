import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated, Dimensions } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Feather, SimpleLineIcons, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { StatusBar } from 'expo-status-bar'
import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet'
import { initDatabase } from '../../../components/database'
import {SwipeListView} from 'react-native-swipe-list-view'
import { TouchableHighlight } from 'react-native-gesture-handler'

//https://www.youtube.com/watch?v=P32k01XzqB8

const {height: SCREEN_HEIGHT} = Dimensions.get('window')
const {width: SCREEN_WIDTH} = Dimensions.get('window')
const db = initDatabase()

const Notes = () => {
  const bottomSheetModalRef:any = useRef(null)
  const snapPoint = ['25%','50%','75%', '90%', '95%']
  const [open, setOpen] = useState(false)
  const [isListeDesNotesDisplayed, setIsListeDesNotesDisplayed] = useState(false);
  const [allNotes, setAllNotes] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [noteInput, setNoteInput] = useState({
    id: 0,
    title: '',
    content: ''
  })

  const leftSwipe = (progress:any, dragX:any) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange : [0, 1],
      extrapolate: 'clamp'
    })
    return (
      <View className='bg-blue-400 items-center justify-center p-2'>
        <TouchableOpacity className='w-full items-center justify-center'>
          <SimpleLineIcons name="pin" size={24} color="white" />
          <Animated.Text className='text-white font-bold text-center mt-2'>Epingler</Animated.Text>
        </TouchableOpacity>
      </View>
    )
  }

  const rightSwipe = (progress:any, dragX:any) => {
    // const scale = dragX.interpolate({
    //   inputRange: [0, 100],
    //   outputRange : [0, 1],
    //   extrapolate: 'clamp'
    // })
    return (
      <View className='bg-red-500 items-center justify-center p-2 w-16'>
        <TouchableOpacity className='w-full items-center justify-center'>
          <FontAwesome6 name="trash-can" size={24} color="white" />
          {/* <Animated.Text style={{transform: [{scale: scale}]}} className='text-white font-bold text-center mt-2'>Epingler</Animated.Text> */}
        </TouchableOpacity>
      </View>
    )
  }

  const getData = async () => {
    setAllNotes([])
    setNotes([])
    await db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM notes', 
        [], 
        (_, result) => {
          //console.log('result : ', result.rows._array);
          setAllNotes(result.rows._array)
          setNotes(result.rows._array)
        },
        (_, error) => {
          console.error('error : ', error);
          return false
        }
      )
    })
  }

  const emptyNotes = async () => {
    setNoteInput({
      id: 0,
      title: '',
      content: ''
    })
  }

  useEffect(() => {
    getData()
  }, [])

  const VisibleItem = (props:any) => {
    const {data} = props
    const itemDate = new Date(data.item.date)
    return (
      <TouchableHighlight onPress={() => [setNoteInput({...noteInput, id: data.item.id, title: data.item.title, content: data.item.content}), showModal()]}>
        <View className='py-1 mb-1 bg-white' style={data.index > 0 && {borderTopWidth: 1, borderColor: '#f2f2f2'}}>
          <Text className='text-lg text-ellipsis font-bold text-black' numberOfLines={1}>{data.item.title}</Text>
          <Text className='text-[16px] text-ellipsis text-gray-600' numberOfLines={1}>{data.item.content}</Text>
          <Text className='text-sm text-gray-400'>{itemDate.toLocaleDateString('fr-FR')}</Text>
        </View>
      </TouchableHighlight>
    )
  }

  const renderItem = (data:any, rowMap:any) => {
    //console.log(data.item)
    return(
      <VisibleItem data={data} />
    )

  };

  const HiddenItemWithActions = (props:any) => {
    const {onEpingle, onDelete} = props
    return (
      <View className='items-center bg-[#DDD] flex-1 flex-row justify-between pl-4 m-1 mb-4 rounded'>
        {/* <Text>Left</Text> */}
        <TouchableOpacity className='bg-orange-400 h-full w-16 absolute left-0 items-center justify-center' onPress={() => onEpingle()}>
          <SimpleLineIcons name="pin" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className='bottom-0 items-center justify-center absolute top-0 w-16 bg-red-500 right-0' onPress={() => onDelete()}>
          <Feather name="trash-2" size={24} color="white" />
        </TouchableOpacity>
      </View>
    )
  }

  const HiddenEpingleItemWithActions = (props:any) => {
    const {onEpingle, onDelete} = props
    return (
      <View className='items-center bg-[#DDD] flex-1 flex-row justify-between pl-4 m-1 mb-4 rounded'>
        {/* <Text>Left</Text> */}
        <TouchableOpacity className='bg-orange-400 h-full w-16 absolute left-0 items-center justify-center' onPress={() => onEpingle()}>
          <MaterialCommunityIcons name="pin-off" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className='bottom-0 items-center justify-center absolute top-0 w-16 bg-red-500 right-0' onPress={() => onDelete()}>
          <Feather name="trash-2" size={24} color="white" />
        </TouchableOpacity>
      </View>
    )
  }

  const epingleRow = async (rowMap:any, noteId: any, sta:any) => {
    //console.log(rowMap, noteId)
    await db.transaction(tx => {
      tx.executeSql(
        'UPDATE notes SET epingle=? WHERE id=?', 
        [sta,noteId], 
        (_, result) => {
          console.log(result)
          getData()
        },
        (_, error) => {
          console.error('error : ', error);
          return false
        }
      )
    })
  }

  const deleteRow = async (rowMap:any, noteId:any) => {
    await db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM notes WHERE id=?', 
        [noteId], 
        (_, result) => {
          console.log(result)
          getData()
        },
        (_, error) => {
          console.error('error : ', error);
          return false
        }
      )
    })
  }

  const renderHiddenItem = (data:any, rowMap:any) => {
    return (
      <HiddenItemWithActions 
        data={data} 
        rowMap={rowMap} 
        onEpingle={() => epingleRow(rowMap, data.item.id, 1)} 
        onDelete={() => deleteRow(rowMap, data.item.id)} 
      />
    )
  }

  const renderHiddenEpingleItem = (data:any, rowMap:any) => {
    return (
      <HiddenEpingleItemWithActions 
        data={data} 
        rowMap={rowMap} 
        onEpingle={() => epingleRow(rowMap, data.item.id, 0)} 
        onDelete={() => deleteRow(rowMap, data.item.id)} 
      />
    )
  }

  const showModal = () => {
    //translateY.value = withSpring(-SCREEN_HEIGHT/3, {damping: 50})
    bottomSheetModalRef.current?.present()
    setOpen(true)
  }

  const handleSave = () => {
    if(noteInput.title !== '' && noteInput.content !== '') {
      if(noteInput.id === 0){
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO notes (title, content) VALUES (?,?)', 
            [noteInput.title, noteInput.content], 
            (_, result) => {

              getData()

              setNoteInput({
                id: 0,
                title: '',
                content: ''
              })

              bottomSheetModalRef.current?.dismiss()
              setOpen(false)
            },
            (_, error) => {
              console.error('error : ', error);
              return false
            }
          )
        })
      }

      if(noteInput.id > 0){
        db.transaction(tx => {
          tx.executeSql(
            'UPDATE notes SET title=?, content=? WHERE id=?', 
            [noteInput.title, noteInput.content, noteInput.id], 
            (_, result) => {

              getData()

              setNoteInput({
                id: 0,
                title: '',
                content: ''
              })

              bottomSheetModalRef.current?.dismiss()
              setOpen(false)
            },
            (_, error) => {
              console.error('error : ', error);
              return false
            }
          )
        })
      }

    }
  }

  const setSeachText = (text:string) => {
    if(text === ''){
      setNotes(allNotes)
      return
    }
    setNotes(allNotes.filter(note => note.content.toLowerCase().includes(text.toLowerCase()) || note.title.toLowerCase().includes(text.toLowerCase())).map(note => note))
  }


  return (
      <BottomSheetModalProvider>
        <View className='pt-8 flex-1 pl-3 pr-3'>
          <StatusBar style='auto' />

          <ScrollView className='mb-2'>

            <View className='flex-row items-center justify-between'>
              <Text className='text-3xl font-extrabold text-black'>
                Notes
              </Text>

              <TouchableOpacity onPress={() => [emptyNotes(),showModal()]}>
                <Feather name="edit" size={24} color="#FFC300" />
              </TouchableOpacity>
            </View>

            <View className='mt-2'>
              <TextInput
                placeholder='Rechercher'
                //placeholderTextColor='#000'
                className='bg-gray-200 p-1 rounded-lg'
                onChangeText={(text) => setSeachText(text)}
              />
            </View>

            <View className='mt-3'>
              {notes.length > 0 ? (
                <View>
                  {notes.filter(row => row.epingle === 1).length > 0 && (
                    <View>
                      <Text className='text-2xl font-extrabold text-black'>Epinglées</Text>
                      <View className='bg-white p-2 rounded-lg mt-2'>
                        <SwipeListView
                          scrollEnabled={false}
                          data={notes.filter(row => row.epingle === 1)}
                          renderItem={renderItem}
                          renderHiddenItem={renderHiddenEpingleItem}
                          leftOpenValue={70}
                          rightOpenValue={-70}
                        />
                      </View>
                    </View>
                  )}

                  {notes.filter(row => row.epingle === 0).length > 0 && (
                    <View>
                      <Text className='text-2xl font-extrabold text-black mt-2'>Liste des notes</Text>
                      <View className='bg-white p-2 rounded-lg mt-2'>
                        <SwipeListView
                          scrollEnabled={false}
                          data={notes.filter(row => row.epingle === 0)}
                          renderItem={renderItem}
                          renderHiddenItem={renderHiddenItem}
                          leftOpenValue={70}
                          rightOpenValue={-70}
                        />
                        {/* {notes.filter(row => row.epingle === 0).map((note, index) => {
                          return (
                          )
                        })} */}
                      </View>
                    </View>
                  )}


                </View>
              ) : (
                <View>
                  <Text>Aucune note trouvée</Text>
                </View>
              )}



            </View>
          </ScrollView>
          {/* {renderBottomModal()} */}

          <View className='bg-black/20 absolute' style={{height: SCREEN_HEIGHT, width: SCREEN_WIDTH, display: open ? 'flex' : 'none'}}></View>

          <BottomSheetModal 
            style={{borderRadius: 35}} 
            ref={bottomSheetModalRef} 
            index={4} 
            snapPoints={snapPoint}
            backgroundStyle={{borderRadius: 30}}
            onDismiss={() => setOpen(false)}
          >

            <View className='items-end p-2'>
              <TouchableOpacity onPress={handleSave}>
                <Feather name="save" size={30} color="#FFC300" />
              </TouchableOpacity>
            </View>

            <ScrollView className='z-50 p-3'>

              <TextInput
                placeholder='Titre'
                className='w-full p-2 mb-2 text-xl text-black font-extrabold'
                autoCapitalize='sentences'
                value={noteInput.title}
                onChangeText={e  => setNoteInput({...noteInput, title:e})}
              />

              <TextInput
                placeholder='Titre'
                className='w-full p-2 mb-2 text-black'
                style={{textAlignVertical: 'top'}}
                autoCapitalize='sentences'
                value={noteInput.content}
                autoCorrect
                multiline={true}
                onChangeText={e  => setNoteInput({...noteInput, content:e})}
              />
            </ScrollView>
          </BottomSheetModal>

        </View>
      </BottomSheetModalProvider>
    // <GestureHandlerRootView className='flex-1'>
    // </GestureHandlerRootView>
  )
}

export default Notes