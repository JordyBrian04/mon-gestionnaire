import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native'
import React, {
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useEffect
} from 'react'
import { ProgressChart } from 'react-native-chart-kit'
import moment from 'moment'
import Swiper from 'react-native-swiper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const Statistique = () => {
  const [affichage, setAffichage] = useState('Ventes')
  const [periode, setPeriode] = useState('Jour')
  const [value, setValue] = useState(new Date())
  const [currentMois, setMois] = useState('')
  const [annee, setAnnee] = useState(0)
  const scrollViewRef: any = useRef()
  const scrollMoisViewRef: any = useRef()
  const screenWidth = Dimensions.get('window').width

  const data = {
    labels: ['Transport', 'Nourriture', 'Autre'], // optional
    data: [0.4, 0.6, 0.8]
  }

  const mois = [
    { key: 'Jan', value: 'janvier' },
    { key: 'Fev', value: 'février' },
    { key: 'Mar', value: 'mars' },
    { key: 'Avr', value: 'avril' },
    { key: 'Mai', value: 'mai' },
    { key: 'Jui', value: 'juin' },
    { key: 'Jul', value: 'juillet' },
    { key: 'Aou', value: 'août' },
    { key: 'Sep', value: 'septembre' },
    { key: 'Oct', value: 'octobre' },
    { key: 'Nov', value: 'novembre' },
    { key: 'Dec', value: 'décembre' }
  ]

  useLayoutEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true })
    }
  }, [])

  useEffect(() => {
    const currentMonthIndex = new Date().getMonth()
    setMois(new Date().toLocaleString('fr-FR', optionsMois))
    const x = currentMonthIndex * 56 // ITEM_WIDTH est la largeur d'un élément dans votre ScrollView
    if (scrollMoisViewRef.current) {
      scrollMoisViewRef.current.scrollTo({ x, animated: true })
    }
  }, [])

  const options: any = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  const optionsMois: any = {
    month: 'long'
  }

  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const weeks = useMemo(() => {
    const startOfYear = moment().startOf('year')
    const currentWeek = moment().diff(startOfYear, 'weeks')

    return Array.from({ length: currentWeek + 1 }).map((_, weekIndex) => {
      const startOfWeek = moment(startOfYear)
        .add(weekIndex, 'weeks')
        .startOf('week')

      return Array.from({ length: 7 }).map((_, dayIndex) => {
        const date = moment(startOfWeek).add(dayIndex, 'days')

        return {
          weekday: date.format('ddd'),
          day: date.toDate()
        }
      })
    })
  }, [])
  //console.log(weeks)

  return (
    <View className="bg-white flex-1 pt-8 pl-3 pr-3">
      <Text className="text-center font-bold text-2xl">Statistiques</Text>

      <View className="mt-2 items-center justify-between flex-row">
        <TouchableOpacity
          className="p-3 w-[45%] rounded-2xl items-center justify-center"
          onPress={() => setAffichage('Dépenses')}
          style={{
            backgroundColor: affichage === 'Ventes' ? '#4C9FF3' : '#F2F2F2'
          }}
        >
          <Text
            style={{
              color: affichage === 'Ventes' ? '#fff' : '#000',
              fontWeight: affichage === 'Ventes' ? 'bold' : 'normal'
            }}
          >
            Entrées
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-3 w-[45%] rounded-2xl items-center justify-center"
          style={{
            backgroundColor: affichage === 'Dépenses' ? '#4C9FF3' : '#F2F2F2'
          }}
          onPress={() => setAffichage('Dépenses')}
        >
          <Text
            style={{
              color: affichage === 'Dépenses' ? '#fff' : '#000',
              fontWeight: affichage === 'Dépenses' ? 'bold' : 'normal'
            }}
          >
            Dépenses
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mt-2 mb-2 items-center justify-between flex-row p-3">
        <TouchableOpacity
          className="p-3 w-[25%] rounded-2xl items-center justify-center"
          onPress={() => setPeriode('Jour')}
          style={{
            backgroundColor:
              periode === 'Jour'
                ? affichage === 'Ventes'
                  ? 'rgba(135,191,248, 0.2)'
                  : 'rgba(343,12,15, 0.2)'
                : '#F2F2F2'
          }}
        >
          <Text
            style={{
              color:
                periode === 'Jour'
                  ? affichage === 'Ventes'
                    ? '#0C7EF3'
                    : '#F30C0F'
                  : '#000',
              fontWeight: periode === 'Jour' ? 'bold' : 'normal'
            }}
          >
            Par jour
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-3 w-[30%] rounded-2xl items-center justify-center"
          style={{
            backgroundColor:
              periode === 'Mois'
                ? affichage === 'Ventes'
                  ? 'rgba(135,191,248, 0.2)'
                  : 'rgba(343,12,15, 0.2)'
                : '#F2F2F2'
          }}
          onPress={() => [setPeriode('Mois')]}
        >
          <Text
            style={{
              color:
                periode === 'Mois'
                  ? affichage === 'Ventes'
                    ? '#0C7EF3'
                    : '#F30C0F'
                  : '#000',
              fontWeight: periode === 'Mois' ? 'bold' : 'normal'
            }}
          >
            Par mois
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-3 w-[30%] rounded-2xl items-center justify-center"
          style={{
            backgroundColor:
              periode === 'Année'
                ? affichage === 'Ventes'
                  ? 'rgba(135,191,248, 0.2)'
                  : 'rgba(343,12,15, 0.2)'
                : '#F2F2F2'
          }}
          onPress={() => setPeriode('Année')}
        >
          <Text
            style={{
              color:
                periode === 'Année'
                  ? affichage === 'Ventes'
                    ? '#0C7EF3'
                    : '#F30C0F'
                  : '#000',
              fontWeight: periode === 'Année' ? 'bold' : 'normal'
            }}
          >
            Par année
          </Text>
        </TouchableOpacity>
      </View>

      {affichage === 'Ventes' ? (
        <ScrollView className="h-full">
          {/* Date swiper */}
          {periode === 'Jour' ? (
            <View>
              <View className="flex-1 max-h-24">
                <ScrollView horizontal={true} ref={scrollViewRef}>
                  {weeks.map((dates, index) => (
                    <View
                      key={index}
                      className="flex-row items-start justify-between mx-[-3] my-3"
                      style={{ paddingHorizontal: 8 }}
                    >
                      {dates.map((date, dateIndex) => {
                        const isActive =
                          value.toDateString() === date.day.toDateString()
                        return (
                          <TouchableWithoutFeedback
                            key={dateIndex}
                            onPress={() => [
                              setValue(date.day)
                              // onChangeDate(
                              //   date.day.toLocaleDateString('fr-FR', options)
                              // )
                            ]}
                          >
                            <View
                              className="flex-1 h-14 w-10 mx-1 py-2 px-0 border border-slate-200 items-center flex-col rounded-lg"
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
                </ScrollView>
              </View>

              <View className="flex-row justify-between mt-2">
                <Text className="text-gray-600 text-sm font-bold">
                  {value.toLocaleDateString('fr-FR', options)}
                </Text>

                <Text className="text-gray-700 font-extrabold">
                  10 000 FCFA
                </Text>
              </View>

              <View className="mt-2">
                <ProgressChart
                  data={data}
                  width={screenWidth}
                  height={220}
                  strokeWidth={16}
                  radius={32}
                  chartConfig={{
                    backgroundGradientFrom: '#fff',
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientTo: '#fff',
                    backgroundGradientToOpacity: 0.5,
                    color: (opacity = 0.3) => `rgba(135,191,248, ${opacity})`,
                    strokeWidth: 2, // optional, default 3
                    barPercentage: 0.5,
                    useShadowColorFromDataset: false // optional
                  }}
                  style={{ left: -50 }}
                  hideLegend={false}
                />
              </View>

              <Text className="font-bold text-lg mb-2">
                Liste des transactions
              </Text>

              {/* Entrée */}
              <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={24}
                    color="white"
                  />
                </View>

                <View className="items-start w-[60%]">
                  <Text className="text-sm font-bold">Dépot</Text>
                </View>

                <View>
                  <Text className="text-sm font-bold">10 800 FCFA</Text>
                </View>
              </View>

              {/* Entrée */}
              <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={24}
                    color="white"
                  />
                </View>

                <View className="items-start w-[60%]">
                  <Text className="text-sm font-bold">Dépot</Text>
                </View>

                <View>
                  <Text className="text-sm font-bold">10 800 FCFA</Text>
                </View>
              </View>

              {/* Entrée */}
              <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={24}
                    color="white"
                  />
                </View>

                <View className="items-start w-[60%]">
                  <Text className="text-sm font-bold">Dépot</Text>
                </View>

                <View>
                  <Text className="text-sm font-bold">10 800 FCFA</Text>
                </View>
              </View>

              {/* Entrée */}
              <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={24}
                    color="white"
                  />
                </View>

                <View className="items-start w-[60%]">
                  <Text className="text-sm font-bold">Dépot</Text>
                </View>

                <View>
                  <Text className="text-sm font-bold">10 800 FCFA</Text>
                </View>
              </View>
            </View>
          ) : periode === 'Mois' ? (
            <View>
              <View className="flex-1 max-h-24">
                <ScrollView horizontal={true} ref={scrollMoisViewRef}>
                  {mois.map((month, index) => {
                    const isActive = currentMois === month.value
                    return (
                      <View
                        key={index}
                        className="flex-row items-start justify-between mx-[-3] my-3"
                        style={{ paddingHorizontal: 8 }}
                      >
                        <TouchableWithoutFeedback
                          onPress={() => setMois(month.value)}
                        >
                          <View
                            className="flex-1 h-14 w-11 mx-1 py-2 px-0 border border-slate-200 items-center justify-center flex-col rounded-lg"
                            style={isActive && { backgroundColor: '#D6D6D6' }}
                          >
                            <Text
                              className="text-gray-500 mb-0"
                              style={isActive && { color: '#111' }}
                            >
                              {month.key}
                            </Text>
                          </View>
                        </TouchableWithoutFeedback>
                      </View>
                    )
                  })}
                </ScrollView>
              </View>

              <View className="flex-row justify-between mt-2">
                <Text className="text-gray-600 text-sm font-bold">
                  {capitalizeFirstLetter(currentMois)}
                </Text>

                <Text className="text-gray-700 font-extrabold">
                  10 000 FCFA
                </Text>
              </View>

              <View className="mt-2">
                <ProgressChart
                  data={data}
                  width={screenWidth}
                  height={220}
                  strokeWidth={16}
                  radius={32}
                  chartConfig={{
                    backgroundGradientFrom: '#fff',
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientTo: '#fff',
                    backgroundGradientToOpacity: 0.5,
                    color: (opacity = 0.3) => `rgba(135,191,248, ${opacity})`,
                    strokeWidth: 2, // optional, default 3
                    barPercentage: 0.5,
                    useShadowColorFromDataset: false // optional
                  }}
                  style={{ left: -50 }}
                  hideLegend={false}
                />
              </View>

              <Text className="font-bold text-lg mb-2">
                Liste des transactions
              </Text>

              {/* Entrée */}
              <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={24}
                    color="white"
                  />
                </View>

                <View className="items-start w-[60%]">
                  <Text className="text-sm font-bold">Dépot</Text>
                </View>

                <View>
                  <Text className="text-sm font-bold">10 800 FCFA</Text>
                </View>
              </View>

              {/* Entrée */}
              <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={24}
                    color="white"
                  />
                </View>

                <View className="items-start w-[60%]">
                  <Text className="text-sm font-bold">Dépot</Text>
                </View>

                <View>
                  <Text className="text-sm font-bold">10 800 FCFA</Text>
                </View>
              </View>

              {/* Entrée */}
              <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={24}
                    color="white"
                  />
                </View>

                <View className="items-start w-[60%]">
                  <Text className="text-sm font-bold">Dépot</Text>
                </View>

                <View>
                  <Text className="text-sm font-bold">10 800 FCFA</Text>
                </View>
              </View>

              {/* Entrée */}
              <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={24}
                    color="white"
                  />
                </View>

                <View className="items-start w-[60%]">
                  <Text className="text-sm font-bold">Dépot</Text>
                </View>

                <View>
                  <Text className="text-sm font-bold">10 800 FCFA</Text>
                </View>
              </View>
            </View>
          ) : periode === 'Année' ? (
            <View>
              <View className="flex-1 max-h-24">
                <ScrollView horizontal={true}>
                  <View
                    //key={index}
                    className="flex-row items-start justify-between mx-[-4] my-3"
                    style={{ paddingHorizontal: 8 }}
                  >
                    <TouchableWithoutFeedback
                    //onPress={() => setMois(month.value)}
                    >
                      <View
                        className="flex-1 h-14 w-11 mx-1 py-2 px-0 border border-slate-200 items-center justify-center flex-col rounded-lg"
                        //style={isActive && { backgroundColor: '#D6D6D6' }}
                      >
                        <Text
                          className="text-gray-500 mb-0"
                          //style={isActive && { color: '#111' }}
                        >
                          2022
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>

                  <View
                    //key={index}
                    className="flex-row items-start justify-between mx-[-4] my-3"
                    style={{ paddingHorizontal: 8 }}
                  >
                    <TouchableWithoutFeedback
                    //onPress={() => setMois(month.value)}
                    >
                      <View
                        className="flex-1 h-14 w-11 mx-1 py-2 px-0 border border-slate-200 items-center justify-center flex-col rounded-lg"
                        //style={isActive && { backgroundColor: '#D6D6D6' }}
                      >
                        <Text
                          className="text-gray-500 mb-0"
                          //style={isActive && { color: '#111' }}
                        >
                          2023
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>

                  <View
                    //key={index}
                    className="flex-row items-start justify-between mx-[-4] my-3"
                    style={{ paddingHorizontal: 8 }}
                  >
                    <TouchableWithoutFeedback
                    //onPress={() => setMois(month.value)}
                    >
                      <View
                        className="flex-1 bg-[#D6D6D6] h-14 w-11 mx-1 py-2 px-0 border border-slate-200 items-center justify-center flex-col rounded-lg"
                        //style={isActive && { backgroundColor: '#D6D6D6' }}
                      >
                        <Text
                          className="text-gray-500 mb-0"
                          //style={isActive && { color: '#111' }}
                        >
                          2024
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </ScrollView>
              </View>

              <View className="flex-row justify-between mt-2">
                <Text className="text-gray-600 text-sm font-bold">2024</Text>

                <Text className="text-gray-700 font-extrabold">
                  10 000 FCFA
                </Text>
              </View>

              <View className="mt-2">
                <ProgressChart
                  data={data}
                  width={screenWidth}
                  height={220}
                  strokeWidth={16}
                  radius={32}
                  chartConfig={{
                    backgroundGradientFrom: '#fff',
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientTo: '#fff',
                    backgroundGradientToOpacity: 0.5,
                    color: (opacity = 0.3) => `rgba(135,191,248, ${opacity})`,
                    strokeWidth: 2, // optional, default 3
                    barPercentage: 0.5,
                    useShadowColorFromDataset: false // optional
                  }}
                  style={{ left: -50 }}
                  hideLegend={false}
                />
              </View>

              <Text className="font-bold text-lg mb-2">
                Liste des transactions
              </Text>

              {/* Entrée */}
              <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={24}
                    color="white"
                  />
                </View>

                <View className="items-start w-[60%]">
                  <Text className="text-sm font-bold">Dépot</Text>
                </View>

                <View>
                  <Text className="text-sm font-bold">10 800 FCFA</Text>
                </View>
              </View>

              {/* Entrée */}
              <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={24}
                    color="white"
                  />
                </View>

                <View className="items-start w-[60%]">
                  <Text className="text-sm font-bold">Dépot</Text>
                </View>

                <View>
                  <Text className="text-sm font-bold">10 800 FCFA</Text>
                </View>
              </View>

              {/* Entrée */}
              <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={24}
                    color="white"
                  />
                </View>

                <View className="items-start w-[60%]">
                  <Text className="text-sm font-bold">Dépot</Text>
                </View>

                <View>
                  <Text className="text-sm font-bold">10 800 FCFA</Text>
                </View>
              </View>

              {/* Entrée */}
              <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={24}
                    color="white"
                  />
                </View>

                <View className="items-start w-[60%]">
                  <Text className="text-sm font-bold">Dépot</Text>
                </View>

                <View>
                  <Text className="text-sm font-bold">10 800 FCFA</Text>
                </View>
              </View>
            </View>
          ) : null}
          {/* Progress Chart */}
        </ScrollView>
      ) : affichage === 'Dépenses' ? (
        <ScrollView className="h-full">
          {/* Date swiper */}
          {periode === 'Jour' ? (
            <View>
              <View className="flex-1 max-h-24">
                <ScrollView horizontal={true} ref={scrollViewRef}>
                  {weeks.map((dates, index) => (
                    <View
                      key={index}
                      className="flex-row items-start justify-between mx-[-3] my-3"
                      style={{ paddingHorizontal: 8 }}
                    >
                      {dates.map((date, dateIndex) => {
                        const isActive =
                          value.toDateString() === date.day.toDateString()
                        return (
                          <TouchableWithoutFeedback
                            key={dateIndex}
                            onPress={() => [
                              setValue(date.day)
                              // onChangeDate(
                              //   date.day.toLocaleDateString('fr-FR', options)
                              // )
                            ]}
                          >
                            <View
                              className="flex-1 h-14 w-10 mx-1 py-2 px-0 border border-slate-200 items-center flex-col rounded-lg"
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
                </ScrollView>
              </View>

              <View className="flex-row justify-between mt-2">
                <Text className="text-gray-600 text-sm font-bold">
                  {value.toLocaleDateString('fr-FR', options)}
                </Text>

                <Text className="text-[#F30C0F] font-extrabold">
                  10 000 FCFA
                </Text>
              </View>

              <View className="mt-2">
                <ProgressChart
                  data={data}
                  width={screenWidth}
                  height={220}
                  strokeWidth={16}
                  radius={32}
                  chartConfig={{
                    backgroundGradientFrom: '#fff',
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientTo: '#fff',
                    backgroundGradientToOpacity: 0.5,
                    color: (opacity = 0.3) => `rgba(243,12,15, ${opacity})`,
                    strokeWidth: 2, // optional, default 3
                    barPercentage: 0.5,
                    useShadowColorFromDataset: false // optional
                  }}
                  style={{ left: -50 }}
                  hideLegend={false}
                />
              </View>

              <Text className="font-bold text-lg mb-2">
                Liste des transactions
              </Text>

              <View>
                {/* Dépense */}
                <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                  <View className="bg-red-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                    <MaterialCommunityIcons
                      name="cash-minus"
                      size={24}
                      color="white"
                    />
                  </View>

                  <View className="items-start w-[60%]">
                    <Text className="text-sm font-bold">Transport</Text>
                  </View>

                  <View>
                    <Text className="text-sm font-bold">-800 FCFA</Text>
                  </View>
                </View>

                {/* Dépense */}
                <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                  <View className="bg-red-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                    <MaterialCommunityIcons
                      name="cash-minus"
                      size={24}
                      color="white"
                    />
                  </View>

                  <View className="items-start w-[60%]">
                    <Text className="text-sm font-bold">Transport</Text>
                  </View>

                  <View>
                    <Text className="text-sm font-bold">-800 FCFA</Text>
                  </View>
                </View>
              </View>

            </View>
          ) : periode === 'Mois' ? (
            <View>
              <View className="flex-1 max-h-24">
                <ScrollView horizontal={true} ref={scrollMoisViewRef}>
                  {mois.map((month, index) => {
                    const isActive = currentMois === month.value
                    return (
                      <View
                        key={index}
                        className="flex-row items-start justify-between mx-[-3] my-3"
                        style={{ paddingHorizontal: 8 }}
                      >
                        <TouchableWithoutFeedback
                          onPress={() => setMois(month.value)}
                        >
                          <View
                            className="flex-1 h-14 w-11 mx-1 py-2 px-0 border border-slate-200 items-center justify-center flex-col rounded-lg"
                            style={isActive && { backgroundColor: '#D6D6D6' }}
                          >
                            <Text
                              className="text-gray-500 mb-0"
                              style={isActive && { color: '#111' }}
                            >
                              {month.key}
                            </Text>
                          </View>
                        </TouchableWithoutFeedback>
                      </View>
                    )
                  })}
                </ScrollView>
              </View>

              <View className="flex-row justify-between mt-2">
                <Text className="text-gray-600 text-sm font-bold">
                  {capitalizeFirstLetter(currentMois)}
                </Text>

                <Text className="text-[#F30C0F] font-extrabold">
                  10 000 FCFA
                </Text>
              </View>

              {/* ProgressChart */}
              <View className="mt-2">
                <ProgressChart
                  data={data}
                  width={screenWidth}
                  height={220}
                  strokeWidth={16}
                  radius={32}
                  chartConfig={{
                    backgroundGradientFrom: '#fff',
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientTo: '#fff',
                    backgroundGradientToOpacity: 0.5,
                    color: (opacity = 0.3) => `rgba(243,12,15, ${opacity})`,
                    strokeWidth: 2, // optional, default 3
                    barPercentage: 0.5,
                    useShadowColorFromDataset: false // optional
                  }}
                  style={{ left: -50 }}
                  hideLegend={false}
                />
              </View>

              <Text className="font-bold text-lg mb-2">
                Liste des transactions
              </Text>

              <View>
                {/* Dépense */}
                <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                  <View className="bg-red-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                    <MaterialCommunityIcons
                      name="cash-minus"
                      size={24}
                      color="white"
                    />
                  </View>

                  <View className="items-start w-[60%]">
                    <Text className="text-sm font-bold">Transport</Text>
                  </View>

                  <View>
                    <Text className="text-sm font-bold">-800 FCFA</Text>
                  </View>
                </View>

                {/* Dépense */}
                <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                  <View className="bg-red-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                    <MaterialCommunityIcons
                      name="cash-minus"
                      size={24}
                      color="white"
                    />
                  </View>

                  <View className="items-start w-[60%]">
                    <Text className="text-sm font-bold">Transport</Text>
                  </View>

                  <View>
                    <Text className="text-sm font-bold">-800 FCFA</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : periode === 'Année' ? (
            <View>
              <View className="flex-1 max-h-24">
                <ScrollView horizontal={true}>
                  <View
                    //key={index}
                    className="flex-row items-start justify-between mx-[-4] my-3"
                    style={{ paddingHorizontal: 8 }}
                  >
                    <TouchableWithoutFeedback
                    //onPress={() => setMois(month.value)}
                    >
                      <View
                        className="flex-1 h-14 w-11 mx-1 py-2 px-0 border border-slate-200 items-center justify-center flex-col rounded-lg"
                        //style={isActive && { backgroundColor: '#D6D6D6' }}
                      >
                        <Text
                          className="text-gray-500 mb-0"
                          //style={isActive && { color: '#111' }}
                        >
                          2022
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>

                  <View
                    //key={index}
                    className="flex-row items-start justify-between mx-[-4] my-3"
                    style={{ paddingHorizontal: 8 }}
                  >
                    <TouchableWithoutFeedback
                    //onPress={() => setMois(month.value)}
                    >
                      <View
                        className="flex-1 h-14 w-11 mx-1 py-2 px-0 border border-slate-200 items-center justify-center flex-col rounded-lg"
                        //style={isActive && { backgroundColor: '#D6D6D6' }}
                      >
                        <Text
                          className="text-gray-500 mb-0"
                          //style={isActive && { color: '#111' }}
                        >
                          2023
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>

                  <View
                    //key={index}
                    className="flex-row items-start justify-between mx-[-4] my-3"
                    style={{ paddingHorizontal: 8 }}
                  >
                    <TouchableWithoutFeedback
                    //onPress={() => setMois(month.value)}
                    >
                      <View
                        className="flex-1 bg-[#D6D6D6] h-14 w-11 mx-1 py-2 px-0 border border-slate-200 items-center justify-center flex-col rounded-lg"
                        //style={isActive && { backgroundColor: '#D6D6D6' }}
                      >
                        <Text
                          className="text-gray-500 mb-0"
                          //style={isActive && { color: '#111' }}
                        >
                          2024
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </ScrollView>
              </View>

              <View className="flex-row justify-between mt-2">
                <Text className="text-gray-600 text-sm font-bold">2024</Text>

                <Text className="text-[#F30C0F] font-extrabold">
                  10 000 FCFA
                </Text>
              </View>

              {/* ProgressChart */}
              <View className="mt-2">
                <ProgressChart
                  data={data}
                  width={screenWidth}
                  height={220}
                  strokeWidth={16}
                  radius={32}
                  chartConfig={{
                    backgroundGradientFrom: '#fff',
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientTo: '#fff',
                    backgroundGradientToOpacity: 0.5,
                    color: (opacity = 0.3) => `rgba(243,12,15, ${opacity})`,
                    strokeWidth: 2, // optional, default 3
                    barPercentage: 0.5,
                    useShadowColorFromDataset: false // optional
                  }}
                  style={{ left: -50 }}
                  hideLegend={false}
                />
              </View>

              <Text className="font-bold text-lg mb-2">
                Liste des transactions
              </Text>

              <View>
                {/* Dépense */}
                <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                  <View className="bg-red-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                    <MaterialCommunityIcons
                      name="cash-minus"
                      size={24}
                      color="white"
                    />
                  </View>

                  <View className="items-start w-[60%]">
                    <Text className="text-sm font-bold">Transport</Text>
                  </View>

                  <View>
                    <Text className="text-sm font-bold">-800 FCFA</Text>
                  </View>
                </View>

                {/* Dépense */}
                <View className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full">
                  <View className="bg-red-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                    <MaterialCommunityIcons
                      name="cash-minus"
                      size={24}
                      color="white"
                    />
                  </View>

                  <View className="items-start w-[60%]">
                    <Text className="text-sm font-bold">Transport</Text>
                  </View>

                  <View>
                    <Text className="text-sm font-bold">-800 FCFA</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}
          {/* Progress Chart */}
        </ScrollView>
      ) : null}
    </View>
  )
}

export default Statistique
