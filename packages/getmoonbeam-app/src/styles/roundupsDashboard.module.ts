import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the RoundupsDashboard components
export const styles = StyleSheet.create({
    dashboardView: {
        flex: 1,
        backgroundColor: '#313030',
        width: wp(100),
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    bottomView: {
        position: 'absolute',
        bottom: hp(0),
        height: hp(33),
        backgroundColor: '#313030',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 10},
        shadowOpacity: 0.95,
        shadowRadius: 15,
        elevation: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    subHeaderTitle: {
        marginTop: hp(1.5),
        left: wp(3),
        alignSelf: 'flex-start',
        color: '#FFFFFF',
        fontSize: hp(2.3),
        fontFamily: 'Saira-SemiBold'
    },
    mainDivider: {
        height: hp(0.05),
        width: wp(100),
        backgroundColor: '#FFFFFF'
    },
    individualTransactionContainer: {
        width: wp(100),
        paddingBottom: hp(4),
        alignItems: 'center',
        alignContent: 'center'
    },
    topView: {
        height: hp(8.5),
        width: wp(100),
        alignSelf: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    savingsText: {
        top: hp(1),
        alignSelf: 'flex-start',
        left: hp(2),
        fontFamily: 'Saira-Light',
        fontSize: hp(2.50),
        lineHeight: hp(3.5),
        textAlign: 'left',
        flexDirection: 'column',
        color: '#FFFFFF',
    },
    savingsAmountText: {
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(2.75),
        width: wp(100),
        textAlign: 'left',
        color: '#F2FF5D',
        alignSelf: 'flex-start'
    },
    referralButton: {
        marginLeft: wp(14),
        height: hp(5),
        width: wp(22),
        borderRadius: 50,
        backgroundColor: '#444444',
        alignSelf: 'center'
    },
    referralButtonText: {
        fontSize: hp(2),
        textAlign: 'left',
        fontFamily: 'Changa-SemiBold',
        color: '#FFFFFF',
        alignSelf: 'center',
        top: hp(0.5)
    },
    roundupsTopButtonView: {
        top: hp(0.15),
        height: hp(17),
        width: wp(100),
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    roundupAccountsIcon: {
        top: hp(2.25),
        marginRight: wp(6)
    },
    roundupsTopLeftButton: {
        alignSelf: 'center',
        left: wp(2),
        width: wp(46),
        height: hp(17),
        backgroundColor: '#313030',
        flexDirection: 'column',
        borderRadius: 18
    },
    roundupsTopRightButton: {
        alignSelf: 'center',
        right: wp(2),
        width: wp(46),
        height: hp(17),
        backgroundColor: '#313030',
        flexDirection: 'column',
        borderRadius: 18
    },
    roundupsTopButtonImage: {
        alignSelf: 'center',
        top: hp(1),
        height: hp(9.5),
        width: wp(25)
    },
    roundupsTopButtonText: {
        top: hp(2.5),
        fontFamily: 'Changa-Regular',
        fontSize: hp(2.35),
        width: wp(25),
        textAlign: 'center',
        color: '#FFFFFF',
        alignSelf: 'center'
    },
    roundupsNoObjectivesImage: {
        alignSelf: 'flex-start',
        top: hp(1),
        left: wp(8.5),
        height: hp(14),
        width: wp(30)
    },
    noRoundupObjectivesText: {
        left: wp(12),
        bottom: hp(1),
        fontSize: hp(2.15),
        lineHeight: hp(2.75),
        width: wp(50),
        textAlign: 'left',
        fontFamily: 'Changa-Regular',
        color: '#FFFFFF',
        alignSelf: 'center',
    },
    objectivesGetStartedButton: {
        backgroundColor: '#F2FF5D',
        width: wp(27),
        height: hp(4.5),
        borderRadius: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    objectivesGetStartedButtonText: {
        color: '#1e1e21',
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.85),
        marginTop: hp(1.3),
        alignSelf: 'center',
        textAlign: 'center'
    },
    roundupsSavingsStatusView: {
        top: hp(0.25),
        alignSelf: 'center',
        width: wp(97),
        height: hp(20),
        backgroundColor: '#313030',
        flexDirection: 'row',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18
    },
    roundupsSavingsStatusText: {
        top: hp(4.25),
        left: wp(6)
    },
    titleStyle: {
        fontFamily: 'Raleway-Regular',
        color: 'grey',
        fontSize: hp(2)
    },
    avatarStyle: {
        top: hp(1.55),
        right: wp(5),
        alignSelf: 'flex-end',
        backgroundColor: 'white'
    },
    profileImage: {
        right: wp(5),
        alignSelf: 'flex-start',
        height: wp(9),
        width: wp(9),
        borderRadius: wp(35) / 2,
        borderWidth: hp(0.20),
        borderColor: '#F2FF5D'
    },
    avatarView: {
        top: hp(1.90),
        right: wp(0.25)
    }
});
