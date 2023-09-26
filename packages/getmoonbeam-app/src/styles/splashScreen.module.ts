import {StyleSheet} from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

// styles to be used within the Splash component
export const styles = StyleSheet.create({
    loginButton: {
        left: wp(10),
        alignSelf: 'flex-start'
    },
    splashScreenView: {
        flex: 1,
        width: wp(100),
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    splashArt: {
        height: hp(65),
        width: wp(65),
        alignSelf: 'center'
    },
    splashTitle: {
        alignSelf: 'center',
        fontFamily: 'Saira-Bold',
        fontSize: hp(3),
        marginBottom: hp(1.5),
        color: '#F2FF5D'
    },
    splashDescription: {
        alignSelf: 'center',
        textAlign: 'center',
        fontFamily: 'Saira-Regular',
        fontSize: hp(2.5),
        width:  wp(90),
        color: '#FFFFFF'
    },
    splashContentView: {
        bottom: hp(10),
        alignSelf: "center"
    }
});
