import {configureFonts, MD2LightTheme} from 'react-native-paper';

// Fonts configuration for theme
const fontConfig = {
    web: {
        regular: {
            fontFamily: 'Raleway-Regular',
            fontWeight: 'normal',
        },
        medium: {
            fontFamily: 'Raleway-Medium',
            fontWeight: 'normal',
        },
        light: {
            fontFamily: 'Raleway-Light',
            fontWeight: 'normal',
        },
        thin: {
            fontFamily: 'Raleway-Thin',
            fontWeight: 'normal',
        },
    },
    ios: {
        regular: {
            fontFamily: 'Raleway-Regular',
            fontWeight: 'normal',
        },
        medium: {
            fontFamily: 'Raleway-Medium',
            fontWeight: 'normal',
        },
        light: {
            fontFamily: 'Raleway-Light',
            fontWeight: 'normal',
        },
        thin: {
            fontFamily: 'Raleway-Thin',
            fontWeight: 'normal',
        },
    },
    android: {
        regular: {
            fontFamily: 'Raleway-Regular',
            fontWeight: 'normal',
        },
        medium: {
            fontFamily: 'Raleway-Medium',
            fontWeight: 'normal',
        },
        light: {
            fontFamily: 'Raleway-Light',
            fontWeight: 'normal',
        },
        thin: {
            fontFamily: 'Raleway-Thin',
            fontWeight: 'normal',
        },
    }
};

// Exporting theme to be used in application
export const theme = {
    ...MD2LightTheme,
    // @ts-ignore
    fonts: configureFonts({config: fontConfig, isV3: false}),
};
