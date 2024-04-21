import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the Wallet component
export const styles = StyleSheet.create({
    priceTitle: {
        alignSelf: 'center',
        fontFamily: 'Saira-Bold',
        fontSize: hp(3.5),
        textDecorationLine: 'underline',
        textAlign: 'left',
        color: '#FFFFFF',
        left: wp(15),
        lineHeight: hp(4),
        top: hp(0.5)
    },
    cardView: {
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    mainCardView: {
        flex: 1,
        width: wp(100),
        paddingTop: hp(3)
    },
    noCardImage: {
        height: hp(55),
        width: wp(55),
        bottom: hp(15),
        alignSelf: 'center'
    },
    walletTopTitleView: {
        height: hp(7),
        width: wp(100),
        flexDirection: 'column'
    },
    walletView: {
        flex: 1,
        width: wp(100),
        height: hp(100),
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#313030'
    },
    cardRemovalButton: {
        backgroundColor: '#F2FF5D',
        position: 'absolute',
        width: wp(40),
        height: hp(5),
        bottom: -hp(10),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    linkingButtonDisabled: {
        display: "none"
    },
    splashButton: {
        backgroundColor: '#F2FF5D',
        width: wp(50),
        height: hp(5),
        marginBottom: hp(1),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1.3)
    },
    listSectionView: {
        left: wp(4),
        marginTop: hp(3),
        alignSelf: 'flex-start',
        width: wp(90),
        borderRadius: 10
    },
    cardItemStyle: {
        flex: 1,
        borderRadius: 20
    },
    cardItemTitle: {
        fontFamily: 'Saira-Bold',
        fontSize: hp(2.5),
        width: wp(40),
        bottom: hp(2.8),
        right: wp(20)
    },
    cardItemDetails: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(2),
        left: wp(3.5),
        width: wp(85)
    },
    cardLinkingParentView: {
        backgroundColor: '#5B5A5A',
        alignContent: 'center',
        alignSelf: 'center',
        alignItems: 'center'
    },
    cardLinkingIframeView: {
        backgroundColor: 'transparent',
        width: wp(125),
        flexGrow: 1
    },
    disclaimerTextView: {
        position: 'absolute',
        bottom: hp(5),
        alignItems: 'center',
        alignSelf: 'center',
        textAlign: 'center'
    },
    disclaimerText: {
        fontFamily: 'Saira-Regular',
        fontSize: hp(2.1),
        width: wp(70),
        textAlign: 'center',
        color: '#FFFFFF'
    },
    walletTextView: {
        top: hp(2),
        flexDirection: 'column',
        marginTop: hp(4)
    },
    walletTitle: {
        alignSelf: 'flex-start',
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(4),
        left: wp(6),
        color: '#FFFFFF'
    },
    cardRemovalTitle: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(3.5),
        color: '#FFFFFF'
    },
    cardRemovalDetails: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.5),
        bottom: hp(1.5),
        color: '#F2FF5D'
    },
    cardRemovalSubtitle: {
        fontFamily: 'Raleway-Regular',
        fontSize: hp(2),
        width: wp(90),
        top: hp(1),
        textAlign: 'center',
        color: '#FFFFFF'
    },
    bottomSheet: {
        backgroundColor: '#5B5A5A'
    },
    highlightedText: {
        color: '#F2FF5D'
    },
    infoCardButtonContentStyle: {
        color: '#F2FF5D',
        fontFamily: 'Saira-Bold',
        textDecorationLine: 'underline',
        fontSize: hp(2.20),
        marginTop: hp(0.5),
        alignItems: 'center',
        alignSelf: 'center'
    },
    infoCardButton: {
        right: wp(30),
        top: hp(18),
        backgroundColor: 'transparent',
        width: wp(50),
        height: hp(5),
        borderRadius: 0
    },
    startMembershipButton: {
        alignSelf: 'center',
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(5.5),
        left: wp(35),
        borderRadius: 0,
        position: 'absolute',
        bottom: hp(5.5)
    },
    startMembershipButtonContentStyle: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1),
        alignItems: 'center',
        alignSelf: 'center'
    },
    firstClassImage: {
        height: hp(20),
        width: wp(43),
        alignSelf: 'center'
    },
    firstClassTitle: {
        color: '#F2FF5D',
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(3.50),
        alignSelf: 'center',
        width: wp(80),
        textAlign: 'center'
    },
    firstClassPrice: {
        color: '#FFFFFF',
        lineHeight: hp(2.5),
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(2),
        alignSelf: 'center',
        width: wp(95),
        textAlign: 'center'
    },
    firstClassPerksTitle: {
        color: '#FFFFFF',
        lineHeight: hp(2.75),
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(2.40),
        alignSelf: 'center',
        width: wp(95),
        textAlign: 'center',
        top: hp(1),
        marginBottom: hp(5),
    },
    firstClassPerksView: {
        height: hp(45),
        width: wp(100),
        alignSelf: 'center',
        bottom: hp(2.5),
        flexDirection: 'column'
    },
    firstClassPerk: {
        color: '#FFFFFF',
        lineHeight: hp(2.50),
        fontFamily: 'Raleway-SemiBold',
        fontSize: hp(1.85),
        alignSelf: 'flex-end',
        width: wp(95),
        textAlign: 'center',
        bottom: hp(5)
    },
    firstClassIndividualPerk: {
        height: hp(10),
        alignSelf: 'center',
        flexDirection: 'row',
    }
});
