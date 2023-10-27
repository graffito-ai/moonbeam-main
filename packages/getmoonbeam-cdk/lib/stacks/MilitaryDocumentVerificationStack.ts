import {aws_lambda, aws_lambda_nodejs, aws_sns, aws_sqs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";

export class MilitaryDocumentVerificationStack extends Stack {

    readonly militaryExtractIDProducerLambda: aws_lambda_nodejs.NodejsFunction;

    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'MilitaryDocumentVerificationConfig'>) {
        super(scope, id, props);


    }

}