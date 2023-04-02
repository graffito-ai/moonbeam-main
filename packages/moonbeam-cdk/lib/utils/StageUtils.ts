import {InfrastructureConfiguration} from "../models/InfrastructureConfiguration";
import {App, Environment} from "aws-cdk-lib";
import {AmplifyStack} from "../stacks/AmplifyStack";
import {SESStack} from "../stacks/SESStack";
import {Stages} from "@moonbeam/moonbeam-models";

/**
 * File used as a utility class, for defining and setting up all infrastructure-based stages
 */
export class StageUtils {
    // infrastructure configuration to be used for defining and setting up all stages
    private readonly configuration: InfrastructureConfiguration;

    // CDK app, passed in
    private readonly app: App;

    // target environment, passed in
    private readonly targetEnvironment: string;

    /**
     * Utility constructor
     *
     * @param app cdk application to be passed in
     * @param configuration infrastructure configuration to be passed in
     * @param targetEnvironment a combination of stage and region arguments, obtained from the CDK app context
     */
    constructor(app: App, configuration: InfrastructureConfiguration, targetEnvironment: string) {
        this.app = app;
        this.configuration = configuration;
        this.targetEnvironment = targetEnvironment;
    }

    /**
     * Function used to set up all the stages, depending on the infrastructure configuration passed in
     */
    setupStages = () => {
        // loop through all stages
        for (const stageKey in this.configuration.stages) {
            // only target stages which match with the target environment provided through the CLI, in the App context
            if (stageKey === this.targetEnvironment) {
                const stageConfiguration = this.configuration.stages[stageKey];

                // define the AWS Environment that the stacks will be deployed in
                const stageEnv: Environment = {
                    account: stageConfiguration.awsAccountId,
                    region: stageKey.split(/-(.*)/s)[1]
                }

                // create the SES stack used to verify the SES email address identity used by Amplify Auth
                const sesStack = new SESStack(this.app, `ses-${stageKey}`, {
                    stackName: `ses-${stageKey}`,
                    description: 'This stack will contain all the SES resources used by Amplify Auth',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    sesConfig: {
                        emailAddress: stageConfiguration.sesConfig!.emailAddress,
                        created: stageConfiguration.sesConfig!.created
                    },
                    environmentVariables: stageConfiguration.environmentVariables
                })

                // create the Amplify stack for all stages & add it to the CDK App
                const amplifyStack = new AmplifyStack(this.app, `amplify-${stageKey}`, {
                    stackName: `amplify-${stageKey}`,
                    description: 'This stack will contain all the Amplify resources needed for our Amplify Application',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    amplifyConfig: {
                        /**
                         * we only pass in the configuration for creating the Amplify application for one stage
                         * so that we only create the Amplify app once
                         */
                        ...(stageConfiguration.stage === Stages.DEV && {
                            amplifyAppName: stageConfiguration.amplifyConfig!.amplifyAppName!,
                            amplifyServiceRoleName: stageConfiguration.amplifyConfig!.amplifyServiceRoleName!
                        }),
                        amplifyAuthConfig: {
                            userPoolName: stageConfiguration.amplifyConfig!.amplifyAuthConfig!.userPoolName,
                            userPoolFrontendClientName: stageConfiguration.amplifyConfig!.amplifyAuthConfig!.userPoolFrontendClientName,
                            userPoolIdentityFrontendPoolName: stageConfiguration.amplifyConfig!.amplifyAuthConfig!.userPoolIdentityFrontendPoolName,
                            authenticatedRoleName: stageConfiguration.amplifyConfig!.amplifyAuthConfig!.authenticatedRoleName,
                            unauthenticatedRoleName: stageConfiguration.amplifyConfig!.amplifyAuthConfig!.unauthenticatedRoleName,
                        },
                        appSyncConfig: {
                            graphqlApiName: stageConfiguration.amplifyConfig!.appSyncConfig!.graphqlApiName
                        },
                        referralConfig: {
                            referralFunctionName: stageConfiguration.amplifyConfig!.referralConfig!.referralFunctionName,
                            referralTableName: stageConfiguration.amplifyConfig!.referralConfig!.referralTableName,
                            getResolverName: stageConfiguration.amplifyConfig!.referralConfig!.getResolverName,
                            listResolverName: stageConfiguration.amplifyConfig!.referralConfig!.listResolverName,
                            createResolverName: stageConfiguration.amplifyConfig!.referralConfig!.createResolverName,
                            updateResolverName: stageConfiguration.amplifyConfig!.referralConfig!.updateResolverName
                        },
                        accountLinkingConfig: {
                            accountLinkingFunctionName: stageConfiguration.amplifyConfig!.accountLinkingConfig!.accountLinkingFunctionName,
                            accountLinkingTableName: stageConfiguration.amplifyConfig!.accountLinkingConfig!.accountLinkingTableName,
                            getAccountLink: stageConfiguration.amplifyConfig!.accountLinkingConfig!.getAccountLink,
                            listAccounts: stageConfiguration.amplifyConfig!.accountLinkingConfig!.listAccounts,
                            createResolverName: stageConfiguration.amplifyConfig!.accountLinkingConfig!.createResolverName,
                            updateResolverName: stageConfiguration.amplifyConfig!.accountLinkingConfig!.updateResolverName,
                            deleteResolverName: stageConfiguration.amplifyConfig!.accountLinkingConfig!.deleteResolverName
                        },
                        storageConfig: {
                            deploymentBucketName: stageConfiguration.amplifyConfig!.storageConfig!.deploymentBucketName,
                            mainFilesBucketName: stageConfiguration.amplifyConfig!.storageConfig!.mainFilesBucketName,
                            mainFilesCloudFrontDistributionName: stageConfiguration.amplifyConfig!.storageConfig!.mainFilesCloudFrontDistributionName,
                            mainFilesCloudFrontTrustedPublicKeyName: stageConfiguration.amplifyConfig!.storageConfig!.mainFilesCloudFrontTrustedPublicKeyName,
                            mainFilesCloudFrontTrustedKeyGroupName: stageConfiguration.amplifyConfig!.storageConfig!.mainFilesCloudFrontTrustedKeyGroupName,
                            mainFilesCloudFrontAccessIdentityName: stageConfiguration.amplifyConfig!.storageConfig!.mainFilesCloudFrontAccessIdentityName,
                            mainFilesCloudFrontCachePolicyName: stageConfiguration.amplifyConfig!.storageConfig!.mainFilesCloudFrontCachePolicyName,
                            storageFunctionName: stageConfiguration.amplifyConfig!.storageConfig!.storageFunctionName,
                            getResolverName: stageConfiguration.amplifyConfig!.storageConfig!.getResolverName,
                            putResolverName: stageConfiguration.amplifyConfig!.storageConfig!.putResolverName
                        },
                        faqConfig: {
                            faqFunctionName: stageConfiguration.amplifyConfig!.faqConfig!.faqFunctionName,
                            faqTableName: stageConfiguration.amplifyConfig!.faqConfig!.faqTableName,
                            createResolverName: stageConfiguration.amplifyConfig!.faqConfig!.createResolverName,
                            listResolverName: stageConfiguration.amplifyConfig!.faqConfig!.listResolverName
                        }
                    },
                    environmentVariables: stageConfiguration.environmentVariables
                });
                amplifyStack.addDependency(sesStack);
            }
        }
    };
}
