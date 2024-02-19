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
        backgroundColor: '#343434F2'
    },
    reimbursementSummaryTab: {
        backgroundColor: '#313030',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 8},
        shadowOpacity: 0.75,
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
    },
    noReimbursementsImage: {
        height: hp(35),
        width: hp(28),
        alignSelf: 'center'
    },
    noReimbursementsText: {
        top: hp(2),
        width: wp(100),
        textAlign: 'center',
        fontFamily: 'Raleway-Bold',
        fontSize: hp(1.85),
        color: '#F2FF5D'
    },
    noReimbursementsView: {
        top: hp(4),
        height: hp(40),
        width: wp(100),
        alignSelf: 'center',
        flexDirection: 'column'
    },
    reimbursementItemView: {
        height: hp(10),
        width: wp(100),
        top: hp(2)
    },
    reimbursementItemTitle: {
        lineHeight: hp(2.55),
        left: wp(8),
        fontSize: hp(2),
        color: '#FFFFFF',
        fontFamily: 'Saira-ExtraBold',
        width: wp(50)
    },
    reimbursementDescription: {
        top: hp(0.50),
        lineHeight: hp(2.10),
        left: wp(8),
        fontSize: hp(1.8),
        color: '#FFFFFF',
        fontFamily: 'Saira-Regular',
        width: wp(50)
    },
    reimbursementMoonbeamLogo: {
        height: hp(8),
        width: hp(8),
        left: wp(5),
        top: hp(0.25)
    },
    reimbursementRightView: {
        flexDirection: 'row'
    },
    reimbursementRightDetailsView: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    reimbursementRightDetailTop: {
        fontSize: hp(1.8),
        fontFamily: 'Changa-Bold',
        color: '#F2FF5D',
    },
    reimbursementRightDetailBottom: {
        marginTop: '5%',
        fontSize: hp(1.6),
        fontFamily: 'Raleway-Medium',
        color: '#FFFFFF'
    },
    noCardLinkedImage: {
        height: hp(30),
        width: hp(23),
        alignSelf: 'center'
    },
    noCardLinkedText: {
        alignSelf: 'center',
        width: wp(85),
        textAlign: 'center',
        fontFamily: 'Raleway-Medium',
        fontSize: hp(1.85),
        color: '#FFFFFF'
    },
    noCardLinkedTextHighlight: {
        alignSelf: 'center',
        width: wp(85),
        textAlign: 'center',
        fontFamily: 'Raleway-Bold',
        fontSize: hp(1.85),
        color: '#F2FF5D'
    },
    linkNowButtonText: {
        top: hp(2),
        alignSelf: 'center',
        width: wp(85),
        textAlign: 'center',
        fontFamily: 'Changa-Bold',
        fontSize: hp(2),
        textDecorationLine: 'underline',
        color: '#F2FF5D'
    },
    dropdownContainer: {
        alignSelf: 'center',
        backgroundColor: '#313030',
        borderColor: "#FFFFFF",
        width: wp(87)
    },
    dropdownPicker: {
        alignSelf: 'center',
        backgroundColor: '#313030',
        borderRadius: 4,
        borderColor: "#FFFFFF",
        width: wp(87),
        height: hp(6)
    },
    dropdownText: {
        fontFamily: 'Changa-Medium',
        fontSize: hp(2),
        color: '#FFFFFF'
    },
    dropdownIcon: {
        tintColor: '#FFFFFF'
    },
    cardLinkedImage: {
        height: hp(25),
        width: hp(18),
        alignSelf: 'center'
    },
    splashButtonDismiss: {
        bottom: hp(5),
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(5),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    splashButtonDismissText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1)
    },
    cashoutButtonEnabled: {
        top: hp(3),
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(5),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    cashoutButtonDisabled: {
        top: hp(3),
        backgroundColor: '#D9D9D9',
        width: wp(30),
        height: hp(5),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    cashoutTextEnabled: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1)
    },
    cashoutTextDisabled: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1)
    },
});
