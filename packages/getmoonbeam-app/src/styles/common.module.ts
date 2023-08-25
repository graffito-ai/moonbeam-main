import {Dimensions, Platform, StyleSheet} from "react-native";

// styles to be used within all components
export const commonStyles = StyleSheet.create({
    supportRegistrationButton: {
        alignSelf: 'flex-end',
        bottom: Dimensions.get('window').height/100
    },
    backButton: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#FFFFFF',
        borderRadius: 0
    },
    backButtonDismiss: {
        alignSelf: 'flex-start',
        bottom: Dimensions.get('window').height/100
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
        flex: 1,
        flexGrow: 1
    },
    divider: {
        backgroundColor: '#303030'
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
    },
    dialogStyle: {
        backgroundColor: '#5B5A5A',
        borderRadius: 15
    },
    dialogParagraph: {
        color: '#FFFFFF',
        fontFamily: 'Raleway-Regular',
        fontSize: Dimensions.get('window').height/60,
        textAlign: 'left'
    },
    dialogTitle: {
        color: '#F2FF5D',
        fontFamily: 'Raleway-Bold',
        fontSize: Dimensions.get('window').height/50
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
