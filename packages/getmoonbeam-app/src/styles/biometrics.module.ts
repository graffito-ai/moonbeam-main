import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

// styles to be used within the Biometrics pop-up component
export const styles = StyleSheet.create({
    dialogStyle: {
        backgroundColor: '#5B5A5A',
        borderRadius: wp(5),
        height: hp(85),
        width: wp(95),
        alignSelf: 'center'
    },
    topBiometricsImage: {
        top: hp(5),
        height: hp(30),
        width: wp(65),
        alignSelf: 'center'
    },
    dialogParagraph: {
        color: '#FFFFFF',
        fontFamily: 'Raleway-Regular',
        fontSize: hp(1.5),
        width: wp(80),
        bottom: hp(3),
        alignSelf: 'center',
        textAlign: 'center'
    },
    dialogTitle: {
        top: hp(9),
        color: '#F2FF5D',
        fontFamily: 'Raleway-Bold',
        width: wp(75),
        fontSize: hp(2.5),
        alignSelf: 'center',
        textAlign: 'center'
    },
    dialogActionButtons: {
        alignSelf: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center',
        bottom: hp(3)
    },
    enableButton: {
        backgroundColor: '#F2FF5D',
        height: hp(6.5),
        width: wp(80),
        alignSelf: 'center'
    },
    enableButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.2),
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
