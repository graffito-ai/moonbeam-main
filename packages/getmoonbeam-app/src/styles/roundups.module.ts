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
        width: wp(95),
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
        position: 'absolute',
        backgroundColor: '#F2FF5D',
        width: wp(45),
        height: hp(5),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        left: wp(2),
        bottom: hp(0),
    },
    buttonRight: {
        position: 'absolute',
        backgroundColor: '#F2FF5D',
        width: wp(45),
        height: hp(5),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        left: wp(50),
        bottom: hp(0),
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
        width: wp(15),
        backgroundColor: '#FFFFFF',
        height: hp(0.75),
        borderRadius: 20
    },
    roundupsSplashStepInactive: {
        alignSelf: 'center',
        width: wp(15),
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
    roundupsSplashDisclaimerText: {
        left: wp(3),
        color: '#a4a3a3',
        lineHeight: hp(1.85),
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(1.60),
        alignSelf: 'flex-start',
        width: wp(95),
        textAlign: 'left'
    },
    roundupsSplashDisclaimerView: {
        width: wp(100),
        position: 'absolute',
        bottom: hp(11)
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
        color: '#FFFFFF',
        fontFamily: 'Raleway-Medium',
        fontSize: hp(2.25),
        alignSelf: 'center',
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
        height: hp(10),
        width: wp(10)
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
        top: hp(2.5),
        height: hp(25),
        width: wp(55),
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
    },
    deltaOneImage: {
        height: hp(20),
        width: wp(43),
        alignSelf: 'center',
        bottom: hp(5)
    },
    deltaOneTitle: {
        color: '#F2FF5D',
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(3.50),
        alignSelf: 'center',
        width: wp(80),
        textAlign: 'center',
        bottom: hp(5)
    },
    deltaOnePrice: {
        color: '#FFFFFF',
        lineHeight: hp(2.5),
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(2),
        alignSelf: 'center',
        width: wp(95),
        textAlign: 'center',
        bottom: hp(5),
        textDecorationLine: 'line-through'
    },
    deltaOnePerksTitle: {
        color: '#FFFFFF',
        lineHeight: hp(2.75),
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(2.40),
        alignSelf: 'center',
        width: wp(95),
        textAlign: 'center',
        bottom: hp(1),
        marginBottom: hp(3),
    },
    deltaOnePerksView: {
        height: hp(45),
        width: wp(95),
        alignSelf: 'center',
        bottom: hp(3.5),
        flexDirection: 'column'
    },
    firstClassPerk: {
        color: '#FFFFFF',
        lineHeight: hp(2.50),
        fontFamily: 'Raleway-SemiBold',
        fontSize: hp(1.85),
        alignSelf: 'flex-end',
        width: wp(90),
        textAlign: 'center',
        bottom: hp(5)
    },
    deltaOneIndividualPerk: {
        height: hp(10),
        width: hp(44),
        flexDirection: 'row',
        left: wp(3)
    }
});
