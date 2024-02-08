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
        flexGrow: 1
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
    kitOfferLogoBackground: {
        bottom: hp(1.5),
        backgroundColor: '#FFFFFF',
        height: hp(7),
        width: hp(7),
        alignSelf: 'center',
        borderColor: 'transparent',
        borderWidth: hp(0.2),
        marginRight: wp(4)
    },
    kitOfferLogo: {
        alignSelf: 'center',
        height: hp(6.5),
        width: hp(6.5)
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
        height: '100%',
        width: '100%',
        flexDirection: 'row',
        alignSelf: 'center'
    },
    toolTipTouchableView: {
        height: hp(10),
        width: wp(25),
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    toolTipView: {
        top: hp(2),
        flexDirection: 'row',
        height: '49%',
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#F2FF5D',
        borderColor: '#313030',
        borderRadius: 10,
        borderWidth: hp(0.6),
        alignContent: 'space-between'
    },
    toolTipImageDetail: {
        height: '90%',
        width: '50%',
        alignSelf: 'center'
    },
    toolTipImagePrice: {
        alignSelf: 'center',
        fontFamily: 'Raleway-ExtraBold',
        fontSize: wp(3.5),
        textAlign: 'center',
        bottom: hp(0.25),
        color: '#blue'
    },
    triangleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolTipTriangleOutside: {
        zIndex: 100,
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: 'solid',
        overflow: 'hidden',
        borderLeftWidth: 16,
        borderRightWidth: 16,
        borderTopWidth: 17,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
        borderTopColor: '#313030',
    },
    toolTipTriangle: {
        zIndex: 200,
        top: hp(1.41),
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: 'solid',
        overflow: 'hidden',
        borderLeftWidth: 13,
        borderRightWidth: 13,
        borderTopWidth: 15,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
        borderTopColor: '#F2FF5D',
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
        top: hp(2),
        width: wp(35),
        height: hp(15),
        left: wp(5)
    },
    locationServicesButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1)
    }
});
