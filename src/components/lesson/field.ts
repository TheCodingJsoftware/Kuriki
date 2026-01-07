export interface LessonField<T = any> {
    element: HTMLElement;
    getValue(): T;
    setValue(value: T): void;
}
