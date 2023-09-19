import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Store Offer stack props.
 */
export type StoreOfferStackParamList = {
    StoreOfferDetails: {},
    StoreOfferWebView: {}
};

// the StoreOfferDetails component props, within the Store stack
export type StoreOfferDetailsProps = NativeStackScreenProps<StoreOfferStackParamList, 'StoreOfferDetails'>;
// the StoreOfferWebView component props, within the Store stack
export type StoreOfferWebViewProps = NativeStackScreenProps<StoreOfferStackParamList, 'StoreOfferWebView'>;
