import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

// styles to be used within the StoreOfferDetails component
export const styles = StyleSheet.create({
    content: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: '#313030',
        alignItems: 'flex-start'
    },
    verticalScrollView: {
        marginTop: hp(1),
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
        flexGrow: 1
    },
    onlineKitOffersView: {
        width: wp(100),
        height: hp(35),
        top: hp(15),
        left: wp(4.5)
    },

    onlineKitOffersTitleView: {
        justifyContent: 'space-between',
        flexDirection: 'column',
        top: hp(5)
    },
    onlineKitOffersLeftTitleView: {
        flexDirection: 'column'
    },
    onlineKitOffersTitleSub: {
        fontSize: hp(1.3),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#F2FF5D',
        bottom: hp(0.5),
        alignSelf: 'flex-start'
    },
    onlineKitOffersTitleMain: {
        fontSize: hp(2.5),
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        color: '#F2FF5D'
    },
    onlineKitOffersTitleButton: {
        right: wp(3),
        fontSize: hp(1.5),
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end',
        bottom: hp(2.7)
    },
});
