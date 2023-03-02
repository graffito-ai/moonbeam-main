import {Regions} from "../models/enum/Regions";
import {Stages} from "../models/enum/Stages";
import {InfrastructureConfiguration} from "../models/InfrastructureConfiguration";

/**
 * Infrastructure configuration file, for all stages and regions
 */
export const INFRA_CONFIG: InfrastructureConfiguration = {
    stages: {
        [`${Stages.DEV}-${Regions.PDX}`]: {
            stage: Stages.DEV,
            awsAccountId: '963863720257',
            amplifyConfig: {
                amplifyAppName: 'moonbeam-application',
                amplifyServiceRoleName: 'moonbeam-application-service-role',
                amplifyAuthConfig: {
                    userPoolName: 'moonbeam-application-pool',
                    userPoolFrontendClientName: 'moonbeam-application-pool-client',
                    userPoolIdentityFrontendPoolName: 'moonbeam-application-frontend-pool-identity',
                    authenticatedRoleName: 'moonbeam-authenticated-role',
                    unauthenticatedRoleName: 'moonbeam-unauthenticated-role'
                },
            },
            sesConfig: {
                emailAddress: `cloudservices-${Stages.DEV}@moonbeam.vet`,
                /**
                 * this flag will need to be updated once the email address has been verified,
                 * and/or any time we want to verify another email address
                 */
                created: true
            },
            environmentVariables: new Map<string, string>([])
        },
        // [`${Stages.STAGING}-${Regions.PDX}`]: {
        //     stage: Stages.STAGING,
        //     awsAccountId: '507419278294',
        //     environmentVariables: new Map<string, string>([])
        // },
        // [`${Stages.PREVIEW}-${Regions.PDX}`]: {
        //     stage: Stages.STAGING,
        //     awsAccountId: '407863107367',
        //     environmentVariables: new Map<string, string>([])
        // },
    }
}
