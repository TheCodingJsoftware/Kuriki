import { Cluster } from '@models/cluster';
import { OutcomeType } from '@models/outcome-type';
import { GeneralLearningOutcome } from '@models/general-learning-outcome';
import { DistinctiveLearningOutcome } from '@models/distinctive-learning-outcome';

export interface RawSocialStudiesOutcome {
    outcome_id: string;
    grade: string;
    cluster: Record<string, string>;
    outcome_type: Record<string, string>;
    specific_learning_outcome: string;
    general_learning_outcome: Record<string, string>;
    distinctive_learning_outcome: Record<string, string>;
}

export class SocialStudiesOutcome {
    private _data: {
        outcomeId: string;
        grade: string;
        cluster: Cluster;
        outcomeType: OutcomeType;
        specificLearningOutcome: string;
        generalLearningOutcome: GeneralLearningOutcome;
        distinctiveLearningOutcome: DistinctiveLearningOutcome;
    };

    constructor(data: RawSocialStudiesOutcome) {
        const [clusterId, clusterName] = Object.entries(data.cluster ?? {})[0] ?? ['', ''];
        const [outcomeTypeId, outcomeTypeName] = Object.entries(data.outcome_type ?? {})[0] ?? ['', ''];
        const [gloId, gloName] = Object.entries(data.general_learning_outcome ?? {})[0] ?? ['', ''];
        const [dloId, dloName] = Object.entries(data.distinctive_learning_outcome ?? {})[0] ?? ['', ''];

        this._data = {
            outcomeId: data.outcome_id ?? '',
            grade: data.grade ?? '',
            cluster: new Cluster(clusterId, clusterName),
            outcomeType: new OutcomeType(outcomeTypeId, outcomeTypeName),
            specificLearningOutcome: data.specific_learning_outcome ?? '',
            generalLearningOutcome: new GeneralLearningOutcome(gloId, gloName),
            distinctiveLearningOutcome: new DistinctiveLearningOutcome(dloId, dloName)
        };
    }

    get outcomeId() { return this._data.outcomeId; }
    get grade() { return this._data.grade; }
    get cluster() { return this._data.cluster; }
    get outcomeType() { return this._data.outcomeType; }
    get generalLearningOutcome() { return this._data.generalLearningOutcome; }
    get distinctiveLearningOutcome() { return this._data.distinctiveLearningOutcome; }
}