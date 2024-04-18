import { View, Text, Dimensions } from 'react-native'
import React from 'react'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView
} from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'

const gesture = Gesture.Pan()
const {height: SCREEN_HEIGHT} = Dimensions.get('window')

const BottomModal = () => {
  return (
      <GestureDetector gesture={gesture}>
        <View className='flex-1 bg-black/20 h-full z-10 w-full'>
            <Animated.View
                className="bg-white w-full absolute"
                style={{
                    height: SCREEN_HEIGHT,
                    top: SCREEN_HEIGHT / 1.5,
                    borderRadius: 25
                }}
            >
            <View className="w-[75] h-1 bg-gray-300 rounded-full self-center my-4" />
            </Animated.View>
        </View>
      </GestureDetector>
  )
}

export default BottomModal
