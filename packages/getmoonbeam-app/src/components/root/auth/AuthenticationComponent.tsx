import React, {useEffect, useState} from "react";
import {AuthenticationProps} from "../../../models/props/RootProps";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {AuthenticationStackParamList} from "../../../models/props/AuthenticationProps";
import {NavigationContainer} from "@react-navigation/native";
import {IconButton, Text} from "react-native-paper";
import {SignInComponent} from "./SignInComponent";
import {RegistrationComponent} from "./registration/RegistrationComponent";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    accountCreationDisclaimerCheckState,
    addressCityState,
    addressLineState,
    addressStateState,
    addressZipState,
    amplifySignUpProcessErrorsState,
    birthdayState,
    currentUserInformation,
    dutyStatusValueState,
    emailState,
    enlistingYearState,
    expoPushTokenState,
    firstNameState,
    globalAmplifyCacheState,
    initialAuthenticationScreen,
    isLoadingAppOverviewNeededState,
    isReadyRegistrationState,
    lastNameState,
    mainRootNavigationState,
    marketplaceAmplifyCacheState,
    militaryBranchValueState,
    phoneNumberState,
    registrationBackButtonShown,
    registrationConfirmationPasswordState,
    registrationMainErrorState,
    registrationPasswordState,
    registrationStepNumber
} from '../../../recoil/AuthAtom';
import {AccountRecoveryComponent} from "./AccountRecoveryComponent";
import {Dimensions, TouchableOpacity} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {AppDrawer} from "../drawer/AppDrawer";
import {Spinner} from "../../common/Spinner";
import {DocumentsViewer} from "../../common/DocumentsViewer";
import * as SMS from "expo-sms";
import {styles} from "../../../styles/registration.module";
import {retrieveFidelisPartnerList, retrieveOffersNearLocation, retrieveOnlineOffersList} from "../../../utils/AppSync";

/**
 * Authentication component.
 *
 * @constructor constructor for the component.
 */
export const AuthenticationComponent = ({route, navigation}: AuthenticationProps) => {
        // constants used to keep track of local component state
        const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
        // constants used to keep track of shared states
        const [mainRootNavigation, setMainRootNavigation] = useRecoilState(mainRootNavigationState);
        const [isLoadingAppOverviewNeeded,] = useRecoilState(isLoadingAppOverviewNeededState);
        const [, setIsReady] = useRecoilState(isReadyRegistrationState);
        const [marketplaceCache, setMarketplaceCache] = useRecoilState(marketplaceAmplifyCacheState);
        const [globalCache, setGlobalCache] = useRecoilState(globalAmplifyCacheState);
        const [isRegistrationReady,] = useRecoilState(isReadyRegistrationState);
        const [, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
        const [stepNumber, setStepNumber] = useRecoilState(registrationStepNumber);
        const [userInformation,] = useRecoilState(currentUserInformation);
        const [, setExpoPushToken] = useRecoilState(expoPushTokenState);
        // step 1
        const [, setFirstName] = useRecoilState(firstNameState);
        const [, setLastName] = useRecoilState(lastNameState);
        const [, setBirthday] = useRecoilState(birthdayState);
        const [, setPhoneNumber] = useRecoilState(phoneNumberState);
        const [, setEmail] = useRecoilState(emailState);
        const [, setDutyStatus] = useRecoilState(dutyStatusValueState);
        const [, setEnlistingYear] = useRecoilState(enlistingYearState);
        // step 2
        const [, setAddressLine] = useRecoilState(addressLineState);
        const [, setAddressState] = useRecoilState(addressStateState);
        const [, setAddressZip] = useRecoilState(addressZipState);
        const [, setAddressCity] = useRecoilState(addressCityState);
        const [, setMilitaryBranch] = useRecoilState(militaryBranchValueState);
        // step 3
        const [, setPassword] = useRecoilState(registrationPasswordState);
        const [, setConfirmationPassword] = useRecoilState(registrationConfirmationPasswordState);
        const [, setAccountRegistrationDisclaimer] = useRecoilState(accountCreationDisclaimerCheckState);
        const [, setAmplifySignUpErrors] = useRecoilState(amplifySignUpProcessErrorsState);
        // do not need to clear further steps because back button won't be shown for subsequent ones

        // create a native stack navigator, to be used for our Authentication application navigation
        const Stack = createNativeStackNavigator<AuthenticationStackParamList>();

        /**
         * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
         * auth-related functionality for example), as well as any afferent API calls.
         *
         * Generally speaking, any functionality imperative prior to the full page-load should be
         * included in here.
         */
        useEffect(() => {
            // set the mai root navigation of the app accordingly
            setMainRootNavigation(navigation);
            // set the Cache to the global cache passed in from the App root component
            setGlobalCache(route.params.cache);
            // set the Marketplace Cache to the marketplace cache passed in from the App root component
            setMarketplaceCache(route.params.marketplaceCache);

            // set the expo push token accordingly, to be used in later stages, as part of the current user information object
            setExpoPushToken(route.params.expoPushToken);
        }, []);

        /**
         * Function used to contact support, via the native messaging application.
         */
        const contactSupport = async (): Promise<void> => {
            const isAvailable = await SMS.isAvailableAsync();
            if (isAvailable) {
                // customize the SMS message below
                const result = await SMS.sendSMSAsync(
                    ['210-744-6222'],
                    'Hello I would like some help with: ',
                    {}
                );
                // switch based on the result received from the async SMS action
                switch (result.result) {
                    case 'sent':
                        console.log('Message sent!');
                        break;
                    case 'unknown':
                        console.log('Unknown error has occurred while attempting to send a message!');
                        break;
                    case 'cancelled':
                        console.log('Message was cancelled!');
                        break;
                }
            } else {
                // there's no SMS available on this device
                console.log('no SMS available');
            }
        }

        // return the component for the Authentication stack
        return (
            <>
                <NavigationContainer independent={true}
                                     fallback={
                                         <Spinner loadingSpinnerShown={loadingSpinnerShown}
                                                  setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                                     }>
                    <Stack.Navigator
                        initialRouteName={useRecoilValue(initialAuthenticationScreen) == 'SignIn' ? "SignIn" : 'Registration'}
                        screenOptions={{
                            headerShown: false,
                            gestureEnabled: false
                        }}
                    >
                        <Stack.Screen
                            name="SignIn"
                            component={SignInComponent}
                            initialParams={{}}
                        />
                        <Stack.Screen
                            name="Registration"
                            component={RegistrationComponent}
                            options={({navigation}) => {
                                return ({
                                    headerTitle: '',
                                    headerShown: true,
                                    headerTransparent: true,
                                    headerRight: () => {
                                        return (<IconButton
                                            icon="help-circle-outline"
                                            iconColor={"#F2FF5D"}
                                            size={Dimensions.get('window').height / 20}
                                            style={[commonStyles.supportRegistrationButton, (!isRegistrationReady || stepNumber === 8 || stepNumber === 5) && {display: 'none'}]}
                                            onPress={async () => {
                                                // go to the support
                                                await contactSupport();
                                            }}
                                        />)
                                    },
                                    headerLeft: () => {
                                        return useRecoilValue(registrationBackButtonShown)
                                            ?
                                            (<IconButton
                                                icon="chevron-left"
                                                iconColor={"#FFFFFF"}
                                                size={Dimensions.get('window').height / 30}
                                                style={[commonStyles.backButton, !isRegistrationReady && {display: 'none'}]}
                                                onPress={() => {
                                                    // clear the registration values
                                                    // step 1
                                                    setFirstName("");
                                                    setLastName("");
                                                    setEmail("");
                                                    setBirthday("");
                                                    setPhoneNumber("");
                                                    setDutyStatus("");
                                                    setEnlistingYear("");
                                                    // step 2
                                                    setAddressLine("");
                                                    setAddressCity("");
                                                    setAddressZip("");
                                                    setAddressState("");
                                                    setMilitaryBranch("");
                                                    // step 3
                                                    setPassword("");
                                                    setConfirmationPassword("");
                                                    setAccountRegistrationDisclaimer(false);
                                                    setAmplifySignUpErrors([]);
                                                    // do not need to clear next steps because back button won't be shown for subsequent ones

                                                    // main
                                                    setRegistrationMainError(false);
                                                    setStepNumber(0);

                                                    // navigate to the AppOverviewComponent page - in case we have not already been to the SignIn
                                                    if (isLoadingAppOverviewNeeded) {
                                                        // navigate to the SignIn page - in case we have already been there
                                                        mainRootNavigation && mainRootNavigation!.navigate('AppOverview', {
                                                            marketplaceCache: route.params.marketplaceCache,
                                                            cache: route.params.cache,
                                                            expoPushToken: route.params.expoPushToken,
                                                            onLayoutRootView: route.params.onLayoutRootView
                                                        });
                                                    } else {
                                                        // navigate to the SignIn page - in case we have already been there
                                                        navigation.navigate('SignIn', {});
                                                    }
                                                }}
                                            />)
                                            : (stepNumber === 4 || stepNumber === 7 ?
                                                <TouchableOpacity
                                                    style={[styles.buttonSkip, !isRegistrationReady && {display: 'none'}]}
                                                    onPress={async () => {
                                                        if (stepNumber === 4) {
                                                            // skip the current step
                                                            setStepNumber(stepNumber + 1);

                                                            // clear the registration error
                                                            setRegistrationMainError(false);
                                                        } else {
                                                            // clear the registration error
                                                            setRegistrationMainError(false);

                                                            setIsReady(false);
                                                            /**
                                                             * if everything was successful, then:
                                                             * - we just cache the list of:
                                                             *      - Fidelis partners for initial load (for 1 week only)
                                                             *      - the list of online offers (first page only) for initial load (for 1 week only)
                                                             *      - the list of offers near user's home address (first page only) for initial load (for 1 week only)
                                                             * - we just cache an empty profile photo for the user for initial load
                                                             */
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-fidelisPartners`) !== null) {
                                                                console.log('old Fidelis Partners are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-fidelisPartners`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, await retrieveFidelisPartnerList());
                                                            } else {
                                                                console.log('Fidelis Partners are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, await retrieveFidelisPartnerList());
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`) !== null) {
                                                                console.log('online offers are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineOffers`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`, await retrieveOnlineOffersList());
                                                            } else {
                                                                console.log('online offers are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`, await retrieveOnlineOffersList());
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-offerNearUserHome`) !== null) {
                                                                console.log('offers near user home are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-offerNearUserHome`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-offerNearUserHome`,
                                                                    await retrieveOffersNearLocation(userInformation["address"]["formatted"]));
                                                            } else {
                                                                console.log('offers near user home are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-offerNearUserHome`,
                                                                    await retrieveOffersNearLocation(userInformation["address"]["formatted"]));
                                                            }
                                                            if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-profilePictureURI`) !== null) {
                                                                console.log('old profile picture is cached, needs cleaning up');
                                                                await globalCache!.removeItem(`${userInformation["custom:userId"]}-profilePictureURI`);
                                                                await globalCache!.setItem(`${userInformation["custom:userId"]}-profilePictureURI`, "");
                                                            } else {
                                                                console.log('profile picture is not cached');
                                                                globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-profilePictureURI`, "");
                                                            }
                                                            setIsReady(true);

                                                            // go to the dashboard
                                                            navigation.navigate("AppDrawer", {});
                                                        }
                                                    }}
                                                >
                                                    <Text style={styles.buttonSkipText}>Skip</Text>
                                                </TouchableOpacity> : <></>)
                                    }
                                })
                            }}
                            initialParams={{}}
                        />
                        <Stack.Screen
                            name="AccountRecovery"
                            component={AccountRecoveryComponent}
                            initialParams={{}}
                        />
                        <Stack.Screen
                            name="AppDrawer"
                            component={AppDrawer}
                            initialParams={{}}
                        />
                        <Stack.Screen
                            name="DocumentsViewer"
                            component={DocumentsViewer}
                            initialParams={{}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </>
        );
    }
;

