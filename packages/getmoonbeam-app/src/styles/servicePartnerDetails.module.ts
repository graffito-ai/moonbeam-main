import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

// styles to be used within the ServicePartnerDetails component
export const styles = StyleSheet.create({
    topSectionView: {
        alignSelf: 'center',
        width: wp(100),
        overflow: 'hidden',
        height: hp(30)
    },
    topCurvedView: {
        borderRadius: wp(100),
        width: wp(100) * 2,
        height: wp(100) * 2,
        marginLeft: -(wp(100) / 2),
        position: 'absolute',
        bottom: 0,
        overflow: 'hidden',
        backgroundColor: '#F2FF5D'
    },
    topCurvedViewContent: {
        height: hp(27),
        width: wp(60),
        flexDirection: 'column',
        alignSelf: 'center',
        position: 'absolute',
        bottom: 0,
    },
    topCurvedViewLogoContent: {
        height: hp(10),
        width: wp(58),
        bottom: hp(1),
        flexDirection: 'row',
        justifyContent: 'center'
    },
    topCurvedViewLogoText: {
        fontFamily: 'Raleway-SemiBold',
        fontSize: hp(1.75),
        color: '#F2FF5D',
        top: hp(0.65),
        textAlign: 'center',
        height: hp(3)
    },
    brandLogo: {
        alignSelf: 'center',
        width: hp(24),
        height: hp(22)
    },
    partnerWebsiteButton: {
        position: 'absolute',
        bottom: hp(2),
        marginBottom: hp(1.5),
        alignSelf: 'center',
        backgroundColor: '#F2FF5D',
        width: wp(55),
        height: hp(4.75),
        borderRadius: 10
    },
    partnerWebsiteButtonContent: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.30),
        marginTop: hp(0.5),
        alignItems: 'center',
        alignSelf: 'center'
    },
    activeSelectionTabButtonView: {
        width: wp(45),
        height: hp(5.5),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'center',
        top: hp(2)
    },
    selectionTabButton: {
        width: wp(20),
        height: hp(4.5),
        backgroundColor: 'transparent',
        borderRadius: 10,
        top: hp(0.50)
    },
    selectionTabButtonActive: {
        width: wp(20),
        height: hp(4.5),
        backgroundColor: '#F2FF5D',
        borderRadius: 10,
        top: hp(0.50)
    },
    selectionTabButtonText: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.85),
        textAlign: 'center',
        width: wp(32),
        alignSelf: 'center',
        color: '#FFFFFF',
        top: hp(0.75)
    },
    selectionTabButtonTextActive: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.85),
        textAlign: 'center',
        width: wp(32),
        alignSelf: 'center',
        color: '#313030',
        top: hp(0.75)
    },
    partnerContentAboutSectionView: {
        marginBottom: hp(5)
    },
    partnerContentSectionTitle: {
        fontFamily: 'Raleway-Bold',
        fontSize: hp(1.90),
        color: '#F2FF5D',
        top: hp(2),
        textAlign: 'left',
        alignSelf: 'flex-start',
        left: wp(7),
        width: wp(80)
    },
    partnerContentSectionContent: {
        fontFamily: 'Raleway-Medium',
        fontSize: hp(1.75),
        color: '#FFFFFF',
        top: hp(3),
        textAlign: 'left',
        alignSelf: 'flex-start',
        left: wp(7),
        width: wp(90),
        marginBottom: hp(1)
    },
});
