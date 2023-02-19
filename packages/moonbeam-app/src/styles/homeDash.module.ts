import {StyleSheet} from "react-native";

// styles to be used within the Home component
export const styles = StyleSheet.create({
    topBarView: {
        flex: 0.5,
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 15},
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 25,
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60
    },
    insideBarView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    topBarColumnView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dashboardColumnItemFirst: {
        flex: 1,
        marginLeft: '2%',
        marginBottom: '50%',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    dashboardColumnItemMiddle: {
        flex: 1,
        zIndex: 1,
        marginBottom: '12%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    },
    dashboardColumnItemLast: {
        flex: 1,
        marginBottom: '50%',
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    homeDashboardLogo: {
        height: 80,
        width: 150,
        alignSelf: 'center'
    },
    balanceDashboardTitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: 20,
        color: '#313030',
        alignSelf: 'center'
    },
    balanceDashboardBalanceTotal: {
        fontFamily: 'Raleway-Regular',
        fontSize: 20,
        color: '#A2B000',
        alignSelf: 'center'
    },
    balanceDashboardBalanceAvailable: {
        fontFamily: 'Raleway-Regular',
        fontSize: 20,
        color: '#A2B000',
        alignSelf: 'center'
    },
    balanceDashboardBalanceAvailableText: {
        fontFamily: 'Raleway-Regular',
        fontSize: 18,
        color: '#313030',
        alignSelf: 'center'
    },
    dashboardBalanceTopView: {
        // marginTop: '5%'
    },
    dashboardButtonView: {
        flexDirection: 'row',
        position: 'absolute',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 25,
        alignSelf: 'center'
    },
    dashboardButtonRight: {
        alignSelf: 'center',
        elevation: 15
    },
    dashboardButtonLeft: {
        alignSelf: 'center'
    },
    dashboardButtonText: {
        fontFamily: 'Raleway-Bold',
        fontSize: 18,
        color: '#313030',
        alignSelf: 'center'
    },
    segmentedButtons: {
        width: 350,
        alignSelf: 'center'
    },
    subHeaderTitle: {
        alignSelf: 'center',
        color: '#313030',
        fontSize: 18,
        fontFamily: 'Raleway-Bold'
    },
    dashboardItemTitle: {
        color: '#313030',
        fontFamily: 'Raleway-Bold'
    },
    dashboardItemDescription: {
        color: '#313030',
        fontFamily: 'Raleway-Medium'
    },
    topListItemRightView: {
        flexDirection: 'row'
    },
    topPriceView: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    listItemPrice: {
        fontSize: 16,
        fontFamily: 'Raleway-Bold',
        color: '#313030',
    },
    topPaymentView: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    listItemPaymentAmount: {
        fontSize: 16,
        fontFamily: 'Raleway-Bold',
        color: '#313030',
        marginBottom: '17%'
    },
    listItemDiscount: {
        marginTop: '5%',
        fontSize: 13,
        fontFamily: 'Raleway-Medium',
        color: '#2A3779',
        backgroundColor: '#c9d179'
    },
    listItemIcon: {
        alignItems: 'flex-end',
        justifyContent: 'center'
    }
});
