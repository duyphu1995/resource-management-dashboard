export interface IReduxAction<T> {
    payload: T;
    type: string;
}
