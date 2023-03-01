import { Regions } from "../models/enum/Regions";
import { Stages } from "../models/enum/Stages";
import { InfrastructureConfiguration } from "../models/InfrastructureConfiguration";

/**
 * Infrastructure configuration file, for all stages and regions
 */
export const INFRA_CONFIG: InfrastructureConfiguration = {
    stages: {
        [`${Stages.DEV}-${Regions.PDX}`]: {
            stage: Stages.DEV,
            awsAccountId: '963863720257',
            environmentVariables: new Map<string, string>([])
        },
        // [`${Stages.STAGING}-${Regions.PDX}`]: {
        //     awsAccountId: '507419278294',
        //     environmentVariables: new Map<string, string>([])
        // },
        // [`${Stages.PREVIEW}-${Regions.PDX}`]: {
        //     awsAccountId: '407863107367',
        //     environmentVariables: new Map<string, string>([])
        // },
    }
}
