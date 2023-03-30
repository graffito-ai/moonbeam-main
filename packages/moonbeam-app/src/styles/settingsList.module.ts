import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the SettingsList component
export const styles = StyleSheet.create({
    listSectionView: {
        marginTop: '10%',
        alignSelf: 'center',
        width: Dimensions.get('window').width/1.15,
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 15,
        borderRadius: 10
    },
    settingsContentView: {
        marginTop: '5%',
        flex: 1,
        flexDirection: 'column'
    },
    cardTitleStyle: {
        fontFamily: 'Raleway-Bold',
        alignSelf: 'center'
    },
    cardSubtitleStyle: {
        fontFamily: 'Raleway-Medium',
        alignSelf: 'center'
    },
    cardBodyStyle: {
        fontFamily: 'Raleway-Regular',
        textAlign: 'center'
    },
    cardStyleProfileSettings: {
        alignSelf: 'center',
        marginTop: '15%',
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 15,
    },
    profileIconImageView: {
        marginTop: '5%',
        alignSelf: 'center'
    },
    subHeaderTitle: {
        marginTop: '1.5%',
        alignSelf: 'center',
        color: '#313030',
        fontSize: 18,
        fontFamily: 'Raleway-Bold'
    },
    settingsItemTitle: {
        color: '#313030',
        fontFamily: 'Raleway-Medium'
    },
    settingsItemDescription: {
        color: '#313030',
        fontFamily: 'Raleway-Light'
    },
    settingsItemStyle: {}
});