import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {StoreStackParamList} from './StoreStackProps';
import {PartnerStore} from "../../../moonbeam-models";

/**
 * The default list of params, to be used across all Partner Merchant derived stack props.
 */
export type PartnerMerchantStackParamList = {
    PartnerMerchantStore: {
        partnerStore: PartnerStore
    },
    PartnerMerchantWebView: {
        currentUserInformation: any,
        navigation?: NativeStackNavigationProp<StoreStackParamList, "PartnerMerchant">,
        rootLink: string
    }
};

// the PartnerMerchantStore component props, within the Store stack
export type PartnerMerchantStoreProps = NativeStackScreenProps<PartnerMerchantStackParamList, 'PartnerMerchantStore'>
// the PartnerMerchantWebview component props, within the Store stack
export type PartnerMerchantWebViewProps = NativeStackScreenProps<PartnerMerchantStackParamList, 'PartnerMerchantWebView'>

