import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the DocumentsCenter component
export const styles = StyleSheet.create({
    content: {
        alignItems: 'center',
    },
    listSectionView: {
        marginTop: hp(5),
        alignSelf: 'center',
        width: wp(90),
        backgroundColor: '#5B5A5A',
        borderRadius: 10
    },
    documentsContentView: {
        flex: 1,
        flexGrow: 1,
        flexDirection: 'column',
        backgroundColor: '#313030'
    },
    subHeaderTitle: {
        marginTop: hp(1),
        alignSelf: 'center',
        color: '#F2FF5D',
        fontSize: hp(2.2),
        fontFamily: 'Saira-Medium'
    },
    divider: {
        width: wp(90),
        backgroundColor: '#FFFFFF'
    },
    documentsItemStyle: {
        alignSelf: 'center',
        alignItems: 'center',
        marginLeft: wp(2)
    },
    documentsItemTitle: {
        color: '#FFFFFF',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2)
    },
    documentsItemDescription: {
        color: '#FFFFFF',
        fontFamily: 'Saira-Light',
        width: wp(65),
        fontSize: hp(1.6)
    },
});
