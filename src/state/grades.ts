// Central source of truth for grade codes and labels

export type Grade =
    | "K" | "1" | "2" | "3" | "4" | "5"
    | "6" | "7" | "8" | "9"
    | "10E" | "10I" | "11A" | "11E" | "11P"
    | "12A" | "12E" | "12P";

export const GRADES: Record<string, Grade> = {
    "Kindergarten": "K",
    "Grade 1": "1",
    "Grade 2": "2",
    "Grade 3": "3",
    "Grade 4": "4",
    "Grade 5": "5",
    "Grade 6": "6",
    "Grade 7": "7",
    "Grade 8": "8",
    "Grade 9": "9",
    "Grade 10 Essentials": "10E",
    "Grade 10 Introduction to Applied and Pre-Calculus": "10I",
    "Grade 11 Applied": "11A",
    "Grade 11 Essentials": "11E",
    "Grade 11 Pre-Calculus": "11P",
    "Grade 12 Applied": "12A",
    "Grade 12 Essentials": "12E",
    "Grade 12 Pre-Calculus": "12P",
};

export const DEFAULT_GRADE: Grade = GRADES["Kindergarten"] as Grade;
