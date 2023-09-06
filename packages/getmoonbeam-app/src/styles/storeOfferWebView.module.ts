import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the StoreOfferWebView component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: '#313030',
    },
    webViewNavbar: {
        height: hp(11),
        width: wp(100),
        backgroundColor: '#313030',
        flexDirection: 'row'
    },
    cardDetailsButton: {
        alignSelf: 'flex-end',
        position: 'absolute',
        bottom: hp(10),
        backgroundColor: '#5B5A5A'
    },
    cardDetailsSectionLabel: {
        fontSize: hp(2.5),
        width: wp(90),
        fontFamily: 'Raleway-Medium',
        color: 'white',
        textAlign: 'right'
    },
    webViewBackButton: {
        alignSelf: 'flex-start'
    },
    webViewForwardButton: {
        alignSelf: 'flex-end'
    },
    bottomBarDiscountsView: {
        alignSelf: 'center',
        flexDirection: "column",
        alignItems: 'center',
        alignContent: 'center',
        width: wp(50)
    },
    bottomBarDiscountsNumberLabel: {
        fontFamily: 'Raleway-Bold',
        fontSize: hp(2),
        textAlign: 'center',
        color: '#F2FF5D'
    },
    bottomBarDiscountsLabel: {
        fontFamily: 'Raleway-Medium',
        fontSize: hp(2),
        textAlign: 'center',
        color: '#FFFFFF'
    },
    topBar: {
        width: wp(100),
        height: hp(12),
        backgroundColor: '#313030',
        flexDirection: 'row'
    },
    urlBar: {
        alignSelf: 'center',
        bottom: hp(0.3),
        backgroundColor: '#dbdbdb',
        width: wp(80),
        height: hp(4)
    },
    urlInput: {
        fontFamily: 'Raleway-Medium',
        fontSize: hp(1.7),
        textAlign: 'center',
        width: wp(80),
        color: '#FFFFFF'
    },
    urlBarOutline: {
        borderColor: '#dbdbdb',
        borderRadius: 10
    }
});
