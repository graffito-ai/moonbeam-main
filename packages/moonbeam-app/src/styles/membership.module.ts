import {StyleSheet} from "react-native";

// styles to be used within the Membership component
export const styles = StyleSheet.create({
    topBarView: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 15},
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 15,
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60
    },
    insideBarView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    membershipContentView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    dashboardColumnItemFirst: {},
    dashboardColumnItemMiddle: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center'
    },
    dashboardColumnItemMiddleText: {
        fontFamily: 'Raleway-Medium',
        fontSize: 18,
        color: '#313030',
        textAlign: 'center'
    },
    dashboardColumnItemLast: {
        height: 50,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
    },
    pointsLogo: {
        alignSelf: 'flex-start',
        backgroundColor: 'transparent'
    },
    pointsSubtitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: 16,
        color: '#313030',
        textAlign: 'center'
    },
    redeemButton: {
        borderRadius: 25,
        borderColor: '#313030',
        marginTop: '5%',
        alignSelf: 'flex-end'
    },
    redeemButtonOffers: {
        borderRadius: 25,
        borderColor: '#313030',
        marginTop: '5%',
        marginRight: '5%',
        alignSelf: 'flex-end'
    },
    rewardOffersTitle: {
        fontFamily: 'Raleway-Light',
        color: '#313030',
        textAlign: 'center',
        marginTop: '3%'
    },
    cardStyle: {
        marginTop: '10%',
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 15
    },
    cardStyleOffers: {
        marginTop: '5%',
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 15
    },
    cardTitleStyle: {
        fontFamily: 'Raleway-Medium'
    },
    cardSubtitleStyle: {
        fontFamily: 'Raleway-Regular'
    },
    cardBodyTitle: {
        fontFamily: 'Raleway-Regular'
    },
    cardBodyPointsContent: {
        fontFamily: 'Raleway-Light',
        color: '#2A3779',
        marginLeft: '2%'
    },
    pointsTitle: {
        fontFamily: 'Raleway-Medium',
        alignSelf: 'center',
        marginLeft: '3%'
    }
});
