import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Dashboard component
export const styles = StyleSheet.create({
    mainDashboardView: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#313030'
    },
    topDashboardView: {
        flex: 1,
        width: '100%',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#5B5A5A',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 8},
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 25,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    tppGreetingView: {
        left: Dimensions.get('window').width / 16,
    },
    greetingText: {
        fontFamily: 'Saira-Light',
        fontSize: Dimensions.get('window').width / 18,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    greetingTextTablet: {
        fontFamily: 'Saira-Light',
        fontSize: Dimensions.get('window').width / 24,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    greetingNameText: {
        fontFamily: 'Saira-SemiBold',
        bottom: Dimensions.get('window').width / 30,
        fontSize: Dimensions.get('window').width / 18,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    greetingNameTextTablet: {
        fontFamily: 'Saira-SemiBold',
        bottom: Dimensions.get('window').width / 40,
        fontSize: Dimensions.get('window').width / 24,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    imageCover: {
        height: '95%',
        width: '70%',
        alignSelf: 'flex-start'
    },
    imageCoverTablet: {
        height: '95%',
        width: '60%',
        alignSelf: 'flex-start'
    },
    titleStyle: {
        fontFamily: 'Raleway-Regular',
        color: 'grey'
    },
    avatarStyle: {
        left: Dimensions.get('window').width / 6.7,
        alignSelf: 'center',
        backgroundColor: 'white'
    },
    avatarStyleTablet: {
        left: Dimensions.get('window').width / 5,
        alignSelf: 'center',
        backgroundColor: 'white'
    },
    avatarAccessoryStyle: {
        left: '72%',
        top: '75%',
        backgroundColor: '#303030'
    },
    statisticsView: {
        width: Dimensions.get('window').width / 1.1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        left: Dimensions.get('window').width /7,
        top: Dimensions.get('window').height/30
    },
    statLeftView: {
        height: Dimensions.get('window').height / 15,
        width: Dimensions.get('window').width / 3.5,
        marginRight: Dimensions.get('window').width/10,
        justifyContent: 'center',
        flexDirection: 'column'
    },
    statRightView: {
        height: Dimensions.get('window').height / 15,
        width: Dimensions.get('window').width / 3.5,
        marginLeft: Dimensions.get('window').width/10,
        justifyContent: 'center',
        flexDirection: 'column'
    },
    statTitleLeft: {
        fontFamily: 'Raleway-ExtraBold',
        fontSize: Dimensions.get('window').width / 24,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    statNumberCenterLeft: {
        fontFamily: 'Changa-Medium',
        fontSize: Dimensions.get('window').width / 19,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#F2FF5D',
    },
    statNumberCenterRight: {
        fontFamily: 'Changa-Medium',
        fontSize: Dimensions.get('window').width / 19,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#F2FF5D',
    },
    statTitleRight: {
        fontFamily: 'Raleway-ExtraBold',
        fontSize: Dimensions.get('window').width / 24,
        width: Dimensions.get('window').width / 1.15,
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
        height: '50%',
        width: 2,
        backgroundColor: 'white'
    },
    bottomView: {
        flex: 1,
        top: Dimensions.get('window').height/45,
    },
    segmentedButtons: {
        width: Dimensions.get('window').width/1.15,
        alignSelf: 'center'
    },
    subHeaderTitle: {
        alignSelf: 'center',
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Saira-SemiBold'
    },
    individualTransactionContainer: {
        paddingBottom: Dimensions.get('window').height/30
    },

    listItemTitle: {
        left: Dimensions.get('window').width/20,
        color: '#FFFFFF',
        fontFamily: 'Saira-ExtraBold'
    },
    listItemDescription: {
        left: Dimensions.get('window').width/20,
        color: '#FFFFFF',
        fontFamily: 'Raleway-Regular'
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
        fontSize: Dimensions.get('window').height/55,
        fontFamily: 'Changa-Bold',
        color: '#F2FF5D',
    },
    itemRightDetailBottom: {
        marginTop: '5%',
        fontSize: Dimensions.get('window').height/60,
        fontFamily: 'Raleway-Bold',
        color: '#FFFFFF'
    },
    rightItemIcon: {
        left: Dimensions.get('window').width/40,
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    leftItemIcon: {
        left: Dimensions.get('window').width/30
    },
    mainDivider: {
        height: Dimensions.get('window').height/550,
        width: Dimensions.get('window').width,
        backgroundColor: '#FFFFFF'
    },
    divider: {
        height: Dimensions.get('window').height/750,
        alignSelf: 'flex-end',
        width: Dimensions.get('window').width/1.15,
        backgroundColor: '#5B5A5A'
    },
    bottomSheet: {
        backgroundColor: '#5B5A5A'
    },
    transactionParentView: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        backgroundColor: '#5B5A5A',

    },
    transactionMapView: {
        height: Dimensions.get('window').height/4,
        width: Dimensions.get('window').width/1.05,
        position: 'absolute',
        bottom: 20
    },
    mapTooltip: {
        zIndex: 500,
        backgroundColor: "transparent",
    },
    mapTooltipSquare: {
        zIndex: 600,
        height: Dimensions.get('window').height / 25,
        width: Dimensions.get('window').width / 4.5,
        backgroundColor: "#313030",
        borderRadius: 10,
        borderColor: '#F2FF5D',
        borderWidth: 4
    },
    mapTooltipArrow: {
        zIndex: 700,
        position: "absolute",
        top: -Dimensions.get('window').height / 100,
        right: Dimensions.get('window').width / 17.4,
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderLeftWidth: Dimensions.get('window').height / 45,
        borderRightWidth: Dimensions.get('window').height / 45,
        borderBottomWidth: Dimensions.get('window').height / 35,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "#313030"
    },
    mapTooltipArrowOverlay: {
        position: "absolute",
        top: -Dimensions.get('window').height / 60,
        right: Dimensions.get('window').width / 17.4,
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderLeftWidth: Dimensions.get('window').height / 45,
        borderRightWidth: Dimensions.get('window').height / 45,
        borderBottomWidth: Dimensions.get('window').height / 35,
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
        bottom: Dimensions.get('window').height/30,
        zIndex: 1000
    },
    toolTipImageDetail: {
        alignSelf: 'center',
        right: Dimensions.get('window').width / 55
    },
    toolTipImagePrice: {
        left: Dimensions.get('window').width / 50,
        top: Dimensions.get('window').width / 500,
        alignSelf: 'center',
        fontFamily: 'Raleway-ExtraBold',
        fontSize: Dimensions.get('window').width / 24,
        textAlign: 'center',
        color: '#F2FF5D'
    },
    transactionBrandDetailsView: {
        flexDirection: 'column',
        alignSelf: 'center',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        width: Dimensions.get('window').width
    },
    transactionBrandName: {
        alignSelf: 'flex-start',
        left: Dimensions.get('window').width / 20,
        fontFamily: 'Saira-Bold',
        fontSize: Dimensions.get('window').width / 18,
        color: '#FFFFFF'
    },
    transactionDetailsView: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: Dimensions.get('window').width,
        left: Dimensions.get('window').width / 20,
    },
    transactionBrandImage: {
        alignSelf: 'flex-start',
        borderRadius: 10
    },
    transactionAmountsView: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        width: Dimensions.get('window').width/1.5,
        bottom: Dimensions.get('window').height/33,
        right: Dimensions.get('window').width / 8,
    },
    brandDetailsView: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: Dimensions.get('window').width/1.5,
        bottom: Dimensions.get('window').height/200,
        left: Dimensions.get('window').width / 20,
    },
    transactionAmountLabel: {
        fontSize: Dimensions.get('window').width / 23,
        fontFamily: 'Changa-Medium',
        color: '#FFFFFF'
    },
    transactionStatusLabel: {
        fontSize: Dimensions.get('window').width / 23,
        fontFamily: 'Changa-Medium',
        color: '#F2FF5D'
    },
    transactionTimestamp: {
        alignSelf: 'flex-start',
        fontSize: Dimensions.get('window').width / 28,
        fontFamily: 'Changa-Light',
        textAlign: 'justify',
        width: Dimensions.get('window').width/3,
        lineHeight: Dimensions.get('window').height/45,
        color: '#FFFFFF'
    },
    transactionAddress: {
        alignSelf: 'flex-start',
        fontSize: Dimensions.get('window').width / 28,
        fontFamily: 'Changa-Light',
        textAlign: 'justify',
        width: Dimensions.get('window').width/3,
        lineHeight: Dimensions.get('window').height/45,
        color: '#FFFFFF'
    },
    transactionDiscountAmount: {
        alignSelf: 'flex-start',
        fontSize: Dimensions.get('window').width / 20,
        fontFamily: 'Changa-Bold',
        color: '#F2FF5D'
    },
    transactionDiscountPercentage: {
        alignSelf: 'flex-start',
        bottom: Dimensions.get('window').height/50,
        fontSize: Dimensions.get('window').width / 20,
        fontFamily: 'Changa-Bold',
        color: '#F2FF5D'
    },
    transactionStatus: {
        alignSelf: 'flex-start',
        left: Dimensions.get('window').width / 20,
        fontFamily: 'Changa-Bold',
        color: '#FFFFFF'
    },
    transactionLocation: {
        alignSelf: 'flex-start',
        left: Dimensions.get('window').width / 20,
        fontFamily: 'Changa-Bold',
        color: '#FFFFFF'
    },
});
