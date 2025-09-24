export class Cluster {
    constructor(
        public clusterId: string,
        public clusterName: string
    ) { }

    toDict(): Record<string, string> {
        return { [this.clusterId]: this.clusterName };
    }
}