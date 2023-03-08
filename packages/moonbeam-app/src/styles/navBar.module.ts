import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the NavBar component
export const styles = StyleSheet.create({
    topDashboardView: {
        height: Dimensions.get("window").height/2.6,
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 15,
        borderBottomLeftRadius: 45,
        borderBottomRightRadius: 45
    },
    insideDashboardView: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    dashboardColumnItemFirst: {
        top: '20%',
        left: '2%',
        alignSelf: 'flex-start'
    },
    dashboardColumnItemMiddle: {
        top: '10%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    },
    dashboardColumnItemLast: {
        alignSelf: 'flex-end',
        bottom: '65.5%'
    },
    dashboardBalanceTopView: {
    },
    balanceDashboardTitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: 20,
        color: '#313030',
        alignSelf: 'center'
    },
    homeDashboardLogo: {
        height: 80,
        width: 150,
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
    dashboardButtonView: {
        bottom: '20%',
        flexDirection: 'row',
        shadowColor: 'grey',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 15,
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
    }
});
