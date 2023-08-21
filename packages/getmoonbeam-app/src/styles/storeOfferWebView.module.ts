import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the StoreOfferWebView component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: '#313030',
    },
    webViewNavbar: {
        height: Dimensions.get('window').height/11,
        backgroundColor: '#313030',
        justifyContent: 'space-between',
        flexDirection: 'row',
        flexWrap: 'nowrap'
    },
    cardDetailsButton: {
        width: Dimensions.get('window').width/3.5,
        backgroundColor: '#5B5A5A'
    },
    cardDetailsSectionLabel: {
        fontSize: 15,
        width:  Dimensions.get('window').width/2,
        fontFamily: 'Raleway-Medium',
        color: 'white',
        textAlign: 'right'
    },
    cardDetailsTab: {
        paddingBottom: Dimensions.get('window').height/300
    },
    webViewBackButton: {
        bottom: '1%',
        alignSelf: 'center'
    },
    webViewForwardButton: {
        bottom: '1%',
        alignSelf: 'center',
        right: Dimensions.get('window').width/6
    },
    bottomBarDiscountsView: {
        alignSelf: 'flex-end',
        bottom: Dimensions.get('window').height/35,
        right: Dimensions.get('window').width / 4
    },
    bottomBarDiscountsNumberLabel: {
        fontFamily: 'Raleway-Bold',
        fontSize: Dimensions.get('window').height / 55,
        textAlign: 'center',
        color: '#F2FF5D'
    },
    bottomBarDiscountsLabel: {
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 60,
        textAlign: 'center'
    },
    topBar: {
        flex: 0.15,
        backgroundColor: '#313030',
        flexDirection: 'column',
    },
    containerView: {
        left: Dimensions.get('window').width/7.5,
        flex: 0.15,
        justifyContent: 'space-between',
        flexDirection: 'row',
        flexWrap: 'nowrap'
    },
    urlBar: {
        right: Dimensions.get('window').width / 40,
        top: Dimensions.get('window').height / 11,
        alignSelf: 'flex-end',
        backgroundColor: '#dbdbdb',
        width: Dimensions.get('window').width / 1.15,
        height: Dimensions.get('window').height / 25
    },
    urlInput: {
        alignSelf: 'center',
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height/55
    },
    urlBarOutline: {
        borderColor: '#dbdbdb',
        borderRadius: 10
    },
    urlLockIcon: {
        top: '25%',
        alignSelf: 'flex-start'
    },
    urlReloadIcon: {
        top: '25%'
    }
});
