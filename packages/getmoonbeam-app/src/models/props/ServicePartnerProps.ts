import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Service Partner stack props.
 */
export type ServicePartnerStackParamList = {
    ServicePartnerDetails: {},
    ServicePartnerWebView: {}
};

// the ServicePartnerDetails component props, within the Service Partner stack
export type ServicePartnerDetailsProps = NativeStackScreenProps<ServicePartnerStackParamList, 'ServicePartnerDetails'>;
// the ServicePartnerWebViewProps component props, within the Service Partner stack
export type ServicePartnerWebViewProps = NativeStackScreenProps<ServicePartnerStackParamList, 'ServicePartnerWebView'>;
