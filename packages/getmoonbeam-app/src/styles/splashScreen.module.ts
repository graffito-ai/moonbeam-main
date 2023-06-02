import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Splash component
export const styles = StyleSheet.create({
    splashScreenView: {
        flex: 1,
        width: Dimensions.get('window').width,
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    splashArt: {
        height: Dimensions.get('window').height * 0.65,
        width: Dimensions.get('window').width * 0.65,
    },
    splashTitle: {
        alignSelf: 'center',
        fontFamily: 'Saira-Bold',
        fontSize: Dimensions.get('window').height / 35,
        color: '#FFFFFF'
    },
    splashDescription: {
        alignSelf: 'center',
        fontFamily: 'Saira-Regular',
        fontSize: Dimensions.get('window').height / 40,
        color: '#FFFFFF'
    },
    splashContentView: {
        bottom: Dimensions.get('window').height/ 20
    }
});
