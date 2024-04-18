import AsyncStorage from '@react-native-async-storage/async-storage'

export const storeNom = async (course: any) => {
  try {
    await AsyncStorage.setItem('nom', JSON.stringify(course))
  } catch (error) {
    console.log('[storeToken] error', error)
  }
}

export const getNom = async () => {
  try {
    let userData = await AsyncStorage.getItem('nom')
    const data = JSON.parse(userData as string)
    return data
  } catch (error) {}
}
