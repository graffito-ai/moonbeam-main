import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

// styles to be used within the Biometrics pop-up component
export const styles = StyleSheet.create({
    dialogStyle: {
        backgroundColor: '#5B5A5A',
        borderRadius: wp(5),
        height: hp(65),
        width: wp(95),
        alignSelf: 'center'
    },
    topBiometricsImage: {
        top: hp(3),
        height: hp(25),
        width: wp(60),
        alignSelf: 'center'
    },
    dialogParagraph: {
        color: '#FFFFFF',
        fontFamily: 'Raleway-Regular',
        fontSize: hp(1.6),
        width: wp(80),
        alignSelf: 'center',
        textAlign: 'center'
    },
    dialogTitle: {
        top: hp(3),
        color: '#F2FF5D',
        fontFamily: 'Raleway-Bold',
        width: wp(60),
        fontSize: hp(2.5),
        alignSelf: 'center',
        textAlign: 'center'
    },
    dialogActionButtons: {
        alignSelf: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center',
        top: hp(1)
    },
    enableButton: {
        backgroundColor: '#F2FF5D',
        height: hp(6.5),
        width: wp(45),
        alignSelf: 'center'
    },
    enableButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        textAlign: 'center',
        alignSelf: 'center'
    },
    dismissButton: {
        backgroundColor: 'transparent',
        height: hp(6.5),
        width: wp(45),
        alignSelf: 'center'
    },
    dismissButtonText: {
        color: '#FFFFFF',
        fontFamily: 'Saira-Bold',
        fontSize: hp(2.3),
        textAlign: 'center',
        alignSelf: 'center'
    }
});
