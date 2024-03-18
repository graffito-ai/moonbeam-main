import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Services stack props.
 */
export type ServicesStackParamList = {
    ServiceOfferings: {},
    ServicePartner: {},
    EventSeries: {}
};

// the ServiceOfferings component props, within the Services stack
export type ServiceOfferingsProps = NativeStackScreenProps<ServicesStackParamList, 'ServiceOfferings'>;
// the ServicePartner component props, within the Services stack
export type ServicePartnerProps = NativeStackScreenProps<ServicesStackParamList, 'ServicePartner'>;
// the EventSeries component props, within the Services stack
export type EventSeriesProps = NativeStackScreenProps<ServicesStackParamList, 'EventSeries'>;
