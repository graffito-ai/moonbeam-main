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
        alignSelf: 'center'
    },
    totalSavingsLabel1Text: {
        lineHeight: hp(2.70),
        fontSize: hp(2.20),
        width: wp(70),
        textAlign: 'left',
        color: '#FFFFFF',
        textDecorationLine: 'underline'
    },
    totalSavingsLabel2Text: {
        width: wp(50),
        lineHeight: hp(3.50),
        fontSize: hp(1.75),
        textAlign: 'left',
        fontFamily: 'Changa-Medium',
        color: '#F2FF5D'
    },
    topDashboardButtonView: {
        flexDirection: 'column',
        width: wp(100),
        height: hp(10),
        alignContent: 'space-between',
        top: hp(4)
    },
    topDashboardButton: {
        marginLeft: wp(14),
        height: hp(7),
        width: hp(7),
        backgroundColor: '#5B5A5A7F',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 15,
        borderRadius: 10
    },

    topDashboardButtonText: {
        top: hp(2),
        fontFamily: 'Changa-Regular',
        fontSize: hp(2.00),
        width: wp(25),
        textAlign: 'center',
        color: '#FFFFFF',
        alignSelf: 'center'
    },
    topGreetingView: {
        width: wp(100),
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: hp(5)
    },
    greetingText: {
        top: hp(1),
        alignSelf: 'flex-start',
        left: hp(2),
        fontFamily: 'Saira-Light',
        fontSize: hp(2.7),
        textAlign: 'left',
        flexDirection: 'column',
        color: '#FFFFFF',
    },
    greetingNameText: {
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(2.7),
        width: wp(100),
        textAlign: 'left',
        color: '#FFFFFF',
        alignSelf: 'flex-start'
    },
    imageCover: {
        alignSelf: 'flex-end'
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
    avatarAccessoryStyle: {
        left: '72%',
        top: '75%',
        backgroundColor: '#303030'
    },
    bottomView: {
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
    individualTransactionContainer: {
        width: wp(100),
        paddingBottom: hp(4),
        alignItems: 'center',
        alignContent: 'center'
    },
    emptyTransactionsListItemTitle: {
        top: hp(1.5),
        alignSelf: 'center',
        fontSize: hp(1.8),
        color: '#F2FF5D',
        fontFamily: 'Saira-Medium',
        textAlign: 'center',
        width: wp(80)
    },
    listItemTitle: {
        lineHeight: hp(2.55),
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
        left: wp(2),
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
        fontSize: hp(1.6),
        fontFamily: 'Raleway-Medium',
        color: '#FFFFFF'
    },
    rightItemIcon: {
        left: wp(2.2),
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    leftItemIconBackground: {
        left: wp(3),
        backgroundColor: '#FFFFFF',
        height: hp(6.5),
        width: hp(6.5),
        alignSelf: 'center',
        borderColor: 'transparent'
    },
    leftItemIcon: {
        alignSelf: 'center',
        height: hp(5.5),
        width: hp(5.5),
        top: hp(0.5)
    },
    mainDivider: {
        height: hp(0.05),
        width: wp(100),
        backgroundColor: '#FFFFFF'
    },
    bottomSheet: {
        backgroundColor: '#5B5A5A'
    },
    transactionParentView: {
        flex: 1,
        width: wp(100),
        height: hp(100),
        flexDirection: 'column',
        alignContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        backgroundColor: '#5B5A5A',
    },
    locationServicesEnableView: {
        height: hp(30),
        width: wp(95),
        top: hp(5),
        backgroundColor: '#262626',
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center'
    },
    locationServicesEnableWarningMessage: {
        top: hp(2),
        width: wp(85),
        fontSize: hp(2),
        fontFamily: 'Saira-Medium',
        textAlign: 'center',
        color: '#FFFFFF'
    },
    locationServicesButton: {
        backgroundColor: '#F2FF5D',
        width: wp(50),
        height: hp(5),
        top: hp(1),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    locationServicesImage: {
        width: wp(30),
        height: hp(15),
    },
    locationServicesButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1)
    },
    transactionMapView: {
        height: hp(30),
        width: wp(95),
        top: hp(5),
        alignSelf: 'center'
    },
    toolTipMain: {
        height: '100%',
        width: '100%',
        flexDirection: 'row',
        alignSelf: 'center'
    },
    toolTipTouchableView: {
        height: hp(10),
        width: wp(25),
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    toolTipView: {
        top: hp(2),
        flexDirection: 'row',
        height: '49%',
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#F2FF5D',
        borderColor: '#313030',
        borderRadius: 10,
        borderWidth: hp(0.6),
        alignContent: 'space-between'
    },
    toolTipImageDetail: {
        height: '90%',
        width: '50%',
        alignSelf: 'center'
    },
    toolTipImagePrice: {
        alignSelf: 'center',
        fontFamily: 'Raleway-ExtraBold',
        fontSize: wp(2.90),
        textAlign: 'center',
        bottom: hp(0.25),
        color: '#313030',
        width: wp(10.5)
    },
    triangleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolTipTriangleOutside: {
        zIndex: 100,
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: 'solid',
        overflow: 'hidden',
        borderLeftWidth: 16,
        borderRightWidth: 16,
        borderTopWidth: 17,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
        borderTopColor: '#313030',
    },
    toolTipTriangle: {
        zIndex: 200,
        top: hp(1.41),
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: 'solid',
        overflow: 'hidden',
        borderLeftWidth: 13,
        borderRightWidth: 13,
        borderTopWidth: 15,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
        borderTopColor: '#F2FF5D',
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
    transactionBrandImageBackground: {
        backgroundColor: '#FFFFFF',
        height: hp(8),
        width: hp(8),
        alignSelf: 'center',
        borderColor: 'transparent'
    },
    transactionBrandImage: {
        alignSelf: 'center',
        height: hp(7),
        width: hp(7),
        top: hp(0.5)
    },
    transactionAmountsView: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        right: wp(17),
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
        fontSize: hp(1.8),
        fontFamily: 'Changa-Medium',
        color: '#F2FF5D',
    },
    transactionPrice: {
        alignSelf: 'flex-start',
        fontFamily: 'Raleway-ExtraBold',
        fontSize: hp(1.75),
        bottom: hp(1.5),
        textAlign: 'justify',
        color: '#F2FF5D',
    },
    transactionTimestamp: {
        alignSelf: 'flex-start',
        fontSize: hp(1.7),
        fontFamily: 'Changa-Light',
        textAlign: 'justify',
        color: '#FFFFFF',
        bottom: hp(1)
    },
    transactionAddress: {
        alignSelf: 'flex-start',
        fontSize: hp(1.8),
        fontFamily: 'Changa-Light',
        color: '#FFFFFF',
        bottom: hp(1)
    },
    transactionDiscountAmount: {
        alignSelf: 'flex-start',
        fontSize: hp(2.3),
        fontFamily: 'Changa-Bold',
        color: '#F2FF5D'
    },
    dotsContainer: {
        width: wp(100)
    },
    progressSteps: {
        marginTop: hp(12)
    },
    activeStep: {
        backgroundColor: '#F2FF5D',
        width: wp(2.75),
        height: wp(2.75),
        marginLeft: wp(3),
        marginRight: wp(2),
        borderRadius: Math.round(wp(100) + hp(100)) / 2,
    },
    inactiveStep: {
        backgroundColor: '#D9D9D9',
        width: wp(2.75),
        height: wp(2.75),
        marginLeft: wp(3),
        marginRight: wp(2),
        borderRadius: Math.round(wp(100) + hp(100)) / 2,
    },

    legend: {
        right: wp(50),
        top: hp(1)
    },
    legendItem: {
        flexDirection: "row",
        marginTop: hp(0.75)
    },
    legendItemValue: {
        lineHeight: hp(2.70),
        left: hp(1),
        fontSize: hp(1.65),
        textAlign: 'justify',
        bottom: hp(0.35),
        fontFamily: 'Changa-Bold',
        color: '#F2FF5D'
    },
    legendItemCategoryValue: {
        width: wp(50),
        lineHeight: hp(2.40),
        left: hp(1),
        fontSize: hp(1.35),
        textAlign: 'justify',
        bottom: hp(0.35),
        fontFamily: 'Changa-Medium',
        color: '#FFFFFF'
    },
});
