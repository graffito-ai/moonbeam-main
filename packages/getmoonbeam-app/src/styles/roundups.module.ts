import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the Roundups components
export const styles = StyleSheet.create({
    roundupsSplashView: {
        backgroundColor: '#1c1a1f',
        flex: 1,
        flexDirection: 'column'
    },
    closeIcon: {
        alignSelf: 'flex-start',
        marginTop: hp(1.5),
        left: wp(5),
        backgroundColor: '#2e2e33',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 15,
        borderRadius: 10
    },
    nextButton: {
        backgroundColor: '#F2FF5D',
        width: wp(75),
        height: hp(5),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    nextButtonText: {
        color: '#1e1e21',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1.3),
        alignSelf: 'center',
        textAlign: 'center'
    },
    buttonLeft: {
        backgroundColor: '#F2FF5D',
        width: wp(35),
        height: hp(5),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp(8)
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
        color: '#1e1e21',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1.3),
        alignSelf: 'center',
        textAlign: 'center'
    },
    roundupsSplashStepView: {
        height: hp(5),
        alignSelf: 'center',
        width: wp(96),
        flexDirection: 'row',
        justifyContent: 'space-between',
        top: hp(0.5)
    },
    roundupsSplashStepActive: {
        alignSelf: 'center',
        width: wp(18.2),
        backgroundColor: '#FFFFFF',
        height: hp(0.75),
        borderRadius: 20
    },
    roundupsSplashStepInactive: {
        alignSelf: 'center',
        width: wp(18.2),
        backgroundColor: '#8C8C8C',
        height: hp(0.75),
        borderRadius: 20
    },
    roundupsContentView: {
        height: hp(70),
        width: wp(95),
        alignSelf: 'center'
    },
    roundupsSplashMainTitle: {
        left: wp(1),
        color: '#F2FF5D',
        fontFamily: 'Saira-Bold',
        top: hp(0.5),
        fontSize: hp(4),
        alignSelf: 'flex-start',
        width: wp(80),
        textAlign: 'left'
    },
    roundupsOverviewBoxTitle: {
        left: wp(1),
        color: '#dedede',
        fontFamily: 'Raleway-SemiBold',
        top: hp(5),
        fontSize: hp(2.50),
        alignSelf: 'flex-start',
        width: wp(80),
        textAlign: 'left'
    },
    roundupsStepContentText: {
        left: wp(1),
        color: '#bdbdbd',
        fontFamily: 'Raleway-SemiBold',
        top: hp(5),
        fontSize: hp(2.50),
        alignSelf: 'flex-start',
        width: wp(95),
        textAlign: 'left'
    },
    roundupsStepContentTextHighlighted: {
        left: wp(1),
        color: '#F2FF5D',
        fontFamily: 'Raleway-SemiBold',
        top: hp(5),
        fontSize: hp(2.50),
        alignSelf: 'flex-start',
        width: wp(95),
        textAlign: 'left'
    },
    roundupsOverviewBox: {
        top: hp(6),
        height: hp(30),
        width: wp(95),
        backgroundColor: '#2b2b2f',
        borderRadius: 10
    },
    overviewIcon: {
        left: wp(3),
        alignSelf: 'center',
        height: hp(12),
        width: wp(12)
    },
    overviewItemView: {
        marginTop: hp(1),
        marginBottom: hp(1),
        height: hp(5),
        flexDirection: 'row',
        alignContent: 'space-between'
    },
    overviewItemText: {
        left: wp(9),
        color: '#FFFFFF',
        fontFamily: 'Raleway-Medium',
        fontSize: hp(2),
        alignSelf: 'center',
        width: wp(80),
        textAlign: 'left'
    },
    roundupsSplash1: {
        top: hp(10),
        height: hp(20),
        width: wp(65),
        alignSelf: 'center'
    },
    roundupsStepImage: {
        top: hp(10),
        height: hp(30),
        width: wp(65),
        alignSelf: 'center'
    },
    roundupsStepImage4: {
        left: wp(4),
        top: hp(10),
        height: hp(30),
        width: wp(65),
        alignSelf: 'center'
    }
});
