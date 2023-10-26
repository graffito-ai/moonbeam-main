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
    kitOffersView: {
        flex: 1,
        flexGrow: 1,
    },
    kitOffersTitleView: {
        justifyContent: 'space-between',
        flexDirection: 'column',
        width: wp(100),
        left: wp(5),
        top: hp(2)
    },
    kitOffersTitleSub: {
        fontSize: hp(1.3),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#FFFFFF',
        bottom: hp(0.5),
        alignSelf: 'flex-start'
    },
    kitOffersTitleMain: {
        fontSize: hp(2.5),
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    kitOffersTitleButton: {
        right: wp(3),
        fontSize: hp(1.5),
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end',
        bottom: hp(2.7)
    },
    kitOfferCard: {
        backgroundColor: 'transparent',
        marginLeft: wp(2),
        width: wp(100),
        height: hp(10),
        shadowColor: 'transparent',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    kitOfferLogo: {
        bottom: hp(1.5),
        alignSelf: 'flex-start',
        marginRight: wp(4),
        height: hp(7),
        width: hp(7),
        borderWidth: wp(0.05),
        borderColor: '#F2FF5D',
        borderRadius: 10
    },
    kitOfferName: {
        fontFamily: 'Raleway-SemiBold',
        color: '#FFFFFF',
        fontSize: hp(1.8),
        width: wp(50)
    },
    kitOfferDistance: {
        fontFamily: 'Saira-SemiBold',
        color: '#F2FF5D',
        fontSize: hp(1.3),
        alignSelf: 'flex-start'
    },
    kitOfferBenefitsView: {
        fontFamily: 'Raleway-SemiBold',
        color: '#FFFFFF',
        fontSize: hp(1.8)
    },
    kitOfferBenefit: {
        fontFamily: 'Saira-Bold',
        color: '#F2FF5D'
    },
    kitOfferBenefits: {
        fontFamily: 'Saira-SemiBold',
        color: '#FFFFFF',
        fontSize: hp(1.6)
    },
    kitNoOffersName: {
        fontFamily: 'Raleway-SemiBold',
        color: '#FFFFFF',
        fontSize: hp(1.8),
        width: wp(50),
        top: hp(2),
        left: wp(26)
    },
    moreButton: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'flex-end',
        right: wp(8),
        bottom: hp(4),
        alignItems: 'center',
        justifyContent: 'center'
    },
    moreButtonText: {
        color: '#F2FF5D',
        fontFamily: 'Saira-Medium',
        textDecorationLine: 'underline',
        fontSize: hp(1.8),
        marginTop: hp(1)
    },
    loadCard: {
        left: wp(1),
        width: wp(20),
        height: hp(30),
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    mapHorizontalView: {
        height: hp(20),
        width: wp(100)
    },
    mapHorizontalMapView: {
        height: hp(15),
        width: wp(92),
        left: wp(5)
    },
    toolTipMain: {
        height: hp(9.5),
        width: wp(25),
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    toolTipImageDetail: {
        alignSelf: 'center',
        height: hp(2.5),
        bottom: hp(0.7),
        left: wp(1),
        width: wp(10)
    },
    toolTipImagePrice: {
        alignSelf: 'center',
        fontFamily: 'Raleway-ExtraBold',
        fontSize: hp(1.7),
        bottom: hp(0.7),
        textAlign: 'center',
        color: '#313030'
    },
    nearbyLoadingOfferCard: {
        left: wp(5),
        bottom: hp(4),
        backgroundColor: 'transparent',
        width: wp(85),
        height: hp(30),
        shadowColor: 'transparent',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    locationServicesEnableView: {
        top: hp(2),
        right: wp(4),
        height: hp(33),
        backgroundColor: '#262626',
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'flex-start'
    },
    locationServicesEnableWarningMessage: {
        top: hp(2),
        width: wp(85),
        fontSize: hp(1.8),
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
    noOffersKitImage: {
        width: wp(45),
        height: hp(15),
        left: wp(6)
    },
    locationServicesButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1)
    },
});
