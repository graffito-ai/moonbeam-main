import {RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import {StageConfiguration} from "../models/StageConfiguration";

/**
 * File used to define the SES stack, used in the Auth stack.
 */
export class SESStack extends Stack {
    /**
     * Constructor for the SES stack
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor (scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'sesConfig'>) {
        super(scope, id, props);

        /**
         * It is used to verify an SES email address identity, by initiating a verification so that SES
         * sends a verification email to the desired email address. This means the owner of the email address
         * still needs to act by clicking the link in the verification email.
         */
        !props.sesConfig!.created && new AwsCustomResource(this, 'VerifyEmailIdentity-' + props.sesConfig!.emailAddress, {
            onCreate: {
                service: 'SES',
                action: 'verifyEmailIdentity',
                parameters: {
                    EmailAddress: props.sesConfig!.emailAddress,
                },
                physicalResourceId: PhysicalResourceId.of('verify-' + props.sesConfig!.emailAddress),
                region: props.env!.region,
            },
            onDelete: props.sesConfig!.removalPolicy === RemovalPolicy.RETAIN ? undefined : {
                service: 'SES',
                action: 'deleteIdentity',
                parameters: {
                    Identity: props.sesConfig!.emailAddress,
                },
                region: props.env!.region,
            },
            policy: this.generateSesPolicyForCustomResource('VerifyEmailIdentity', 'DeleteIdentity'),
        });
    }

    /**
     * Function used to generate a SES policy for a custom resource
     *
     * @param methods methods to generate the ses policy for
     * @private
     */
    private generateSesPolicyForCustomResource = (...methods: string[]): AwsCustomResourcePolicy => {
        // for some reason the default policy is generated as `email:<method>` which does not work -> hence we need to provide our own
        return AwsCustomResourcePolicy.fromStatements([
            new PolicyStatement({
                actions: methods.map((method) => 'ses:' + method),
                effect: Effect.ALLOW,
                // PolicySim says ses:SetActiveReceiptRuleSet does not allow specifying a resource, hence use '*'
                resources: ['*'],
            }),
        ]);
    }
}
