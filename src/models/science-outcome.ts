import { Cluster } from "@models/cluster";
import { GeneralLearningOutcome } from "@models/general-learning-outcome";
import { Outcome, RawOutcome } from '@models/outcome';

export interface RawScienceOutcome extends RawOutcome {
    cluster: Record<string, string>;
    general_learning_outcomes: Record<string, string>;
}

export class ScienceOutcome extends Outcome<{
    outcomeId: string;
    grade: string;
    specificLearningOutcome: string;
    cluster: Cluster;
    generalLearningOutcomes: GeneralLearningOutcome[];
}> {
    constructor(data: RawScienceOutcome) {
        super(data)

        const [clusterId, clusterName] = Object.entries(data.cluster ?? {})[0] ?? ['', ''];

        this._data = {
            ...this._data,
            cluster: new Cluster(clusterId, clusterName),
            generalLearningOutcomes: Object.entries(data.general_learning_outcomes).map(([id, description]) => new GeneralLearningOutcome(id, description))
        }
    }

    get cluster() { return this._data.cluster; }
    get generalLearningOutcomes() { return this._data.generalLearningOutcomes; }

    public toString(): string {
        return `${this.outcomeId} ${this.specificLearningOutcome} [${this.generalLearningOutcomes.map(glo => glo.id).join(", ")}]`
    }
}
