import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within all components
export const commonStyles = StyleSheet.create({
    backButton: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#FFFFFF',
        borderRadius: 0
    },
    backButtonDismiss: {
        alignSelf: 'flex-start',
        bottom: hp(1)
    },
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#313030'
    },
    columnContainer: {
        flex: 1,
        width: wp(100),
        height: hp(100),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    rowContainer: {
        flex: 1,
        flexGrow: 1,
        width: wp(100),
        height: hp(100),
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    keyboardScrollViewContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    image: {
        flex: 1,
        flexGrow: 1
    },
    divider: {
        backgroundColor: '#303030'
    },
    insideNavbarBarText: {
        marginTop: '15%',
        fontFamily: 'Raleway-Bold',
        fontSize: 18,
        color: '#313030',
        textAlign: 'center'
    },
    insideNavbarBarView: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    dialogStyle: {
        backgroundColor: '#5B5A5A',
        borderRadius: wp(5)
    },
    dialogParagraph: {
        color: '#FFFFFF',
        fontFamily: 'Raleway-Regular',
        fontSize: hp(1.8),
        textAlign: 'left'
    },
    dialogTitle: {
        color: '#F2FF5D',
        fontFamily: 'Raleway-Bold',
        fontSize: hp(2.2)
    },
    dialogButton: {
        backgroundColor: '#F2FF5D'
    },
    dialogButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
    },
    dialogParagraphBold: {
        fontWeight: "bold",
        color: '#FFFFFF'
    },
    dialogParagraphNumbered: {
        color: '#F2FF5D'
    },
    dialogIcon: {
        alignSelf: 'flex-start'
    }
});
