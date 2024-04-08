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
    searchBarBackButton: {
        left: wp(3),
        top: hp(1.2),
        marginRight: wp(4)
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
        marginRight: wp(3),
        borderColor: 'transparent',
        marginTop: hp(1)
    },
    verticalSectionActiveChipText: {
        alignSelf: 'center',
        fontFamily: 'Raleway-Medium',
        fontSize: hp(1.25),
        color: '#F2FF5D'
    },
    filterChipView: {
        left: wp(4),
        alignSelf: 'flex-start',
        marginTop: hp(0.5),
        width: wp(100),
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
        top: hp(4.4),
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
    marketplaceButtonLabel: {
        fontFamily: 'Saira-Bold',
        color: 'black',
        fontSize: hp(2.5),
        lineHeight: hp(3),
        right: wp(4),
        alignSelf: 'center',
        bottom: hp(2),
        textDecorationLine: 'underline'
    },
    bannerDescription: {
        top: hp(2),
        alignSelf: 'center',
        right: wp(4),
        height: hp(12),
        width: wp(64),
        textAlign: 'center',
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(2),
        color: '#F2FF5D'
    },
    bannerDescriptionFullScreen: {
        top: hp(25),
        alignSelf: 'center',
        height: hp(12),
        width: wp(100),
        textAlign: 'center',
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(3.5),
        color: '#F2FF5D'
    },
    marketplaceButtonLabelFullScreen: {
        top: hp(30),
        fontFamily: 'Saira-Bold',
        color: 'black',
        fontSize: hp(4),
        lineHeight: hp(5),
        alignSelf: 'center',
        textDecorationLine: 'underline'
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
    unlinkedToolTipImagePrice: {
        height: hp(2),
        width: wp(11.5),
        bottom: hp(1),
        alignSelf: 'flex-end',
        right: wp(11)
    },
    toolTipImagePrice: {
        alignSelf: 'center',
        fontFamily: 'Raleway-ExtraBold',
        fontSize: wp(2.90),
        textAlign: 'center',
        bottom: hp(0.25),
        color: '#313030',
        width: wp(10.5)
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
    toolTipFullScreenImageDetailBackground: {
        backgroundColor: '#FFFFFF',
        height: hp(3),
        width: hp(3),
        alignSelf: 'flex-start',
        borderColor: 'transparent',
        bottom: hp(0.75),
        marginRight: wp(5),
        left: wp(1.55),
        borderTopLeftRadius: 3,
        borderBottomLeftRadius: 3,
    },
    kitsScrollView: {
        bottom: hp(2),
        height: hp(30),
        width: wp(100),
        paddingLeft: hp(2.5)
    },
    kitsView: {
        height: hp(40),
        width: wp(100),
        top: hp(1)
    },
    kitsTitleMain: {
        fontSize: hp(3),
        fontFamily: 'Changa-Bold',
        left: wp(6),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    kitsTitle: {
        fontSize: hp(2.75),
        fontFamily: 'Changa-Bold',
        left: wp(6),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    featuredPartnersView: {
        height: hp(40),
        width: wp(100),
        bottom: hp(5)
    },
    featuredPartnerTitleView: {
        width: wp(100),
        bottom: hp(4),
        // backgroundColor: '#262626'
    },
    featuredPartnersTitleMain: {
        left: wp(6),
        alignSelf: 'flex-start',
        flexDirection: 'column',
        color: '#FFFFFF'
    },
    featuredPartnersTitle: {
        fontSize: hp(3),
        fontFamily: 'Changa-Bold',
        left: wp(6),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    featuredPartnersScrollView: {
        bottom: hp(4.5),
        width: wp(100)
    },
    clickOnlyOnlineOffersView: {
        height: hp(20)
    },
    onlineOffersView: {
        height: hp(30),
        bottom: hp(6)
    },
    onlineOffersTitleView: {
        justifyContent: 'space-between',
        flexDirection: 'column',
        top: hp(1)
    },
    onlineOffersLeftTitleView: {
        flexDirection: 'column',
        // backgroundColor: '#262626',
        width: wp(100),
        height: hp(8)
    },
    clickOnlyOnlineOffersTitleSub: {
        fontSize: hp(1.5),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#F2FF5D',
        left: wp(6),
        bottom: hp(0.5),
        alignSelf: 'flex-start'
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
        fontSize: hp(3),
        fontFamily: 'Changa-Bold',
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
        bottom: hp(3)
    },
    clickOnlyOnlineOffersScrollView: {
        paddingLeft: wp(3),
        width: wp(100),
        height: hp(25)
    },
    onlineOffersScrollView: {
        paddingLeft: wp(3),
        width: wp(100),
        height: hp(25),
        bottom: hp(4)
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
    clickOnlyOnlineOfferCardTitle: {
        top: hp(0.5),
        fontFamily: 'Raleway-Bold',
        fontSize: hp(1.75),
        lineHeight: hp(2.2),
        alignSelf: 'center',
        textAlign: 'center',
        color: '#FFFFFF'
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
    unlinkedClickOnlyOnlineOfferCardSubtitle: {
        height: hp(2),
        width: wp(10),
        bottom: hp(1.6),
        alignSelf: 'flex-end',
        right: wp(11)
    },
    clickOnlyOnlineOfferCardSubtitle: {
        top: hp(0.5),
        fontSize: hp(1.65),
        fontFamily: 'Raleway-Bold',
        alignSelf: 'center',
        textAlign: 'center',
        color: '#F2FF5D'
    },
    unlinkedOnlineOfferCardSubtitle: {
        height: hp(2),
        width: wp(10),
        bottom: hp(1.6),
        alignSelf: 'flex-end',
        right: wp(12.5)
    },
    onlineOfferCardSubtitle: {
        top: hp(0.5),
        fontSize: hp(1.8),
        fontFamily: 'Raleway-Bold',
        alignSelf: 'center',
        textAlign: 'center',
        color: '#F2FF5D'
    },
    onlineOfferCardCoverBackground: {
        backgroundColor: '#FFFFFF',
        width: wp(25),
        height: wp(25),
        alignSelf: 'center',
        borderColor: 'transparent',
        borderWidth: hp(0.2)
    },
    onlineOfferCardCover: {
        alignSelf: 'center',
        width: wp(24),
        height: wp(24),
    },
    clickOnlyOnlineOfferCardCover: {
        width: wp(20),
        height: wp(20),
        borderRadius: 70,
        alignSelf: 'center'
    },
    clickOnlyOnlineOfferCardCoverBackground: {
        backgroundColor: '#FFFFFF',
        width: wp(21),
        height: wp(21),
        borderRadius: 70,
        alignSelf: 'center',
        borderColor: 'transparent',
        borderWidth: hp(0.2)
    },
    nearbyOffersView: {
        height: hp(65),
        width: wp(100),
        bottom: hp(7)
    },
    nearbyOffersTitleView: {
        // backgroundColor: '#262626',
        justifyContent: 'space-between',
        flexDirection: 'row',
        top: hp(2.5),
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
        fontSize: hp(3),
        fontFamily: 'Changa-Bold',
        left: wp(6),
        color: '#FFFFFF'
    },
    nearbyOffersTitle: {
        fontSize: hp(3),
        fontFamily: 'Changa-Bold',
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
        top: hp(1),
        alignSelf: 'flex-start'
    },
    nearbyOffersTitleSub: {
        fontSize: hp(1.3),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#F2FF5D',
        left: wp(6),
        bottom: hp(1),
        alignSelf: 'flex-start'
    },
    nearbyOffersTitleButton: {
        right: wp(3),
        fontSize: hp(1.5),
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end',
        bottom: hp(1.5)
    },
    nearbyOffersScrollView: {
        top: hp(1),
        left: wp(0.01),
        right: wp(2),
        width: wp(100),
        height: hp(50)
    },
    onlineLoadCard: {
        bottom: hp(4),
        alignSelf: 'center',
        width: wp(20),
        right: wp(50),
        height: hp(30),
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    nearbyLoadCard: {
        alignSelf: 'center',
        left: wp(15),
        height: hp(30),
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    clickOnlyOnlineLoadCard: {
        bottom: hp(1),
        alignSelf: 'center',
        width: wp(20),
        right: wp(38),
        height: hp(30),
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
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
        marginRight: wp(5),
        backgroundColor: 'transparent',
        width: wp(70),
        height: hp(30),
        // borderTopWidth: hp(0.15),
        borderRadius: 0,
        // borderTopColor: '#5B5A5A',
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
        top: hp(1),
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
    unlinkedVeteranOwnedBadge: {
        alignSelf: 'flex-start',
        width: wp(20),
        height: hp(10),
        bottom: hp(2)
    },
    featuredPartnerCardCoverBackground: {
        backgroundColor: '#FFFFFF',
        width: wp(25),
        height: wp(25),
        alignSelf: 'center',
        borderColor: 'transparent',
        borderWidth: hp(0.2)
    },
    featuredPartnerCardCover: {
        alignSelf: 'center',
        width: wp(24),
        height: wp(24),
    },
    featuredPartnerCardTitleMain: {
        top: hp(0.5),
        width: wp(40),
        marginBottom: hp(1),
        alignSelf: 'flex-start'
    },
    unlinkedFeaturedPartnerCardTitle: {
        right: wp(1),
        fontFamily: 'Raleway-Medium',
        fontSize: hp(2),
        width: wp(40),
        alignSelf: 'flex-start',
        marginTop: -hp(2),
        color: '#FFFFFF'
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
        fontSize: hp(1.5),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#F2FF5D',
        left: wp(6),
        bottom: hp(1),
        width: wp(80),
        alignSelf: 'flex-start'
    },
    unlinkedFeaturedPartnerCardSubtitle: {
        height: hp(2),
        width: wp(36),
        bottom: hp(1.6),
        alignSelf: 'flex-start',
        left: wp(0.5)
    },
    featuredPartnerCardSubtitleUnlinked: {
        top: hp(0.5),
        left: wp(1.5),
        fontSize: hp(1.6),
        fontFamily: 'Raleway-SemiBold',
        alignSelf: 'flex-start',
        width: wp(40),
        lineHeight: hp(2),
        color: '#F2FF5D',
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
    unlinkedFeaturedPartnerCardParagraph: {
        bottom: hp(1),
        left: wp(1.5),
        fontFamily: 'Raleway-Bold',
        width: wp(50),
        fontSize: hp(1.5),
        lineHeight: hp(2),
        color: '#FFFFFF'
    },
    featuredPartnerCardParagraph: {
        top: hp(1),
        left: wp(1.5),
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
    unlinkedNearbyOfferCardParagraph: {
        left: wp(1),
        fontFamily: 'Raleway-Bold',
        width: wp(40),
        fontSize: hp(1.5),
        lineHeight: hp(2),
        color: '#FFFFFF',
        bottom: hp(2.5)
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
    unlinkedNearbyOfferCardDistanceParagraph: {
        left: wp(1),
        fontFamily: 'Raleway-ExtraBold',
        width: wp(40),
        fontSize: hp(1.3),
        lineHeight: hp(2),
        color: '#F2FF5D',
        bottom: hp(1.5)
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
        left: wp(6),
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
        width: wp(80),
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
    nearbyOfferCardCoverBackground: {
        backgroundColor: '#FFFFFF',
        width: wp(23),
        height: wp(23),
        alignSelf: 'center',
        borderColor: 'transparent',
        borderWidth: hp(0.2)
    },
    nearbyOfferCardCover: {
        alignSelf: 'center',
        width: wp(22),
        height: wp(22)
    },
    nearbyOfferCardTitleMain: {
        marginTop: hp(1),
        width: wp(50)
    },
    unlinkedNearbyOfferCardTitle: {
        right: wp(1),
        bottom: hp(4),
        fontFamily: 'Raleway-Medium',
        fontSize: hp(2),
        width: wp(40),
        lineHeight: hp(2.4),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
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
    nearbyOfferCardSubtitleUnlinked: {
        left: wp(1.5),
        fontSize: hp(2),
        fontFamily: 'Raleway-SemiBold',
        alignSelf: 'flex-start',
        width: wp(40),
        color: '#F2FF5D',
    },
    unlinkedNearbyOfferCardSubtitle: {
        height: hp(3),
        width: wp(19),
        bottom: hp(3),
        alignSelf: 'flex-start',
        left: wp(0.5)
    },
    nearbyOfferCardSubtitle: {
        right: wp(1),
        fontSize: hp(2),
        fontFamily: 'Raleway-SemiBold',
        alignSelf: 'flex-start',
        width: wp(40),
        color: '#F2FF5D',
    },
    unlinkedViewOfferButton: {
        bottom: hp(2),
        alignSelf: 'flex-end',
        backgroundColor: '#F2FF5D',
        width: wp(25),
        height: hp(4),
        borderRadius: 5
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
    verticalOfferDistance: {
        fontFamily: 'Saira-SemiBold',
        color: '#F2FF5D',
        fontSize: hp(1.3),
        alignSelf: 'flex-start'
    },
    verticalOfferBenefit: {
        fontFamily: 'Saira-Bold',
        color: '#F2FF5D'
    },
    unlinkedVerticalOfferBenefit: {
        height: hp(2.5),
        width: wp(35),
        marginTop: -hp(2.5),
        alignSelf: 'flex-end',
        right: wp(17)
    },
    unlinkedVerticalOfferBenefitNonFidelis: {
        height: hp(2.5),
        width: wp(20),
        marginTop: -hp(2.5),
        alignSelf: 'flex-end',
        right: wp(33.5)
    },
    verticalOfferBenefits: {
        fontFamily: 'Saira-SemiBold',
        color: '#FFFFFF',
        fontSize: hp(1.6)
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
    verticalOfferBannerSubtitleNameHighlighted: {
        alignSelf: 'center',
        fontFamily: 'Saira-Medium',
        color: '#F2FF5D',
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
    verticalOfferLogoBackground: {
        bottom: hp(1.5),
        backgroundColor: '#FFFFFF',
        height: hp(8),
        width: hp(8),
        alignSelf: 'center',
        borderColor: 'transparent',
        borderWidth: hp(0.2),
        marginRight: wp(4)
    },
    verticalOfferLogo: {
        alignSelf: 'center',
        height: hp(7.5),
        width: hp(7.5)
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
        width: wp(55),
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
    },
    kitsHeaderPicture: {
        height: hp(18),
        width: wp(100),
        flexDirection: 'column'
    },
    kitsHeaderView: {
        height: hp(18),
        width: wp(100)
    },
    kitsHeaderTitle: {
        top: hp(9),
        left: wp(2),
        alignSelf: 'flex-start',
        color: '#F2FF5D',
        textAlign: 'center',
        fontSize: hp(4),
        fontFamily: 'Saira-SemiBold'
    },
    kitsHeaderDismissButton: {
        alignSelf: 'flex-end',
        top: hp(2.5)
    },
    kitRadiusView: {
        backgroundColor: '#313030',
        height: hp(5),
        width: wp(100),
        borderRadius: 60,
        bottom: hp(2)
    },
    kitsRadiusDismissButton: {
        top: hp(1),
        width: wp(10),
        left: wp(5)
    },
    kitRadiusFullMapView: {
        flexDirection: 'row',
        backgroundColor: '#313030',
        height: hp(8),
        width: wp(100),
        bottom: hp(3),
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    },
    kitRadiusFullMapViewTitle: {
        alignSelf: 'center',
        marginLeft: wp(2),
        fontSize: hp(3.5),
        fontFamily: 'Saira-SemiBold',
        color: '#FFFFFF'
    },
    kitRadiusFullMapViewSubtitle: {
        alignSelf: 'center',
        bottom: hp(1),
        marginLeft: wp(2)
    },
    kitRadiusFullMapViewTitleView: {
        alignSelf: 'center',
        flexDirection: 'column',
        left: wp(17),
        height: hp(8)
    },
    seasonalOffersBannerCard: {
        bottom: hp(2),
        backgroundColor: '#262626',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: hp(10),
        width: wp(100),
        shadowColor: 'transparent',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    seasonalOfferBannerName: {
        alignSelf: 'center',
        fontFamily: 'Saira-SemiBold',
        color: '#F2FF5D',
        fontSize: hp(2.5),
        top: hp(1)
    },
    seasonalOfferBannerSubtitleName: {
        alignSelf: 'center',
        fontFamily: 'Saira-Medium',
        color: '#FFFFFF',
        fontSize: hp(1.8),
        top: hp(0.5)
    },
    searchDivider: {
        top: hp(1),
        width: wp(100),
        alignSelf: 'center'
    },
    searchSuggestionView: {
        top: hp(2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: wp(100),
        height: hp(7),
        alignSelf: 'center'
    },
    searchSuggestionLeftIcon: {
        alignSelf: 'flex-start',
        top: hp(0.5),
        marginLeft: wp(2)
    },
    searchSuggestionRightIcon: {
        alignSelf: 'flex-end',
        top: hp(0.5),
        marginRight: wp(2)
    },
    searchSuggestionTextHighlighted: {
        alignSelf: 'flex-start',
        fontFamily: 'Saira-SemiBold',
        color: '#F2FF5D',
        fontSize: hp(2),
        top: hp(0.5),
        width: wp(70),
        textAlign: 'left'
    },
    searchSuggestionText: {
        alignSelf: 'flex-start',
        fontFamily: 'Saira-SemiBold',
        color: '#FFFFFF',
        fontSize: hp(2),
        top: hp(0.5),
        width: wp(70),
        textAlign: 'left'
    },
});
