import {StyleSheet} from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

// styles to be used within the AppOverview component
export const styles = StyleSheet.create({
    topContainer: {
        flex: 0.52,
        width: wp(100)
    },
    topContainerImage: {
        height: hp(40),
        marginTop: hp(8)
    },
    bottomContainer: {
        backgroundColor: '#313030',
        flex: 0.48,
        width: wp(100)
    },
    bottomContainerTitle: {
        fontFamily: 'Saira-Medium',
        marginTop: hp(6),
        fontSize: hp(3.5),
        textAlign: 'center',
        width: wp(80),
        alignSelf: 'center',
        color: '#FFFFFF'
    },
    bottomContainerContent: {
        fontFamily: 'Raleway-Regular',
        marginTop: hp(3),
        fontSize: hp(2),
        textAlign: 'center',
        width: wp(95),
        alignSelf: 'center',
        color: '#FFFFFF'
    },
    progressSteps: {
        marginTop: hp(5)
    },
    activeStep: {
        backgroundColor: '#F2FF5D',
        width: wp(3),
        height: wp(3),
        marginLeft: wp(3),
        marginRight: wp(3),
        borderRadius: Math.round(wp(100) + hp(100)) / 2,
    },
    inactiveStep: {
        backgroundColor: '#D9D9D9',
        width: wp(3),
        height: wp(3),
        marginLeft: wp(3),
        marginRight: wp(3),
        borderRadius: Math.round(wp(100) + hp(100)) / 2,
    },
    buttonLeft: {
        backgroundColor: '#F2FF5D',
        width: wp(35),
        height: hp(5),
        marginRight: wp(20),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonRight: {
        backgroundColor: '#F2FF5D',
        width: wp(35),
        height: hp(5),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.5),
        marginTop: hp(1)
    },
    bottomContainerButtons: {
        marginBottom: hp(3),
        alignItems: "center",
        alignContent: 'center',
        justifyContent: 'center'
    }
});
