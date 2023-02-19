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
    settingsContentView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardTitleStyle: {
        fontFamily: 'Raleway-Bold',
        alignSelf: 'center'
    },
    cardSubtitleStyle: {
        fontFamily: 'Raleway-Medium',
        alignSelf: 'center'
    },
    cardBodyStyle: {
        fontFamily: 'Raleway-Regular',
        textAlign: 'center'
    },
    cardStyleProfileSettings: {
        alignSelf: 'center',
        marginTop: '5%',
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 15
    },
    profileIconImageView: {
        marginTop: '5%',
        alignSelf: 'center'
    },
    subHeaderTitle: {
        marginTop: '5%',
        alignSelf: 'center',
        color: '#313030',
        fontSize: 18,
        fontFamily: 'Raleway-Medium',
        textDecorationLine: 'underline'
    },
    settingsItemTitle: {
        color: '#313030',
        fontFamily: 'Raleway-Bold'
    },
    settingsItemDescription: {
        color: '#313030',
        fontFamily: 'Raleway-Medium'
    },
    settingsItemStyle: {
        backgroundColor: '#e8e8e8'
    }
});
