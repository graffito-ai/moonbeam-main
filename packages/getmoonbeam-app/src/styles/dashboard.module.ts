import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the Dashboard component
export const styles = StyleSheet.create({
    mainDashboardView: {
        flex: 1,
        width: wp(100),
        height: hp(100),
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#313030'
    },
    topDashboardView: {
        flex: 1,
        width: wp(100),
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#5B5A5A',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 8},
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 15,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    tppGreetingView: {
        top: hp(5)
    },
    greetingText: {
        fontFamily: 'Saira-Light',
        fontSize: hp(2.7),
        width: wp(100),
        textAlign: 'center',
        color: '#FFFFFF'
    },
    greetingNameText: {
        fontFamily: 'Saira-SemiBold',
        bottom: hp(1.5),
        fontSize: hp(3),
        width: wp(100),
        textAlign: 'center',
        color: '#FFFFFF'
    },
    imageCover: {
        bottom: hp(5),
        alignSelf: 'flex-start'
    },
    titleStyle: {
        fontFamily: 'Raleway-Regular',
        color: 'grey',
        fontSize: hp(5)
    },
    avatarStyle: {
        top: hp(5),
        alignSelf: 'center',
        backgroundColor: 'white'
    },
    avatarAccessoryStyle: {
        left: '72%',
        top: '75%',
        backgroundColor: '#303030'
    },
    statisticsView: {
        width: wp(90),
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        top: hp(7)
    },
    statLeftView: {
        height: hp(8),
        width: wp(30),
        marginRight: wp(10),
        justifyContent: 'center',
        flexDirection: 'column'
    },
    statRightView: {
        height: hp(8),
        width: wp(30),
        marginLeft: wp(10),
        justifyContent: 'center',
        flexDirection: 'column'
    },
    statTitleLeft: {
        fontFamily: 'Raleway-ExtraBold',
        fontSize: hp(2),
        width: wp(50),
        textAlign: 'center',
        color: '#FFFFFF'
    },
    statNumberCenterLeft: {
        fontFamily: 'Changa-Medium',
        fontSize: hp(2.5),
        width: wp(50),
        textAlign: 'center',
        color: '#F2FF5D',
    },
    statNumberCenterRight: {
        fontFamily: 'Changa-Medium',
        fontSize: hp(2.5),
        width: wp(50),
        textAlign: 'center',
        color: '#F2FF5D',
    },
    statTitleRight: {
        fontFamily: 'Raleway-ExtraBold',
        fontSize: hp(2),
        width: wp(50),
        textAlign: 'center',
        color: '#FFFFFF'
    },
    statTitleRegular: {
        fontFamily: 'Raleway-Medium',
        color: '#FFFFFF'
    },
    statInfoViewLeft: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    statInfoViewRight: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    verticalLine: {
        height: hp(5),
        width: wp(0.5),
        backgroundColor: 'white'
    },
    bottomView: {
        flex: 1,
        top: hp(2),
    },
    segmentedButtons: {
        width: wp(95),
        alignSelf: 'center'
    },
    subHeaderTitle: {
        alignSelf: 'center',
        color: '#FFFFFF',
        fontSize: hp(2.3),
        fontFamily: 'Saira-SemiBold'
    },
    individualTransactionContainer: {
        width: wp(100),
        paddingBottom: hp(4),
        alignItems: 'center',
        alignContent: 'center'
    },
    emptyPayoutListItemTitle: {
        alignSelf: 'center',
        fontSize: hp(2.3),
        color: '#F2FF5D',
        fontFamily: 'Saira-Medium'
    },
    emptyTransactionsListItemTitle: {
        alignSelf: 'center',
        fontSize: hp(2.3),
        color: '#F2FF5D',
        fontFamily: 'Saira-Medium'
    },
    listItemTitle: {
        left: wp(5),
        fontSize: hp(2),
        color: '#FFFFFF',
        fontFamily: 'Saira-ExtraBold',
        width: wp(50)
    },
    listItemDescription: {
        left: wp(5),
        fontSize: hp(1.8),
        color: '#FFFFFF',
        fontFamily: 'Raleway-Regular',
        width: wp(50)
    },
    itemRightView: {
        flexDirection: 'row'
    },
    itemRightDetailsView: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    itemRightDetailTop: {
        fontSize: hp(1.8),
        fontFamily: 'Changa-Bold',
        color: '#F2FF5D',
    },
    itemRightDetailBottom: {
        marginTop: '5%',
        fontSize: hp(1.6),
        fontFamily: 'Raleway-Medium',
        color: '#FFFFFF'
    },
    rightItemIcon: {
        left: wp(2.2),
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    leftItemIcon: {
        left: wp(3),
        height: hp(8),
        width: wp(10),
    },
    mainDivider: {
        height: hp(0.2),
        width: wp(100),
        backgroundColor: '#FFFFFF'
    },
    divider: {
        height: hp(0.05),
        alignSelf: 'flex-end',
        width: wp(85),
        backgroundColor: '#5B5A5A'
    },
    bottomSheet: {
        backgroundColor: '#313030',
    },
    transactionParentView: {
        flex: 1,
        width: wp(100),
        height: hp(100),
        flexDirection: 'column',
        alignContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        backgroundColor: '#313030',
    },
    transactionMapView: {
        height: hp(30),
        width: wp(95),
        top: hp(5)
    },
    mapTooltip: {
        zIndex: 500,
        backgroundColor: "transparent",
    },
    mapTooltipSquare: {
        zIndex: 600,
        height: hp(4.3),
        width: wp(28),
        backgroundColor: "#313030",
        borderRadius: 10,
        borderColor: '#F2FF5D',
        borderWidth: 4
    },
    mapTooltipArrow: {
        zIndex: 700,
        position: "absolute",
        top: -hp(1.1),
        right: wp(8.1),
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderLeftWidth: hp(2),
        borderRightWidth: hp(2),
        borderBottomWidth: hp(3.5),
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "#313030"
    },
    mapTooltipArrowOverlay: {
        position: "absolute",
        top: -hp(1.7),
        right: wp(8.1),
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderLeftWidth: hp(2),
        borderRightWidth: hp(2),
        borderBottomWidth: hp(3),
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "#F2FF5D"
    },
    toolTipDetailsView: {
        backgroundColor: "transparent",
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        bottom: hp(3.3),
        zIndex: 1000
    },
    toolTipImageDetail: {
        alignSelf: 'center',
        right: wp(2)
    },
    toolTipImagePrice: {
        left: wp(2),
        alignSelf: 'center',
        fontFamily: 'Raleway-ExtraBold',
        fontSize: hp(1.8),
        textAlign: 'center',
        color: '#F2FF5D'
    },
    transactionBrandDetailsView: {
        flexDirection: 'column',
        alignSelf: 'center',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        width: wp(100)
    },
    transactionBrandName: {
        alignSelf: 'flex-start',
        left: wp(5.5),
        fontFamily: 'Saira-Bold',
        fontSize: hp(2.5),
        color: '#FFFFFF'
    },
    transactionDetailsView: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: wp(100),
        left: wp(5),
        top: hp(1)
    },
    transactionBrandImage: {
        alignSelf: 'flex-start',
        borderRadius: 10
    },
    transactionAmountsView: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        right: wp(15),
    },
    brandDetailsView: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: wp(70),
        top: hp(0.8),
        left: wp(4),
    },
    transactionAmountLabel: {
        fontSize: hp(2),
        fontFamily: 'Changa-Medium',
        color: '#FFFFFF'
    },
    transactionStatusLabel: {
        fontSize: hp(2.3),
        fontFamily: 'Changa-Medium',
        color: '#F2FF5D'
    },
    transactionPrice: {
        alignSelf: 'flex-start',
        fontFamily: 'Raleway-ExtraBold',
        fontSize: hp(2),
        textAlign: 'justify',
        color: '#F2FF5D'
    },
    transactionTimestamp: {
        alignSelf: 'flex-start',
        fontSize: hp(2),
        fontFamily: 'Changa-Light',
        textAlign: 'justify',
        lineHeight: hp(2.5),
        color: '#FFFFFF'
    },
    transactionAddress: {
        alignSelf: 'flex-start',
        fontSize: hp(1.8),
        fontFamily: 'Changa-Light',
        lineHeight: hp(2.5),
        color: '#FFFFFF'
    },
    transactionDiscountAmount: {
        alignSelf: 'flex-start',
        fontSize: hp(2.3),
        fontFamily: 'Changa-Bold',
        color: '#F2FF5D'
    }
});
