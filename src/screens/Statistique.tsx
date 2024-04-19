import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
  RefreshControl
} from 'react-native'
import React, {
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useEffect
} from 'react'
import { BarChart, ProgressChart } from 'react-native-chart-kit'
import moment from 'moment'
import Swiper from 'react-native-swiper'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { initDatabase } from '../components/database'
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet'

const {height: SCREEN_HEIGHT} = Dimensions.get('window')
const {width: SCREEN_WIDTH} = Dimensions.get('window')
const db = initDatabase()

const Statistique = () => {
  const [affichage, setAffichage] = useState('Ventes')
  const [periode, setPeriode] = useState('Jour')
  const [value, setValue] = useState(new Date())
  const [currentMois, setMois] = useState('')
  const [currentAnnee, setAnnee] = useState(value.getFullYear())
  const [annees, setAnneeArray] = useState<any[]>([])
  const [datas, setDatas] = useState<any[]>([])
  const [old_data, setOldData] = useState<any[]>([])
  const [allDepenses, setAllDepense] = useState<any[]>([])
  const [depenses, setDepense] = useState<any[]>([])
  const [soldeDay, setSoldeDay] = useState(0)
  const scrollViewRef: any = useRef()
  const scrollMoisViewRef: any = useRef()
  const screenWidth = Dimensions.get('window').width
  const [refresh, setRefreshing] = useState(false)
  const [datesVente, setDatesVente] = useState<any[]>([])
  const [datesDepense, setDatesDepense] = useState<any[]>([])
  const [labels, setLabels] = useState<any[]>([])
  const [labelsValue, setLabelsValue] = useState<any[]>([])
  const [depenseValue, setDepenseValue] = useState<any[]>([])
  const bottomSheetModalRef:any = useRef(null)
  const snapPoint = ['25%','50%','75%', '90%', '95%']
  const [open, setOpen] = useState(false)
  const [dataJourPlus, setDataJourPlus] = useState<any[]>([])
  const [dataJourMoins, setDataJourMoins] = useState<any[]>([])
  const [dataMoisPlus, setDataMoisPlus] = useState<any[]>([])
  const [dataMoisMoins, setDataMoisMoins] = useState<any[]>([])
  const [dataAnneePlus, setDataAnneePlus] = useState<any[]>([])
  const [dataAnneeMoins, setDataAnneeMoins] = useState<any[]>([])

  // const data = {
  //   labels: ['Transport', 'Nourriture', 'Autre'], // optional
  //   data: [0.4, 0.6, 0.8]
  // }

  const showModal = () => {
    //translateY.value = withSpring(-SCREEN_HEIGHT/3, {damping: 50})
    bottomSheetModalRef.current?.present()
    setOpen(true)
  }

  const refreshing = () => {
    setRefreshing(true)

    getData()

    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }

  const getData = async () => {
    setSoldeDay(0)
    setOldData([])
    setDatas([])
    setAnneeArray([])

    await db.transaction(tx => {
      tx.executeSql(
        `SELECT description, montant, dates FROM transactions WHERE type_transaction='Entrée'`,
        [],
        (_, result) => {
          setSoldeDay(
            result.rows._array
              .filter(row => row.dates === value.toISOString().substring(0, 10))
              .map(datas => datas.montant)
              .reduce((a, b) => a + b, 0)
          )

          setOldData(result.rows._array)

          setDatas(
            result.rows._array
              .filter(row => row.dates === value.toISOString().substring(0, 10))
              .map(datas => ({
                dates: datas.dates,
                description: datas.description,
                montant: datas.montant
              }))
          )

          // setAnneeArray(
          //   result.rows._array.map(item => new Date(item.dates).getFullYear())
          // )

          const uniqueTypes = new Set()

          // Parcourir les données et ajouter chaque type_depense à l'ensemble
          result.rows._array.forEach(item => {
            uniqueTypes.add(new Date(item.dates).getFullYear())
          })

          // Convertir l'ensemble en tableau pour l'affichage ou le traitement ultérieur
          const uniqueTypesArray = Array.from(uniqueTypes)

          setAnneeArray(uniqueTypesArray)
          //console.log('annee ',uniqueTypesArray)
        },
        (_, err) => {
          console.error(err)
          return false
        }
      )
      tx.executeSql(
        `SELECT DISTINCT dates FROM transactions WHERE type_transaction='Entrée' ORDER BY dates ASC`,
        [],
        (_, result) => {
          setDatesVente(result.rows._array)
        },
        (_, err) => {
          console.error(err)
          return false
        }
      )
      tx.executeSql(
        `SELECT description, montant, dates, type_depense FROM transactions WHERE type_transaction='Dépense'`,
        [],
        (_, result) => {
          //console.log(result.rows._array);
          setDepense(result.rows._array)
        },
        (_, err) => {
          console.error(err)
          return false
        }
      )
      tx.executeSql(
        `SELECT DISTINCT dates FROM transactions WHERE type_transaction='Dépense' ORDER BY dates ASC`,
        [],
        (_, result) => {
          setDatesDepense(result.rows._array)
        },
        (_, err) => {
          console.error(err)
          return false
        }
      )
      tx.executeSql(
        `SELECT dates, SUM(montant) AS total_montant
        FROM transactions
        WHERE type_transaction='Dépense'
        GROUP BY dates
        ORDER BY total_montant DESC
        LIMIT 1;`,
        [],
        (_, result) => {
          setDataJourPlus(result.rows._array)
        },
        (_, err) => {
          console.error(err)
          return false
        }
      )
      tx.executeSql(
        `SELECT dates, SUM(montant) AS total_montant
        FROM transactions
        WHERE type_transaction='Dépense'
        GROUP BY dates
        ORDER BY total_montant ASC
        LIMIT 1;`,
        [],
        (_, result) => {
          setDataJourMoins(result.rows._array)
        },
        (_, err) => {
          console.error(err)
          return false
        }
      )
      tx.executeSql(
        `WITH monthly_totals AS (
          SELECT strftime('%Y-%m', dates) AS month, SUM(montant) AS total_montant
          FROM transactions
          WHERE type_transaction='Dépense'
          GROUP BY strftime('%Y-%m', dates)
        ),
        max_total AS (
            SELECT month, total_montant
            FROM monthly_totals
            ORDER BY total_montant DESC
            LIMIT 1
        )
        SELECT * FROM max_total;`,
        [],
        (_, result) => {
          //setDataJourMoins(result.rows._array)
          setDataMoisPlus(result.rows._array)
        },
        (_, err) => {
          console.error(err)
          return false
        }
      )
      tx.executeSql(
        `WITH monthly_totals AS (
          SELECT strftime('%Y-%m', dates) AS month, SUM(montant) AS total_montant
          FROM transactions
          WHERE type_transaction='Dépense'
          GROUP BY strftime('%Y-%m', dates)
        ),
        max_total AS (
            SELECT month, total_montant
            FROM monthly_totals
            ORDER BY total_montant ASC
            LIMIT 1
        )
        SELECT * FROM max_total;`,
        [],
        (_, result) => {
          //setDataJourMoins(result.rows._array)
          setDataMoisMoins(result.rows._array)
          //console.log(result.rows._array)
        },
        (_, err) => {
          console.error(err)
          return false
        }
      )
      tx.executeSql(
        `WITH monthly_totals AS (
          SELECT strftime('%Y', dates) AS annee, SUM(montant) AS total_montant
          FROM transactions
          WHERE type_transaction='Dépense'
          GROUP BY strftime('%Y', dates)
        ),
        max_total AS (
            SELECT annee, total_montant
            FROM monthly_totals
            ORDER BY total_montant DESC
            LIMIT 1
        )
        SELECT * FROM max_total;`,
        [],
        (_, result) => {
          setDataAnneePlus(result.rows._array)
          console.log(result.rows._array)
        },
        (_, err) => {
          console.error(err)
          return false
        }
      )
      tx.executeSql(
        `WITH monthly_totals AS (
          SELECT strftime('%Y', dates) AS annee, SUM(montant) AS total_montant
          FROM transactions
          WHERE type_transaction='Dépense'
          GROUP BY strftime('%Y', dates)
        ),
        max_total AS (
            SELECT annee, total_montant
            FROM monthly_totals
            ORDER BY total_montant ASC
            LIMIT 1
        )
        SELECT * FROM max_total;`,
        [],
        (_, result) => {
          setDataAnneeMoins(result.rows._array)
          console.log(result.rows._array)
        },
        (_, err) => {
          console.error(err)
          return false
        }
      )
    })
  }

  const onChangeAffichage = (aff: any) => {
    setAffichage(aff)
    onChangePeriode('Jour', aff)
  }

  const onChangePeriode = (p: any, af: any) => {
    setPeriode(p)
    //console.log(af)

    if (af === 'Ventes') {
      if (p === 'Jour') {
        setDatas(
          old_data
            .filter(data => data.dates === value.toISOString().substring(0, 10))
            .map(row => ({
              dates: row.dates,
              description: row.description,
              montant: row.montant
            }))
        )

        setSoldeDay(
          old_data
            .filter(row => row.dates === value.toISOString().substring(0, 10))
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        )
      }

      if (p === 'Mois') {
        setDatas(
          old_data
            .filter(data => {
              const date = new Date(data.dates)
              return (
                date.toLocaleDateString('fr-FR', optionsMois) === currentMois
              )
            })
            .map(row => ({
              dates: row.dates,
              description: row.description,
              montant: row.montant
            }))
        )

        setSoldeDay(
          old_data
            .filter(row => {
              const date = new Date(row.dates)
              return (
                date.toLocaleDateString('fr-FR', optionsMois) === currentMois
              )
            })
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        )
      }

      if (p === 'Année') {
        setDatas(
          old_data
            .filter(data => {
              const date = new Date(data.dates)
              return date.getFullYear() === currentAnnee
            })
            .map(row => ({
              dates: row.dates,
              description: row.description,
              montant: row.montant
            }))
        )

        setSoldeDay(
          old_data
            .filter(row => {
              const date = new Date(row.dates)
              return date.getFullYear() === currentAnnee
            })
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        )
      }
    }

    if (af === 'Dépenses') {
      if (p === 'Jour') {
        setDatas(
          depenses
            .filter(data => data.dates === value.toISOString().substring(0, 10))
            .map(row => ({
              dates: row.dates,
              description: row.description,
              montant: row.montant
            }))
        )

        setSoldeDay(
          depenses
            .filter(row => row.dates === value.toISOString().substring(0, 10))
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        )

        const soldDay = depenses
          .filter(row => row.dates === value.toISOString().substring(0, 10))
          .map(datas => datas.montant)
          .reduce((a, b) => a + b, 0)

        const uniqueTypes = new Set()

        // Parcourir les données et ajouter chaque type_depense à l'ensemble
        depenses
          .filter(row => row.dates === value.toISOString().substring(0, 10))
          .forEach(item => {
            uniqueTypes.add(item.type_depense)
          })

        // Convertir l'ensemble en tableau pour l'affichage ou le traitement ultérieur
        const uniqueTypesArray = Array.from(uniqueTypes)

        setLabels(uniqueTypesArray)

        const dayData = depenses
          .filter(data => data.dates === value.toISOString().substring(0, 10))
          .map(row => ({
            dates: row.dates,
            description: row.description,
            montant: row.montant,
            type_depense: row.type_depense
          }))

        const filteredData = uniqueTypesArray.map(unique => {
          return dayData
            .filter(item => item.type_depense === unique)
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        })

        // console.log(
        //   filteredData.map(f => Math.round((f / soldDay) * 100) / 100)
        // )

        setLabelsValue(
          filteredData.map(f => Math.round((f / soldDay) * 100) / 100)
        )

        setDepenseValue(filteredData.map(f => f))
        //console.log(filteredData)
      }

      if (p === 'Mois') {
        setDatas(
          depenses
            .filter(data => {
              const date = new Date(data.dates)
              return (
                date.toLocaleDateString('fr-FR', optionsMois) === currentMois
              )
            })
            .map(row => ({
              dates: row.dates,
              description: row.description,
              montant: row.montant
            }))
        )

        setSoldeDay(
          depenses
            .filter(row => {
              const date = new Date(row.dates)
              return (
                date.toLocaleDateString('fr-FR', optionsMois) === currentMois
              )
            })
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        )

        const uniqueTypes = new Set()

        // Parcourir les données et ajouter chaque type_depense à l'ensemble
        depenses
          .filter(row => {
            const date = new Date(row.dates)
            return date.toLocaleDateString('fr-FR', optionsMois) === currentMois
          })
          .forEach(item => {
            uniqueTypes.add(item.type_depense)
          })

        // Convertir l'ensemble en tableau pour l'affichage ou le traitement ultérieur
        const uniqueTypesArray = Array.from(uniqueTypes)

        setLabels(uniqueTypesArray)

        const soldDay = depenses
          .filter(row => {
            const date = new Date(row.dates)
            return date.toLocaleDateString('fr-FR', optionsMois) === currentMois
          })
          .map(datas => datas.montant)
          .reduce((a, b) => a + b, 0)

        const dayData = depenses
          .filter(row => {
            const date = new Date(row.dates)
            return date.toLocaleDateString('fr-FR', optionsMois) === currentMois
          })
          .map(row => ({
            dates: row.dates,
            description: row.description,
            montant: row.montant,
            type_depense: row.type_depense
          }))

        const filteredData = uniqueTypesArray.map(unique => {
          return dayData
            .filter(item => item.type_depense === unique)
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        })

        console.log(
          filteredData.map(f => Math.round((f / soldDay) * 100) / 100)
        )

        setLabelsValue(
          filteredData.map(f => Math.round((f / soldDay) * 100) / 100)
        )

        setDepenseValue(filteredData.map(f => f))
      }

      if (p === 'Année') {
        setDatas(
          depenses
            .filter(data => {
              const date = new Date(data.dates)
              return date.getFullYear() === currentAnnee
            })
            .map(row => ({
              dates: row.dates,
              description: row.description,
              montant: row.montant
            }))
        )

        setSoldeDay(
          depenses
            .filter(row => {
              const date = new Date(row.dates)
              return date.getFullYear() === currentAnnee
            })
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        )

        const uniqueTypes = new Set()

        // Parcourir les données et ajouter chaque type_depense à l'ensemble
        depenses
          .filter(row => {
            const date = new Date(row.dates)
            return date.getFullYear() === currentAnnee
          })
          .forEach(item => {
            uniqueTypes.add(item.type_depense)
          })

        // Convertir l'ensemble en tableau pour l'affichage ou le traitement ultérieur
        const uniqueTypesArray = Array.from(uniqueTypes)

        setLabels(uniqueTypesArray)

        const soldDay = depenses
          .filter(row => {
            const date = new Date(row.dates)
            return date.getFullYear() === currentAnnee
          })
          .map(datas => datas.montant)
          .reduce((a, b) => a + b, 0)

        const dayData = depenses
          .filter(row => {
            const date = new Date(row.dates)
            return date.getFullYear() === currentAnnee
          })
          .map(row => ({
            dates: row.dates,
            description: row.description,
            montant: row.montant,
            type_depense: row.type_depense
          }))

        const filteredData = uniqueTypesArray.map(unique => {
          return dayData
            .filter(item => item.type_depense === unique)
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        })

        console.log(
          filteredData.map(f => Math.round((f / soldDay) * 100) / 100)
        )

        setLabelsValue(
          filteredData.map(f => Math.round((f / soldDay) * 100) / 100)
        )

        setDepenseValue(filteredData.map(f => f))
      }
    }
  }

  const handleOnDateChange = (val: any) => {
    if (affichage === 'Ventes') {
      if (periode === 'Jour') {
        setSoldeDay(
          old_data
            .filter(row => row.dates === val.toISOString().substring(0, 10))
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        )

        setDatas(
          old_data
            .filter(row => row.dates === val.toISOString().substring(0, 10))
            .map(datas => ({
              dates: datas.dates,
              description: datas.description,
              montant: datas.montant
            }))
        )
      }

      if (periode === 'Mois') {
        setSoldeDay(
          old_data
            .filter(row => {
              const date = new Date(row.dates)
              return date.toLocaleDateString('fr-FR', optionsMois) === val
            })
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        )

        const uniqueTypes = new Set()

        // Parcourir les données et ajouter chaque type_depense à l'ensemble
        old_data
          .filter(row => {
            const date = new Date(row.dates)
            return date.toLocaleDateString('fr-FR', optionsMois) === val
          })
          .forEach(item => {
            uniqueTypes.add(item.dates)
          })

        // Convertir l'ensemble en tableau pour l'affichage ou le traitement ultérieur
        const uniqueTypesArray = Array.from(uniqueTypes)

        setDatesVente(
          uniqueTypesArray.map(uniqueTypes => ({
            dates: uniqueTypes
          }))
        )

        //console.log(uniqueTypesArray.map((uniqueTypes:any) => new Date(uniqueTypes)))

        setDatas(
          old_data
            .filter(data => {
              const date = new Date(data.dates)
              return date.toLocaleDateString('fr-FR', optionsMois) === val
            })
            .map(row => ({
              dates: row.dates,
              description: row.description,
              montant: row.montant
            }))
        )
      }

      if (periode === 'Année') {
        setSoldeDay(
          old_data
            .filter(row => {
              const date = new Date(row.dates)
              return date.getFullYear() === val
            })
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        )

        setDatas(
          old_data
            .filter(data => {
              const date = new Date(data.dates)
              return date.getFullYear() === val
            })
            .map(row => ({
              dates: row.dates,
              description: row.description,
              montant: row.montant
            }))
        )
      }
    }

    if (affichage === 'Dépenses') {
      if (periode === 'Jour') {
        setSoldeDay(
          depenses
            .filter(row => row.dates === val.toISOString().substring(0, 10))
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        )

        setDatas(
          depenses
            .filter(row => row.dates === val.toISOString().substring(0, 10))
            .map(datas => ({
              dates: datas.dates,
              description: datas.description,
              montant: datas.montant
            }))
        )

        const soldDay = depenses
          .filter(row => row.dates === val.toISOString().substring(0, 10))
          .map(datas => datas.montant)
          .reduce((a, b) => a + b, 0)

        const uniqueTypes = new Set()

        // Parcourir les données et ajouter chaque type_depense à l'ensemble
        depenses
          .filter(row => row.dates === val.toISOString().substring(0, 10))
          .forEach(item => {
            uniqueTypes.add(item.type_depense)
          })

        // Convertir l'ensemble en tableau pour l'affichage ou le traitement ultérieur
        const uniqueTypesArray = Array.from(uniqueTypes)

        setLabels(uniqueTypesArray)

        const dayData = depenses
          .filter(data => data.dates === val.toISOString().substring(0, 10))
          .map(row => ({
            dates: row.dates,
            description: row.description,
            montant: row.montant,
            type_depense: row.type_depense
          }))

        const filteredData = uniqueTypesArray.map(unique => {
          return dayData
            .filter(item => item.type_depense === unique)
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        })

        // console.log(
        //   filteredData.map(f => Math.round((f / soldDay) * 100) / 100)
        // )

        setLabelsValue(
          filteredData.map(f => Math.round((f / soldDay) * 100) / 100)
        )

        setDepenseValue(filteredData.map(f => f))
      }

      if (periode === 'Mois') {
        setSoldeDay(
          depenses
            .filter(row => {
              const date = new Date(row.dates)
              return date.toLocaleDateString('fr-FR', optionsMois) === val
            })
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        )

        const uniqueTypes = new Set()

        // Parcourir les données et ajouter chaque type_depense à l'ensemble
        depenses
          .filter(row => {
            const date = new Date(row.dates)
            return date.toLocaleDateString('fr-FR', optionsMois) === val
          })
          .forEach(item => {
            uniqueTypes.add(item.dates)
          })

        // Convertir l'ensemble en tableau pour l'affichage ou le traitement ultérieur
        const uniqueTypesArray = Array.from(uniqueTypes)

        setDatesVente(
          uniqueTypesArray.map(uniqueTypes => ({
            dates: uniqueTypes
          }))
        )

        //console.log(uniqueTypesArray.map((uniqueTypes:any) => new Date(uniqueTypes)))

        setDatas(
          depenses
            .filter(data => {
              const date = new Date(data.dates)
              return date.toLocaleDateString('fr-FR', optionsMois) === val
            })
            .map(row => ({
              dates: row.dates,
              description: row.description,
              montant: row.montant
            }))
        )

        const soldDay = depenses
          .filter(row => {
            const date = new Date(row.dates)
            return date.toLocaleDateString('fr-FR', optionsMois) === val
          })
          .map(datas => datas.montant)
          .reduce((a, b) => a + b, 0)

        const uniqueTypes1 = new Set()

        // Parcourir les données et ajouter chaque type_depense à l'ensemble
        depenses
          .filter(row => {
            const date = new Date(row.dates)
            return date.toLocaleDateString('fr-FR', optionsMois) === val
          })
          .forEach(item => {
            uniqueTypes1.add(item.type_depense)
          })

        // Convertir l'ensemble en tableau pour l'affichage ou le traitement ultérieur
        const uniqueTypesArray1 = Array.from(uniqueTypes1)

        setLabels(uniqueTypesArray1)

        const dayData = depenses
          .filter(row => {
            const date = new Date(row.dates)
            return date.toLocaleDateString('fr-FR', optionsMois) === val
          })
          .map(row => ({
            dates: row.dates,
            description: row.description,
            montant: row.montant,
            type_depense: row.type_depense
          }))

        const filteredData = uniqueTypesArray1.map(unique => {
          return dayData
            .filter(item => item.type_depense === unique)
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        })

        // console.log(
        //   filteredData.map(f => Math.round((f / soldDay) * 100) / 100)
        // )

        setLabelsValue(
          filteredData.map(f => Math.round((f / soldDay) * 100) / 100)
        )

        setDepenseValue(filteredData.map(f => f))
      }

      if (periode === 'Année') {
        setSoldeDay(
          depenses
            .filter(row => {
              const date = new Date(row.dates)
              return date.getFullYear() === val
            })
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        )

        setDatas(
          depenses
            .filter(data => {
              const date = new Date(data.dates)
              return date.getFullYear() === val
            })
            .map(row => ({
              dates: row.dates,
              description: row.description,
              montant: row.montant
            }))
        )

        const soldDay = depenses
          .filter(row => {
            const date = new Date(row.dates)
            return date.getFullYear() === val
          })
          .map(datas => datas.montant)
          .reduce((a, b) => a + b, 0)

        const uniqueTypes1 = new Set()

        // Parcourir les données et ajouter chaque type_depense à l'ensemble
        depenses
          .filter(row => {
            const date = new Date(row.dates)
            return date.getFullYear() === val
          })
          .forEach(item => {
            uniqueTypes1.add(item.type_depense)
          })

        // Convertir l'ensemble en tableau pour l'affichage ou le traitement ultérieur
        const uniqueTypesArray1 = Array.from(uniqueTypes1)

        setLabels(uniqueTypesArray1)

        const dayData = depenses
          .filter(row => {
            const date = new Date(row.dates)
            return date.getFullYear() === val
          })
          .map(row => ({
            dates: row.dates,
            description: row.description,
            montant: row.montant,
            type_depense: row.type_depense
          }))

        const filteredData = uniqueTypesArray1.map(unique => {
          return dayData
            .filter(item => item.type_depense === unique)
            .map(datas => datas.montant)
            .reduce((a, b) => a + b, 0)
        })

        // console.log(
        //   filteredData.map(f => Math.round((f / soldDay) * 100) / 100)
        // )

        setLabelsValue(
          filteredData.map(f => Math.round((f / soldDay) * 100) / 100)
        )

        setDepenseValue(filteredData.map(f => f))
      }
    }
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
    setAnnee(value.getFullYear())
    const x = currentMonthIndex * 56 // ITEM_WIDTH est la largeur d'un élément dans votre ScrollView
    if (scrollMoisViewRef.current) {
      scrollMoisViewRef.current.scrollTo({ x, animated: true })
    }

    getData()
    //console.log('dataJour', dataJour)
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
  //

  return (
    <BottomSheetModalProvider>
      <View className="bg-white flex-1 pt-10 pl-3 pr-3">
        <TouchableOpacity className='flex-row items-center justify-center' onPress={() => showModal()}>
          <Text className="text-center font-bold text-2xl mr-4">Statistiques</Text>
          <AntDesign name='up' size={24} color='black'/>
        </TouchableOpacity>

        <View className="mt-2 items-center justify-between flex-row">
          <TouchableOpacity
            className="p-3 w-[45%] rounded-2xl items-center justify-center"
            onPress={() => onChangeAffichage('Ventes')}
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
            onPress={() => onChangeAffichage('Dépenses')}
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
            onPress={() => onChangePeriode('Jour', affichage)}
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
            onPress={() => [onChangePeriode('Mois', affichage)]}
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
            onPress={() => onChangePeriode('Année', affichage)}
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
          <ScrollView
            className="h-full"
            refreshControl={
              <RefreshControl refreshing={refresh} onRefresh={refreshing} />
            }
          >
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
                                setValue(date.day),
                                handleOnDateChange(date.day)
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

                <View className="flex-row justify-between mt-2 mb-2">
                  <Text className="text-gray-600 text-sm font-bold">
                    {value.toLocaleDateString('fr-FR', options)}
                  </Text>

                  <Text className="text-gray-700 font-extrabold">
                    {soldeDay.toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>

                {/* <View className="mt-2">
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
                </View> */}

                <Text className="font-bold text-lg mb-2">
                  Liste des transactions
                </Text>

                <View>
                  {datas.length > 0 ? (
                    <View>
                      {datas.map((items, index) => {
                        return (
                          <View
                            key={index}
                            className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full"
                          >
                            <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                              <MaterialCommunityIcons
                                name="cash-plus"
                                size={24}
                                color="white"
                              />
                            </View>

                            <View className="items-start w-[60%]">
                              <Text className="text-sm font-bold">
                                {items.description}
                              </Text>
                            </View>

                            <View>
                              <Text className="text-sm font-bold">
                                {items.montant.toLocaleString('fr-FR')} FCFA
                              </Text>
                            </View>
                          </View>
                        )
                      })}
                    </View>
                  ) : (
                    <View>
                      <Text className="text-sm font-bold">
                        Aucune transaction
                      </Text>
                    </View>
                  )}
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
                            onPress={() => [
                              setMois(month.value),
                              handleOnDateChange(month.value)
                            ]}
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
                    {soldeDay.toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>

                <Text className="font-bold text-lg mb-2">
                  Liste des transactions
                </Text>

                <View>
                  {datas.length > 0 ? (
                    <View>
                      {datesVente.map((d, index) => {
                        const day = new Date(d.dates)
                        const details = old_data.filter(da =>
                          da.dates.includes(d.dates)
                        )
                        return (
                          <View key={index}>
                            <Text className="text-sm">
                              {day.toLocaleDateString('fr-FR', options)}
                            </Text>
                            <View className="mt-3">
                              {details.map((items, index) => {
                                return (
                                  <View
                                    key={index}
                                    className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full"
                                  >
                                    <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                                      <MaterialCommunityIcons
                                        name="cash-plus"
                                        size={24}
                                        color="white"
                                      />
                                    </View>

                                    <View className="items-start w-[60%]">
                                      <Text className="text-sm font-bold">
                                        {items.description}
                                      </Text>
                                    </View>

                                    <View>
                                      <Text className="text-sm font-bold">
                                        {items.montant.toLocaleString('fr-FR')}{' '}
                                        FCFA
                                      </Text>
                                    </View>
                                  </View>
                                )
                              })}
                            </View>
                          </View>
                        )
                      })}
                    </View>
                  ) : (
                    <View>
                      <Text className="text-sm font-bold">
                        Aucune transaction
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : periode === 'Année' ? (
              <View>
                <View className="flex-1 max-h-24">
                  <ScrollView horizontal={true} ref={scrollMoisViewRef}>
                    {annees.map((annee, index) => {
                      const isActive = currentAnnee === annee
                      return (
                        <View
                          key={index}
                          className="flex-row items-start justify-between mx-[-3] my-3"
                          style={{ paddingHorizontal: 8 }}
                        >
                          <TouchableWithoutFeedback
                            onPress={() => [
                              setAnnee(annee),
                              handleOnDateChange(annee)
                            ]}
                          >
                            <View
                              className="flex-1 h-14 w-11 mx-1 py-2 px-0 border border-slate-200 items-center justify-center flex-col rounded-lg"
                              style={isActive && { backgroundColor: '#D6D6D6' }}
                            >
                              <Text
                                className="text-gray-500 mb-0"
                                style={isActive && { color: '#111' }}
                              >
                                {annee}
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
                    {currentAnnee}
                  </Text>

                  <Text className="text-gray-700 font-extrabold">
                    {soldeDay.toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>

                <Text className="font-bold text-lg mb-2">
                  Liste des transactions
                </Text>

                <View>
                  {datas.length > 0 ? (
                    <View>
                      {datas.map((items, index) => {
                        return (
                          <View
                            key={index}
                            className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full"
                          >
                            <View className="bg-green-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                              <MaterialCommunityIcons
                                name="cash-plus"
                                size={24}
                                color="white"
                              />
                            </View>

                            <View className="items-start w-[60%]">
                              <Text className="text-sm font-bold">
                                {items.description}
                              </Text>
                            </View>

                            <View>
                              <Text className="text-sm font-bold">
                                {items.montant.toLocaleString('fr-FR')} FCFA
                              </Text>
                            </View>
                          </View>
                        )
                      })}
                    </View>
                  ) : (
                    <View>
                      <Text className="text-sm font-bold">
                        Aucune transaction
                      </Text>
                    </View>
                  )}
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
                                setValue(date.day),
                                handleOnDateChange(date.day)
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
                    {soldeDay.toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>

                <View className="mt-2">
                  <ProgressChart
                    data={{
                      labels: labels, // optional
                      data: labelsValue
                    }}
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
                    style={{ left: -55 }}
                    hideLegend={false}
                  />
                </View>

                <View className='mt-2 flex-row items-center justify-between mb-2'>
                  <View className='flex-col justify-between gap-4'>
                    {labels.map((label, index) => {
                      return (
                        <View key={index}>
                          <Text>{label}</Text>
                        </View>
                      )
                    })}
                  </View>

                  <View className='flex-col justify-between gap-4'>
                    {depenseValue.map((montant, index) => {
                      return (
                        <View key={index}>
                          <Text className='text-red-500 font-extrabold'>{montant.toLocaleString('FR-fr')} FCFA</Text>
                        </View>
                      )
                    })}
                  </View>
                </View>

                <Text className="font-bold text-lg mb-2">
                  Liste des transactions
                </Text>

                <View>
                  {datas.length > 0 ? (
                    <View>
                      {datas.map((items, index) => {
                        return (
                          <View
                            key={index}
                            className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full"
                          >
                            <View className="bg-red-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                              <MaterialCommunityIcons
                                name="cash-minus"
                                size={24}
                                color="white"
                              />
                            </View>

                            <View className="items-start w-[60%]">
                              <Text className="text-sm font-bold">
                                {items.description}
                              </Text>
                            </View>

                            <View>
                              <Text className="text-sm font-bold">
                                {items.montant.toLocaleString('fr-FR')} FCFA
                              </Text>
                            </View>
                          </View>
                        )
                      })}
                    </View>
                  ) : (
                    <View>
                      <Text className="text-sm font-bold">
                        Aucune transaction
                      </Text>
                    </View>
                  )}
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
                            onPress={() => [
                              setMois(month.value),
                              handleOnDateChange(month.value)
                            ]}
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
                    {soldeDay.toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>

                {/* ProgressChart */}
                <View className="mt-2">
                  <ProgressChart
                    data={{
                      labels: labels, // optional
                      data: labelsValue
                    }}
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

                <View className='mt-2 flex-row items-center justify-between mb-2'>
                  <View className='flex-col justify-between gap-4'>
                    {labels.map((label, index) => {
                      return (
                        <View key={index}>
                          <Text>{label}</Text>
                        </View>
                      )
                    })}
                  </View>

                  <View className='flex-col justify-between gap-4'>
                    {depenseValue.map((montant, index) => {
                      return (
                        <View key={index}>
                          <Text className='text-red-500 font-extrabold'>{montant.toLocaleString('FR-fr')} FCFA</Text>
                        </View>
                      )
                    })}
                  </View>
                </View>

                <Text className="font-bold text-lg mb-2">
                  Liste des transactions
                </Text>

                <View>
                  {datas.length > 0 ? (
                    <View>
                      {datesDepense.map((d, index) => {
                        const day = new Date(d.dates)
                        const details = depenses.filter(da =>
                          da.dates.includes(d.dates)
                        )
                        return (
                          <View key={index}>
                            <Text className="text-sm">
                              {day.toLocaleDateString('fr-FR', options)}
                            </Text>
                            <View className="mt-3">
                              {details.map((items, index) => {
                                return (
                                  <View
                                    key={index}
                                    className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full"
                                  >
                                    <View className="bg-red-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                                      <MaterialCommunityIcons
                                        name="cash-minus"
                                        size={24}
                                        color="white"
                                      />
                                    </View>

                                    <View className="items-start w-[60%]">
                                      <Text className="text-sm font-bold">
                                        {items.description}
                                      </Text>
                                    </View>

                                    <View>
                                      <Text className="text-sm font-bold">
                                        {items.montant.toLocaleString('fr-FR')}{' '}
                                        FCFA
                                      </Text>
                                    </View>
                                  </View>
                                )
                              })}
                            </View>
                          </View>
                        )
                      })}
                    </View>
                  ) : (
                    // <View>
                    //   {datas.map((items, index) => {
                    //     return (
                    //       <View
                    //         key={index}
                    //         className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full"
                    //       >
                    //         <View className="bg-red-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                    //           <MaterialCommunityIcons
                    //             name="cash-minus"
                    //             size={24}
                    //             color="white"
                    //           />
                    //         </View>

                    //         <View className="items-start w-[60%]">
                    //           <Text className="text-sm font-bold">
                    //             {items.description}
                    //           </Text>
                    //         </View>

                    //         <View>
                    //           <Text className="text-sm font-bold">
                    //             {items.montant.toLocaleString('fr-FR')} FCFA
                    //           </Text>
                    //         </View>
                    //       </View>
                    //     )
                    //   })}
                    // </View>
                    <View>
                      <Text className="text-sm font-bold">
                        Aucune transaction
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : periode === 'Année' ? (
              <View>
                <View className="flex-1 max-h-24">
                  <ScrollView horizontal={true}>
                    {annees.map((annee, index) => {
                      const isActive = currentAnnee === annee
                      return (
                        <View
                          key={index}
                          className="flex-row items-start justify-between mx-[-3] my-3"
                          style={{ paddingHorizontal: 8 }}
                        >
                          <TouchableWithoutFeedback
                            onPress={() => [
                              setAnnee(annee),
                              handleOnDateChange(annee)
                            ]}
                          >
                            <View
                              className="flex-1 h-14 w-11 mx-1 py-2 px-0 border border-slate-200 items-center justify-center flex-col rounded-lg"
                              style={isActive && { backgroundColor: '#D6D6D6' }}
                            >
                              <Text
                                className="text-gray-500 mb-0"
                                style={isActive && { color: '#111' }}
                              >
                                {annee}
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
                    {currentAnnee}
                  </Text>

                  <Text className="text-[#F30C0F] font-extrabold">
                    {soldeDay.toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>

                {/* ProgressChart */}
                <View className="mt-2">
                  <ProgressChart
                    data={{
                      labels: labels, // optional
                      data: labelsValue
                    }}
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

                <View className='mt-2 flex-row items-center justify-between mb-2'>
                  <View className='flex-col justify-between gap-4'>
                    {labels.map((label, index) => {
                      return (
                        <View key={index}>
                          <Text>{label}</Text>
                        </View>
                      )
                    })}
                  </View>

                  <View className='flex-col justify-between gap-4'>
                    {depenseValue.map((montant, index) => {
                      return (
                        <View key={index}>
                          <Text className='text-red-500 font-extrabold'>{montant.toLocaleString('FR-fr')} FCFA</Text>
                        </View>
                      )
                    })}
                  </View>
                </View>

                <Text className="font-bold text-lg mb-2">
                  Liste des transactions
                </Text>

                <View>
                  {datas.length > 0 ? (
                    <View>
                      {datas.map((items, index) => {
                        return (
                          <View
                            key={index}
                            className="flex-row items-center justify-between bg-slate-200 p-3 mb-3 rounded-full"
                          >
                            <View className="bg-red-500 p-1 w-8 h-8 items-center justify-center rounded-full">
                              <MaterialCommunityIcons
                                name="cash-minus"
                                size={24}
                                color="white"
                              />
                            </View>

                            <View className="items-start w-[60%]">
                              <Text className="text-sm font-bold">
                                {items.description}
                              </Text>
                            </View>

                            <View>
                              <Text className="text-sm font-bold">
                                {items.montant.toLocaleString('fr-FR')} FCFA
                              </Text>
                            </View>
                          </View>
                        )
                      })}
                    </View>
                  ) : (
                    <View>
                      <Text className="text-sm font-bold">
                        Aucune transaction
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : null}
            {/* Progress Chart */}
          </ScrollView>
        ) : null}

        <View className='bg-black/20 absolute' style={{height: SCREEN_HEIGHT, width: SCREEN_WIDTH, display: open ? 'flex' : 'none'}}></View>
        <BottomSheetModal 
            style={{borderRadius: 35}} 
            ref={bottomSheetModalRef} 
            index={4} 
            snapPoints={snapPoint}
            backgroundStyle={{borderRadius: 30}}
            onDismiss={() => setOpen(false)}
        >
          <Text className='text-3xl font-bold text-center'>Statistiques global</Text>
          <ScrollView className='z-50 p-3'>

            {/* Par jour */}
            <View className='mt-2 mb-3'>
              <Text className='text-2xl font-bold text-red-600'>Par jour</Text>

              <View className='divide-y divide-slate-400'>

                <View className='p-3 mb-2'>
                  <Text className='text-lg font-semibold'>Jour avec le plus de dépense :</Text>
                  {dataJourPlus.map((data, index) => {
                    const day = new Date(data.dates)
                    return(
                    <View key={index} className='flex-row items-center justify-between mt-2'>
                      <Text>{day.toLocaleDateString('fr-FR', options)}</Text>
                      <Text className='font-extrabold text-red-400'>{data.total_montant.toLocaleString('FR-fr')} FCFA</Text>
                    </View>
                    )
                  })}
                </View>

                <View className='p-3 mb-2'>
                  <Text className='text-lg font-semibold'>Jour avec moins de dépense :</Text>
                  {dataJourMoins.map((data, index) => {
                    const day = new Date(data.dates)
                    return(
                    <View key={index} className='flex-row items-center justify-between mt-2'>
                      <Text>{day.toLocaleDateString('fr-FR', options)}</Text>
                      <Text className='font-extrabold text-red-400'>{data.total_montant.toLocaleString('FR-fr')} FCFA</Text>
                    </View>
                    )
                  })}
                </View>
              </View>
            </View>

            {/* Par Mois */}
            <View className='mt-2 mb-3'>
              <Text className='text-2xl font-bold text-red-600'>Par mois</Text>

              <View className='divide-y divide-slate-400'>

                <View className='p-3 mb-2'>
                  <Text className='text-lg font-semibold'>Mois avec le plus de dépense :</Text>
                  {dataMoisPlus.map((data, index) => {
                    const day = new Date(data.month)
                    return(
                    <View key={index} className='flex-row items-center justify-between mt-2'>
                      <Text>{capitalizeFirstLetter(day.toLocaleDateString('fr-FR', optionsMois))}</Text>
                      <Text className='font-extrabold text-red-400'>{data.total_montant.toLocaleString('FR-fr')} FCFA</Text>
                    </View>
                    )
                  })}
                </View>

                <View className='p-3 mb-2'>
                  <Text className='text-lg font-semibold'>Mois avec moins de dépense :</Text>
                  {dataMoisMoins.map((data, index) => {
                    const day = new Date(data.month)
                    return(
                    <View key={index} className='flex-row items-center justify-between mt-2'>
                      <Text>{capitalizeFirstLetter(day.toLocaleDateString('fr-FR', optionsMois))}</Text>
                      <Text className='font-extrabold text-red-400'>{data.total_montant.toLocaleString('FR-fr')} FCFA</Text>
                    </View>
                    )
                  })}
                </View>
              </View>
            </View>

            {/* Par Année */}
            <View className='mt-2 mb-3'>
              <Text className='text-2xl font-bold text-red-600'>Par année</Text>

              <View className='divide-y divide-slate-400'>

                <View className='p-3 mb-2'>
                  <Text className='text-lg font-semibold'>Année avec le plus de dépense :</Text>
                  {dataAnneePlus.map((data, index) => {
                    return(
                    <View key={index} className='flex-row items-center justify-between mt-2'>
                      <Text>{data.annee}</Text>
                      <Text className='font-extrabold text-red-400'>{data.total_montant.toLocaleString('FR-fr')} FCFA</Text>
                    </View>
                    )
                  })}
                </View>

                <View className='p-3 mb-2'>
                  <Text className='text-lg font-semibold'>Année avec moins de dépense :</Text>
                  {dataAnneeMoins.map((data, index) => {
                    return(
                    <View key={index} className='flex-row items-center justify-between mt-2'>
                      <Text>{data.annee}</Text>
                      <Text className='font-extrabold text-red-400'>{data.total_montant.toLocaleString('FR-fr')} FCFA</Text>
                    </View>
                    )
                  })}
                </View>
              </View>
            </View>

          </ScrollView>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  )
}

export default Statistique
