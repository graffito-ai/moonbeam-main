import { StageConfiguration } from "./StageConfiguration";

/**
 * File used to define the configuration for our Infrastructure
 */
export interface InfrastructureConfiguration {
    readonly stages: Record<string, StageConfiguration>;
}
