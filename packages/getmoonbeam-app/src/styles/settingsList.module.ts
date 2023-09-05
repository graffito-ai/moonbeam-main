import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the SettingsList component
export const styles = StyleSheet.create({
    listSectionView: {
        marginTop: hp(5),
        alignSelf: 'center',
        width: wp(90),
        backgroundColor: '#5B5A5A',
        borderRadius: 10
    },
    settingsContentView: {
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
    settingsItemTitle: {
        color: '#FFFFFF',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2)
    },
    settingsItemDescription: {
        color: '#FFFFFF',
        fontFamily: 'Saira-Light',
        width: wp(65),
        fontSize: hp(1.6)
    },
    divider: {
        width: wp(90),
        backgroundColor: '#FFFFFF'
    },
    settingsItemStyle: {
        alignSelf: 'center',
        alignItems: 'center',
        marginLeft: wp(2)
    },
    backButton: {
        alignSelf: 'flex-start',
        right: wp(5),
        bottom: hp(1.5)
    }
});
