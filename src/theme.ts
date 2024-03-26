import {extendTheme} from 'native-base'

const config = {
    useSystemColorMode: false,
    initialColorMode: 'light'
}

const colors = {
    primary:{
        50: '#EE2FF6',
        100: '#CFD9EF',
        200: '#B1C1D8',
        300: '#92A9C9',
        400: '#749189',
        500: '#5578AA',
        600: '#446088',
        700: '#334866',
        800: '#223044',
        900: '#111822'
    }
}

export default extendTheme({config, colors})