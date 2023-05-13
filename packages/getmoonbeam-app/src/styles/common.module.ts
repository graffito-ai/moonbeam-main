import {Dimensions, Platform, StyleSheet} from "react-native";

// styles to be used within all components
export const commonStyles = StyleSheet.create({
    backButton: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#FFFFFF',
        borderRadius: 0
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
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    rowContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
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
        flex: 1
    },
    divider: {
        backgroundColor: '#313030'
    },
    androidSafeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 25 : 0
    },
    topNavbarView: {
        height: Dimensions.get("window").height/9,
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 15,
        borderBottomLeftRadius: 45,
        borderBottomRightRadius: 45
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
    }
});
