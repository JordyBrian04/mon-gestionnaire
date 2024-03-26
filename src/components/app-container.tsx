import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import 'react-native-gesture-handler';


import LockScreen from '../screens/LockScreen'

const Stack = createStackNavigator()

const Appcontainer = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LockScreen">
        <Stack.Screen
          options={{ headerShown: false }}
          name="LockScreen"
          component={LockScreen}
        />
        {/* <Stack.Screen
          options={{ headerShown: false }}
          name="Login"
          component={Login}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Tabs"
          component={TabStackScreens}
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
