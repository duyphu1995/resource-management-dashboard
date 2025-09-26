export interface IQuickFilterField {
    quickFilterFieldId: number;
    quickFilterFieldName: string;
    quickFilterFieldValue: string;
}

export interface IQuickFilterData {
    quickFilterId: number;
    quickFilterName: string;
    quickFilterFields: IQuickFilterField[];
}
