import { View, Text, Platform } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import 'react-native-gesture-handler';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';


import LockScreen from '../screens/LockScreen'
import Agenda from '../screens/(tabs)/agenda';
import Wallet from '../screens/(tabs)/wallet';
import Caisse from '../screens/(tabs)/caisse';
import Notes from '../screens/(tabs)/notes';
import Parametre from '../screens/(tabs)/parametre';
import Statistique from '../screens/Statistique';

const Stack = createStackNavigator()
const TabStack = createBottomTabNavigator()

const screenOptions = ({route}:any) => ({
  tabBarIcon : ({focused}:any) => {
    let icon: any = null;
    const size = 24
    const color = focused ? "#3b82f6" : "#5C5E5F";
  
    switch (route.name) {
      case "Agenda":
        icon = "calendar";
        break;
      case "Notes":
        icon = "filetext1";
        break;
      case "Wallet":
        icon = "wallet";
        break;
      case "Caisse":
        icon = "bank";
        break;
      // case "Statistique":
      //   icon = "chart-bar";
      //   break;
      case "Parametre":
        icon = "setting";
        break;
    }
  
    return <AntDesign name={icon} size={24} color={color} />;
  }, 

  tabBarActiveTintColor: '#3b82f6',
  tabBarInactiveTintColor: '#5C5E5F',
  tabBarLabelStyle: {
    fontSize: 13,
    display: 'none'
  },
  tabBarStyle: {
    backgroundColor: "#ffffff",
    width: 'full',
    height: Platform.OS === 'android' ? 50 : 85,
    // borderRadius: 25,
    // alignSelf:"center",
    // marginBottom: 5,
  },

})

const TabStackScreens = () => {
  return (
    <TabStack.Navigator screenOptions={screenOptions}>
      <TabStack.Screen options={{ headerShown: false }} name="Agenda" component={Agenda} />
      <TabStack.Screen options={{ headerShown: false }} name="Notes" component={Notes} />
      <TabStack.Screen options={{ headerShown: false }} name="Wallet" component={Wallet} />
      <TabStack.Screen options={{ headerShown: false }} name="Caisse" component={Caisse} />
      <TabStack.Screen options={{ headerShown: false }} name="Parametre" component={Parametre} /> 
      {/* <TabStack.Screen options={{ headerShown: false }} name="Vente" component={Vente} />
      */}
    </TabStack.Navigator>
  )
}

const Appcontainer = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LockScreen">
        <Stack.Screen
          options={{ headerShown: false }}
          name="LockScreen"
          component={LockScreen}
        />

        <Stack.Screen options={{headerShown: false}} name="Tabs" component={TabStackScreens}/>

        <Stack.Screen
          options={{ headerShown: false }}
          name="Statistique"
          component={Statistique}
        />
        {/* <Stack.Screen
          options={{ headerShown: false }}
          name="Login"
          component={Login}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Article_action"
          component={Article_action}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Action_vente"
          component={Action_vente}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Categories"
          component={Categories}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Fournisseurs"
          component={Fournisseurs}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default Appcontainer
