import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { getNom } from '../../../services/AsyncStorage'
import { MaterialIcons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { initDatabase } from '../../../components/database'

//const db = initDatabase()

const Parametre = () => {
  const [username, setUsername] = useState('')
  const [initial, setInitiales] = useState('')
  const [loading, setLoading] = useState(false)
  const [db, setDb] = useState(initDatabase())

  useEffect(() => {
    getNom().then(res => {
      setUsername(res)
      const words = res.split(' ')
      const initials = words.slice(0, 2).map((word: any) => word.charAt(0))
      const initialsString = initials.join('')
      setInitiales(initialsString)
    })
    //console.log(labels)
  }, [])

  const backupDatabase = async () => {
    setLoading(true)
    try {
      exportDb()
    } catch (error) {
        console.error('Error backing up database:', error)
    }
    setLoading(false)
}

const exportDb = async () => {
    await Sharing.shareAsync(
        FileSystem.documentDirectory + 'SQLite/mon_gestionnaire.db'
    )
    Alert.alert('Succès', 'Base de données sauvegardée avec succès')
  }

  const importDB = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true
      })

      if (result?.type === 'success') {
        setLoading(true)

        if(!(await FileSystem.getInfoAsync(FileSystem.documentDirectory+'SQLite')).exists){
            await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory+'SQLite')
        }

        const base64 = await FileSystem.readAsStringAsync(
            result.uri,
            { encoding: FileSystem.EncodingType.Base64 }
        )

        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory+'SQLite/mon_gestionnaire.db', base64, { encoding: FileSystem.EncodingType.Base64 })
        await db.closeAsync()
        setDb(SQLite.openDatabase('mon_gestionnaire.db'))
        setLoading(false)
      }
    } catch (error) {
        console.log(error)
        setLoading(false)
    }
  }

  function renderModal() {
    return (
      <Modal visible={true} transparent animationType="slide">
        <View className="flex-1 bg-black/20 items-center justify-center">
          <ActivityIndicator size={54} />
        </View>
      </Modal>
    )
  }

  return (
    <View className="pt-11 pr-4 pl-4">
      <StatusBar style="dark" />
      <ScrollView className="mt-8">
        <View className="items-center justify-center">
          {/* Image */}
          <View className="bg-blue-500/50 w-28 h-28 rounded-full items-center justify-center">
            <Text className="text-4xl font-bold text-white">{initial}</Text>
          </View>
          <Text className="mt-3 text-2xl font-bold">{username}</Text>
        </View>

        {/* Liste */}
        <View className="p-3 mt-4">
          <View className="border-t border-slate-300 p-4">
            <TouchableOpacity
              className="flex-row items-center justify-between "
              onPress={backupDatabase}
            >
              <MaterialIcons name="backup" size={24} color="black" />
              <Text className="w-full ml-3 text-[16px]">
                Sauvegarder les données
              </Text>
            </TouchableOpacity>
          </View>

          <View className="border-t border-b border-slate-300 p-4">
            <TouchableOpacity className="flex-row items-center justify-between " onPress={importDB}>
              <MaterialIcons name="restore" size={24} color="black" />
              <Text className="w-full ml-3 text-[16px]">
                Restaurer les données
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {loading && renderModal()}
    </View>
  )
}

export default Parametre
