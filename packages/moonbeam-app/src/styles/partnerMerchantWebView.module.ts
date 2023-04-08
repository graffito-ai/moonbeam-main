import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the PartnerMerchantWebView component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    webViewNavbar: {
        height: Dimensions.get('window').height/11,
        backgroundColor: '#f2f2f2',
        justifyContent: 'space-between',
        flexDirection: 'row',
        flexWrap: 'nowrap'
    },
    cardDetailsButton: {
        width: Dimensions.get('window').width/3.5,
        backgroundColor: '#dbdbdb'
    },
    cardDetailsSectionLabel: {
        fontSize: 15,
        width:  Dimensions.get('window').width/3.5,
        fontFamily: 'Raleway-Medium',
        color: '#313030',
        textAlign: 'center'
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
        right: Dimensions.get('window').width/10
    },
    bottomBarPointsView: {
        alignSelf: 'flex-start',
        top: '3%', right: Dimensions.get('window').width / 18,
        borderColor: '#313030', borderBottomWidth: 1
    },
    bottomBarPointNumberLabel: {
        fontFamily: 'Raleway-Bold',
        fontSize: Dimensions.get('window').height / 50
    },
    bottomBarPointsLabel: {
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 70
    },
    bottomBarDiscountsView: {
        alignSelf: 'flex-end',
        bottom: '5%',
        right: Dimensions.get('window').width / 3.2
    },
    bottomBarDiscountsNumberLabel: {
        fontFamily: 'Raleway-Bold',
        fontSize: Dimensions.get('window').height / 50
    },
    bottomBarDiscountsLabel: {
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 70
    }
});
