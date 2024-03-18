import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Home stack props.
 */
export type HomeStackParamList = {
    DashboardController: {},
    Services: {},
    Marketplace: {},
    Cards: {}
};

// the Dashboard component props, within the Home stack
export type DashboardHomeProps = NativeStackScreenProps<HomeStackParamList, 'DashboardController'>;
// the Services component props, within the Home stack
export type ServicesProps = NativeStackScreenProps<HomeStackParamList, 'Services'>;
// the Marketplace component props, within the Home stack
export type MarketplaceProps = NativeStackScreenProps<HomeStackParamList, 'Marketplace'>;
// the Cards component props, within the Home stack
export type CardsProps = NativeStackScreenProps<HomeStackParamList, 'Cards'>;
