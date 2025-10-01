import { Cluster } from '@models/cluster';
import { OutcomeType } from '@models/outcome-type';
import { GeneralLearningOutcome } from '@models/general-learning-outcome';
import { DistinctiveLearningOutcome } from '@models/distinctive-learning-outcome';
import { Outcome, RawOutcome } from '@models/outcome';

export interface RawSocialStudiesOutcome extends RawOutcome {
    cluster: Record<string, string>;
    outcome_type: Record<string, string>;
    general_learning_outcome: Record<string, string>;
    distinctive_learning_outcome: Record<string, string>;
}

export class SocialStudiesOutcome extends Outcome<{
    outcomeId: string;
    grade: string;
    cluster: Cluster;
    outcomeType: OutcomeType;
    specificLearningOutcome: string;
    generalLearningOutcome: GeneralLearningOutcome;
    distinctiveLearningOutcome: DistinctiveLearningOutcome;
}> {
    constructor(data: RawSocialStudiesOutcome) {
        super(data);

        const [clusterId, clusterName] = Object.entries(data.cluster ?? {})[0] ?? ['', ''];
        const [outcomeTypeId, outcomeTypeName] = Object.entries(data.outcome_type ?? {})[0] ?? ['', ''];
        const [gloId, gloName] = Object.entries(data.general_learning_outcome ?? {})[0] ?? ['', ''];
        const [dloId, dloName] = Object.entries(data.distinctive_learning_outcome ?? {})[0] ?? ['', ''];

        this._data = {
            ...this._data,
            cluster: new Cluster(clusterId, clusterName),
            outcomeType: new OutcomeType(outcomeTypeId, outcomeTypeName),
            generalLearningOutcome: new GeneralLearningOutcome(gloId, gloName),
            distinctiveLearningOutcome: new DistinctiveLearningOutcome(dloId, dloName)
        };
    }

    get cluster() { return this._data.cluster; }
    get outcomeType() { return this._data.outcomeType; }
    get generalLearningOutcome() { return this._data.generalLearningOutcome; }
    get distinctiveLearningOutcome() { return this._data.distinctiveLearningOutcome; }

    public toString(): string {
        return `${this.outcomeId} ${this.specificLearningOutcome}`
    }
}