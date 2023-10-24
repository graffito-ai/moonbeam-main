import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the Store component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        flexGrow: 1,
        width: wp(100),
        flexDirection: 'column',
        backgroundColor: '#313030'
    },
    titleView: {
        flexDirection: 'column',
        top: hp(5),
        width: wp(100)
    },
    mainTitle: {
        alignSelf: 'flex-start',
        marginLeft: wp(4),
        fontSize: hp(4.5),
        fontFamily: 'Saira-SemiBold',
        color: '#FFFFFF',
    },
    mainSubtitle: {
        marginLeft: wp(4),
        bottom: hp(1),
        fontSize: hp(2),
        fontFamily: 'Raleway-Light',
        color: '#FFFFFF'
    },
    toggleViewButton: {
        width: hp(5),
        height: hp(5)
    },
    searchBar: {
        marginTop: hp(0.5),
        width: wp(94),
        height: hp(5),
        alignSelf: 'flex-start',
        marginLeft: wp(4),
        backgroundColor: '#1c1a1f',
        borderRadius: 10
    },
    searchBarInput: {
        alignSelf: 'center',
        fontFamily: 'Raleway-Light',
        fontSize: hp(1.8),
        color: '#FFFFFF'
    },
    verticalSectionActiveChip: {
        marginRight: wp(9.80),
        borderColor: 'transparent'
    },
    verticalSectionActiveChipText: {
        alignSelf: 'center',
        fontFamily: 'Raleway-Medium',
        fontSize: hp(1.5),
        color: '#F2FF5D'
    },
    filterChipView: {
        left: wp(6),
        alignSelf: 'flex-start',
        marginTop: hp(1.5),
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    content: {
        flex: 1,
        flexGrow: 1,
        alignItems: 'flex-start'
    },
    horizontalScrollView: {
        marginTop: hp(1),
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
        flexGrow: 1
    },
    mapHorizontalView: {
        height: hp(20),
        width: wp(100),
        top: hp(1.5)
    },
    mapHorizontalViewTitleButton: {
        top: hp(3.8),
        fontSize: hp(1.5),
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end',
        right: wp(3)
    },
    mapHorizontalMapView: {
        top: hp(2),
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
    kitsScrollView: {
        bottom: hp(2),
        height: hp(35),
        width: wp(100)
    },
    kitsView: {
        height: hp(30),
        width: wp(100),
        bottom: hp(4)
    },
    kitsTitleMain: {
        fontSize: hp(2.3),
        fontFamily: 'Changa-Medium',
        left: wp(6),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    kitsTitle: {
        fontSize: hp(2.3),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: wp(6),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    featuredPartnersView: {
        height: hp(40),
        width: wp(100),
        bottom: hp(7)
    },
    featuredPartnersTitleMain: {
        fontSize: hp(2.3),
        fontFamily: 'Changa-Medium',
        left: wp(6),
        alignSelf: 'flex-start',
        flexDirection: 'column',
        color: '#FFFFFF'
    },
    featuredPartnersTitle: {
        fontSize: hp(2.3),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: wp(6),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    featuredPartnersScrollView: {
        bottom: hp(2),
        height: hp(35),
        width: wp(100)
    },
    onlineOffersView: {
        height: hp(45),
        top: hp(15)
    },
    onlineOffersTitleView: {
        justifyContent: 'space-between',
        flexDirection: 'column',
        top: hp(1)
    },
    onlineOffersLeftTitleView: {
        flexDirection: 'column'
    },
    onlineOffersTitleSub: {
        fontSize: hp(1.3),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#F2FF5D',
        left: wp(6),
        bottom: hp(0.5),
        alignSelf: 'flex-start'
    },
    onlineOffersTitleMain: {
        fontSize: hp(2.3),
        fontFamily: 'Changa-Medium',
        left: wp(6),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    onlineOffersTitle: {
        fontSize: hp(2.3),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: wp(4),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    onlineOffersTitleButton: {
        right: wp(3),
        fontSize: hp(1.5),
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end',
        bottom: hp(2.7)
    },
    onlineOffersScrollView: {
        left: wp(3),
        width: wp(100),
        height: hp(25),
        bottom: hp(2)
    },
    onlineOfferCard: {
        right: wp(2),
        backgroundColor: 'transparent',
        width: wp(33),
        height: hp(25),
        shadowColor: 'transparent',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    onlineOfferCardTitle: {
        top: hp(0.5),
        fontFamily: 'Raleway-Medium',
        fontSize: hp(2),
        lineHeight: hp(2.2),
        alignSelf: 'center',
        textAlign: 'center',
        color: '#FFFFFF'
    },
    onlineOfferCardSubtitle: {
        top: hp(0.5),
        fontSize: hp(1.8),
        fontFamily: 'Raleway-Bold',
        alignSelf: 'center',
        textAlign: 'center',
        color: '#F2FF5D'
    },
    onlineOfferCardCover: {
        width: wp(25),
        height: hp(12),
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
    },
    nearbyOffersView: {
        height: hp(40),
        width: wp(100),
        bottom: hp(8)
    },
    nearbyOffersTitleView: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        top: hp(3),
        width: wp(100)
    },
    nearbyOffersLeftTitleView: {
        flexDirection: 'column',
        alignSelf: 'flex-start'
    },
    nearbyOffersTitleMain: {
        fontSize: hp(2.3),
        fontFamily: 'Changa-Medium',
        left: wp(6),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    nearbyLoadingOffersTitleMain: {
        fontSize: hp(2.3),
        fontFamily: 'Changa-Medium',
        left: wp(6),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    nearbyLoadingOffersTitle: {
        fontSize: hp(2.3),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: wp(6),
        color: '#F2FF5D'
    },
    nearbyOffersTitle: {
        fontSize: hp(2.3),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: wp(6),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    nearbyOffersForMapTitleSub: {
        fontSize: hp(1.3),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#F2FF5D',
        left: wp(6),
        top: hp(3),
        alignSelf: 'flex-start'
    },
    nearbyOffersTitleSub: {
        fontSize: hp(1.3),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#F2FF5D',
        left: wp(6),
        bottom: hp(0.5),
        alignSelf: 'flex-start'
    },
    nearbyOffersTitleButton: {
        right: wp(3),
        fontSize: hp(1.5),
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end',
        top: hp(1),
        marginBottom: hp(1)
    },
    nearbyOffersScrollView: {
        top: hp(1),
        left: wp(0.01),
        right: wp(2),
        height: hp(50),
        width: wp(100)
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
    kitsCard: {
        top: hp(2.5),
        marginLeft: wp(5),
        backgroundColor: 'transparent',
        width: wp(70),
        height: hp(15),
        shadowColor: 'transparent',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    kitsCardTitle: {
        fontSize: hp(2.7),
        fontFamily: 'Saira-Bold',
        textAlign: 'center',
        alignSelf: 'center',
        top: hp(3),
        lineHeight: hp(4),
        width: wp(65),
        color: '#F2FF5D',
    },
    kitsCardTitleButton: {
        fontSize: hp(2),
        fontFamily: 'Saira-Bold',
        textAlign: 'center',
        alignSelf: 'center',
        textDecorationLine: 'underline',
        top: hp(3),
        lineHeight: hp(3),
        width: wp(65),
        color: '#FFFFFF',
    },
    kitsPicture: {
        height: hp(30),
        width: wp(70),
        bottom: hp(6)
    },
    featuredPartnerCard: {
        top: hp(2.5),
        marginLeft: wp(5),
        backgroundColor: '#5B5A5A',
        width: wp(85),
        height: hp(30),
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    veteranOwnedBadge: {
        alignSelf: 'flex-start',
        width: wp(20),
        height: hp(10),
    },
    featuredPartnerCardCover: {
        alignSelf: 'flex-start',
        width: wp(25),
        height: hp(12),
    },
    featuredPartnerCardTitleMain: {
        top: hp(0.5),
        width: wp(40),
        marginBottom: hp(1),
        alignSelf: 'flex-start'
    },
    featuredPartnerCardTitle: {
        right: wp(1),
        fontFamily: 'Raleway-Medium',
        fontSize: hp(2),
        width: wp(40),
        lineHeight: hp(2.4),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    featuredPartnersTitleSub: {
        fontSize: hp(1.6),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#F2FF5D',
        left: wp(6),
        bottom: hp(0.5),
        alignSelf: 'flex-start'
    },
    featuredPartnerCardSubtitle: {
        top: hp(0.5),
        right: wp(1),
        fontSize: hp(1.6),
        fontFamily: 'Raleway-SemiBold',
        alignSelf: 'flex-start',
        width: wp(40),
        lineHeight: hp(2),
        color: '#F2FF5D',
    },
    featuredPartnerCardParagraph: {
        top: hp(1),
        left: wp(2),
        fontFamily: 'Raleway-Bold',
        width: wp(50),
        fontSize: hp(1.5),
        lineHeight: hp(2),
        color: '#FFFFFF'
    },
    loadNearbyCardActionButton: {
        top: hp(10),
        right: wp(2),
        width: wp(60),
        borderRadius: 5
    },
    loadOnlineCardActionButton: {
        top: hp(3),
        // width: wp(25),
        borderRadius: 5
    },
    loadCardActionButtonLabel: {
        alignSelf: 'center',
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(1.8),
        color: '#FFFFFF'
    },
    loadOnlineCardActionButtonLabel: {
        alignSelf: 'center',
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(2),
        color: '#FFFFFF'
    },
    nearbyOfferCardParagraph: {
        left: wp(1),
        fontFamily: 'Raleway-Bold',
        width: wp(40),
        fontSize: hp(1.5),
        lineHeight: hp(2),
        color: '#FFFFFF',
        top: hp(3)
    },
    nearbyOfferCardDistanceParagraph: {
        left: wp(1),
        fontFamily: 'Raleway-ExtraBold',
        width: wp(40),
        fontSize: hp(1.3),
        lineHeight: hp(2),
        color: '#F2FF5D',
        top: hp(5)
    },
    nearbyLoadingOfferCard: {
        left: wp(4),
        bottom: hp(1),
        backgroundColor: 'transparent',
        width: wp(85),
        height: hp(30),
        shadowColor: 'transparent',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    nearbyOfferCard: {
        marginLeft: wp(5),
        backgroundColor: '#5B5A5A',
        width: wp(85),
        height: hp(27),
        shadowColor: 'black',
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
    locationServicesButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1)
    },
    nearbyLoadingOfferCardCover: {
        alignSelf: 'center',
        bottom: hp(15),
        width: wp(60),
        height: hp(45),
    },
    nearbyOfferCardCover: {
        alignSelf: 'flex-start',
        width: wp(25),
        height: hp(12)
    },
    nearbyOfferCardTitleMain: {
        marginTop: hp(1),
        width: wp(50)
    },
    nearbyOfferCardTitle: {
        right: wp(1),
        fontFamily: 'Raleway-Medium',
        fontSize: hp(2),
        width: wp(40),
        lineHeight: hp(2.4),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    nearbyOfferCardSubtitle: {
        right: wp(1),
        fontSize: hp(2),
        fontFamily: 'Raleway-SemiBold',
        alignSelf: 'flex-start',
        width: wp(40),
        color: '#F2FF5D',
    },
    viewOfferButton: {
        top: hp(2),
        alignSelf: 'flex-end',
        backgroundColor: '#F2FF5D',
        width: wp(25),
        height: hp(4),
        borderRadius: 5
    },
    viewOfferButtonContent: {
        color: '#313030',
        fontFamily: 'Changa-Medium',
        fontSize: hp(1.6),
        marginTop: hp(0.5),
        alignItems: 'center',
        alignSelf: 'center'
    },
    verticalOffersBannerCard: {
        backgroundColor: '#262626',
        borderRadius: 0,
        width: wp(100),
        height: hp(10),
        shadowColor: 'transparent',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    verticalOfferCard: {
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
    verticalOfferBenefit: {
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D'
    },
    verticalOfferBenefits: {
        marginTop: '2%',
        fontFamily: 'Raleway-SemiBold',
        color: '#FFFFFF',
        fontSize: hp(1.8)
    },
    verticalOfferBannerName: {
        alignSelf: 'center',
        fontFamily: 'Saira-SemiBold',
        color: '#F2FF5D',
        fontSize: hp(2.5),
        top: hp(1)
    },
    verticalOfferBannerSubtitleName: {
        alignSelf: 'center',
        fontFamily: 'Saira-Medium',
        color: '#FFFFFF',
        fontSize: hp(1.8),
        top: hp(0.5)
    },
    verticalNoOffersName: {
        fontFamily: 'Raleway-SemiBold',
        color: '#FFFFFF',
        fontSize: hp(1.8),
        width: wp(50),
        top: hp(2),
        left: wp(26)
    },
    verticalOfferName: {
        fontFamily: 'Raleway-SemiBold',
        color: '#FFFFFF',
        fontSize: hp(1.8),
        width: wp(50)
    },
    verticalOfferLogo: {
        bottom: hp(1.5),
        alignSelf: 'flex-start',
        marginRight: wp(4),
        height: hp(7),
        width: hp(7)
    },
    fullScreenMapLoadingCard: {
        backgroundColor: 'transparent',
        width: wp(100),
        height: hp(85),
        shadowColor: 'transparent',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15,
        bottom: hp(2)
    },
    fullScreenMapServicesEnableView: {
        right: wp(4),
        width: wp(100),
        height: hp(85),
        backgroundColor: '#262626',
        borderRadius: 30,
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'flex-start'
    },
    fullScreenMapServicesEnableWarningMessage: {
        top: hp(18),
        width: wp(85),
        fontSize: hp(2),
        fontFamily: 'Saira-Medium',
        textAlign: 'center',
        color: '#FFFFFF'
    },
    fullScreenMapServicesButton: {
        backgroundColor: '#F2FF5D',
        width: wp(50),
        height: hp(5),
        top: hp(15),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    fullScreenMapServicesImage: {
        top: hp(15),
        width: wp(45),
        height: hp(25),
    },
    fullScreenMapServicesButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1)
    },
    fullMapView: {
        height: hp(85),
        width: wp(100)
    },
    fullMapInnerView: {
        height: hp(85),
        width: wp(100),
        alignSelf: 'center'
    },
    searchButtonContentStyle: {
        color: '#F2FF5D',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1),
        alignItems: 'center',
        alignSelf: 'center'
    },
    searchButton: {
        position: 'absolute',
        bottom: hp(5),
        alignSelf: 'center',
        backgroundColor: '#313030',
        width: wp(90),
        height: hp(5.5),
        borderRadius: 0
    }
});
