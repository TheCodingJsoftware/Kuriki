import { Cluster } from "./cluster";
import { GeneralLearningOutcome } from "./general-learning-outcome";

export interface RawScienceOutcome {
    outcome_id: string;
    grade: string;
    specific_learning_outcome: string;
    cluster: Record<string, string>;
    general_learning_outcomes: Record<string, string>;
}

export class ScienceOutcome {
    private _data: {
        outcomeId: string;
        grade: string;
        specificLearningOutcome: string;
        cluster: Cluster;
        generalLearningOutcomes: GeneralLearningOutcome[];
    }

    constructor(data: RawScienceOutcome) {
        const [clusterId, clusterName] = Object.entries(data.cluster ?? {})[0] ?? ['', ''];

        this._data = {
            outcomeId: data.outcome_id,
            grade: data.grade,
            specificLearningOutcome: data.specific_learning_outcome,
            cluster: new Cluster(clusterId, clusterName),
            generalLearningOutcomes: Object.entries(data.general_learning_outcomes).map(([id, description]) => new GeneralLearningOutcome(id, description))
        }
    }
    get outcomeId() { return this._data.outcomeId; }
    get grade() { return this._data.grade; }
    get specificLearningOutcome() { return this._data.specificLearningOutcome; }
    get cluster() { return this._data.cluster; }
    get generalLearningOutcomes() { return this._data.generalLearningOutcomes; }
}
