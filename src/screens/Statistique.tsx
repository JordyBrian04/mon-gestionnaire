import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import { ProgressChart } from 'react-native-chart-kit'
import moment from 'moment'
import Swiper from 'react-native-swiper'

const Statistique = () => {
  const [affichage, setAffichage] = useState('Ventes')
  const [periode, setPeriode] = useState('Jour')
  const [value, setValue] = useState(new Date())
  const [week, setWeek] = useState(0)
  const swiper = useRef()
  const screenWidth = Dimensions.get('window').width

  const data = {
    labels: ['Transport', 'Nourriture', 'Autre'], // optional
    data: [0.4, 0.6, 0.8]
  }

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
            Ventes
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
              periode === 'Jour' ? 'rgba(135,191,248, 0.2)' : '#F2F2F2'
          }}
        >
          <Text
            style={{
              color: periode === 'Jour' ? '#0C7EF3' : '#000',
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
              periode === 'Mois' ? 'rgba(135,191,248, 0.2)' : '#F2F2F2'
          }}
          onPress={() => setPeriode('Mois')}
        >
          <Text
            style={{
              color: periode === 'Mois' ? '#0C7EF3' : '#000',
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
              periode === 'Année' ? 'rgba(135,191,248, 0.2)' : '#F2F2F2'
          }}
          onPress={() => setPeriode('Année')}
        >
          <Text
            style={{
              color: periode === 'Année' ? '#0C7EF3' : '#000',
              fontWeight: periode === 'Année' ? 'bold' : 'normal'
            }}
          >
            Par année
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="h-full">
        {/* Date swiper */}
        {periode === 'Jour' ? (
          <View>
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
                            setValue(date.day)
                            // onChangeDate(
                            //   date.day.toLocaleDateString('fr-FR', options)
                            // )
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
                  useShadowColorFromDataset: false, // optional
                }}
                style={{left: -50}}
                hideLegend={false}
              />
            </View>
          </View>
        ) : periode === 'Mois' ? (
          <View></View>
        ) : periode === 'Année' ? (
          <View></View>
        ) : null}
        {/* Progress Chart */}
      </ScrollView>
    </View>
  )
}

export default Statistique
