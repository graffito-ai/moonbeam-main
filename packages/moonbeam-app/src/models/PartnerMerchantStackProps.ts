import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from "react";

/**
 * The default list of params, to be used across all Partner Merchant derived stack props.
 */
export type PartnerMerchantStackParamList = {
    PartnerMerchantStore: {
        currentUserInformation: any
    },
    PartnerMerchantWebView: {
        currentUserInformation: any
        setWebViewRef: React.Dispatch<React.SetStateAction<any>>
    }
};

// the PartnerMerchantStore component props, within the Store stack
export type PartnerMerchantStoreProps = NativeStackScreenProps<PartnerMerchantStackParamList, 'PartnerMerchantStore'>
// the PartnerMerchantWebview component props, within the Store stack
export type PartnerMerchantWebViewProps = NativeStackScreenProps<PartnerMerchantStackParamList, 'PartnerMerchantWebView'>

