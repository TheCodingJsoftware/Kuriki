
export type CurriculumId =
    | "mathematics_2013-2014"
    | "science_1999-2000"
    | "biology_2010-2011"
    | "social_studies_2003";


export interface Curriculum {
    id: CurriculumId;
    icon: string;
    name: string;
    years: string;
    color: string;
}

export const CURRICULA: Record<CurriculumId, Curriculum> = {
    "mathematics_2013-2014": {
        id: "mathematics_2013-2014",
        icon: "calculate",
        name: "Mathematics",
        years: "2013-2014",
        color: "#0061a4",
    },
    "science_1999-2000": {
        id: "science_1999-2000",
        icon: "science",
        name: "Science",
        years: "1999-2000",
        color: "#78dc77",
    },
    "biology_2010-2011": {
        id: "biology_2010-2011",
        icon: "genetics",
        name: "Biology",
        years: "2010-2011",
        color: "#9ed75b",
    },
    "social_studies_2003": {
        id: "social_studies_2003",
        icon: "globe",
        name: "Social Studies",
        years: "2003",
        color: "#dbc90a",
    },
};
