import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the ReimbursementsController component
export const styles = StyleSheet.create({
    headerView: {
        width: wp(100),
        height: hp(19),
    },
    headerButtonView: {
        width: wp(100),
        height: hp(3),
        backgroundColor: '#313030'
    },
    topHeaderView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        top: hp(5.75)
    },
    headerBalanceView: {
        height: hp(10),
        width: wp(65),
        alignSelf: 'flex-start',
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginLeft: wp(5)
    },
    headerCloseIcon: {
        marginRight: wp(5),
        height: hp(4),
        width: hp(4),
        backgroundColor: '#5B5A5A',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 15,
        borderRadius: 10
    },
    headerAvailableBalanceTop: {
        fontFamily: 'Saira-Regular',
        fontSize: hp(2.3),
        textAlign: 'left',
        left: wp(2.5),
        width: wp(45),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    headerAvailableBalanceBottomDollarSign: {
        bottom: hp(1.25),
        fontFamily: 'Changa-Regular',
        fontSize: hp(2.5),
        textAlign: 'left',
        left: wp(2.5),
        width: wp(40),
        alignSelf: 'flex-start',
        color: '#F2FF5D'
    },
    headerAvailableBalanceBottom: {
        bottom: hp(1.25),
        fontFamily: 'Changa-Regular',
        fontSize: hp(3.25),
        textAlign: 'left',
        left: wp(2.5),
        width: wp(40),
        alignSelf: 'flex-start',
        color: '#F2FF5D'
    },
    headerButton: {
        width: wp(40),
        height: hp(6),
        backgroundColor: '#F2FF5D',
        alignSelf: 'flex-end',
        flexDirection: 'row',
        bottom: hp(3.5),
        right: wp(5),
        borderRadius: 15,
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 9},
        shadowOpacity: 0.65,
        shadowRadius: 12,
        elevation: 15
    },
    reimbursementSummaryMainView: {
        flex: 1,
        backgroundColor: '#313030F2'
    },
    reimbursementSummaryTab: {
        backgroundColor: '#313030',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 8},
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 15,
        height: hp(10),
        flexDirection: 'column'
    },
    cashOutIcon: {
        top: hp(1.5),
        marginLeft: wp(4.5)
    },
    cashOutText: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.20),
        textAlign: 'left',
        left: wp(2.75),
        width: wp(40),
        alignSelf: 'center',
        color: '#313030'
    },
    reimbursementSummaryTabTitle : {
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.20),
        textAlign: 'left',
        left: wp(7.5),
        width: wp(32),
        alignSelf: 'flex-start',
        color: '#FFFFFF',
        top: -hp(0.5)
    },
    reimbursementSummaryTabButtonView: {
        width: wp(75),
        height: hp(5.5),
        alignSelf: 'flex-start',
        left: wp(7.5),
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    reimbursementSummaryTabButtonText: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.85),
        textAlign: 'center',
        width: wp(32),
        alignSelf: 'center',
        color: '#FFFFFF',
        top: hp(0.75)
    },
    reimbursementSummaryTabButtonTextActive: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.85),
        textAlign: 'center',
        width: wp(32),
        alignSelf: 'center',
        color: '#313030',
        top: hp(0.75)
    },
    reimbursementSummaryTabButton: {
        width: wp(20),
        height: hp(4.5),
        backgroundColor: 'transparent',
        borderRadius: 10,
        top: hp(0.50)
    },
    reimbursementSummaryTabButtonActive: {
        width: wp(20),
        height: hp(4.5),
        backgroundColor: '#F2FF5D',
        borderRadius: 10,
        top: hp(0.50)
    }
});
