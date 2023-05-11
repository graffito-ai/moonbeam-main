import {Platform} from 'react-native';
import {configureFonts, MD3DarkTheme} from 'react-native-paper';

// Fonts configuration for theme
const fontConfig = {
    customVariant: {
        fontFamily: Platform.select({
            web: '"Raleway-Bold", "Raleway-ExtraBold", "Raleway-ExtraLight", "Raleway-Light", "Raleway-Medium", "Raleway-Regular", "Raleway-SemiBold","Changa-Bold", "Changa-ExtraBold", "Changa-ExtraLight", "Changa-Light", "Changa-Medium", "Changa-Regular", "Changa-SemiBold","Saira-Bold", "Saira-ExtraBold", "Saira-ExtraLight", "Saira-Light", "Saira-Medium", "Saira-Regular", "Saira-SemiBold"',
            ios: '"Raleway-Bold", "Raleway-ExtraBold", "Raleway-ExtraLight", "Raleway-Light", "Raleway-Medium", "Raleway-Regular", "Raleway-SemiBold","Changa-Bold", "Changa-ExtraBold", "Changa-ExtraLight", "Changa-Light", "Changa-Medium", "Changa-Regular", "Changa-SemiBold","Saira-Bold", "Saira-ExtraBold", "Saira-ExtraLight", "Saira-Light", "Saira-Medium", "Saira-Regular", "Saira-SemiBold"',
            android: '"Raleway-Bold", "Raleway-ExtraBold", "Raleway-ExtraLight", "Raleway-Light", "Raleway-Medium", "Raleway-Regular", "Raleway-SemiBold","Changa-Bold", "Changa-ExtraBold", "Changa-ExtraLight", "Changa-Light", "Changa-Medium", "Changa-Regular", "Changa-SemiBold","Saira-Bold", "Saira-ExtraBold", "Saira-ExtraLight", "Saira-Light", "Saira-Medium", "Saira-Regular", "Saira-SemiBold"',
            default: '"Raleway-Bold", "Raleway-ExtraBold", "Raleway-ExtraLight", "Raleway-Light", "Raleway-Medium", "Raleway-Regular", "Raleway-SemiBold","Changa-Bold", "Changa-ExtraBold", "Changa-ExtraLight", "Changa-Light", "Changa-Medium", "Changa-Regular", "Changa-SemiBold","Saira-Bold", "Saira-ExtraBold", "Saira-ExtraLight", "Saira-Light", "Saira-Medium", "Saira-Regular", "Saira-SemiBold"',
        }),
        fontWeight: '400',
        letterSpacing: 0.5,
        lineHeight: 22,
        fontSize: 20,
    }
};

// Exporting theme to be used in application
export const theme = {
    ...MD3DarkTheme,
    //@ts-ignore
    fonts: configureFonts({isV3: true, config: fontConfig}),
};
