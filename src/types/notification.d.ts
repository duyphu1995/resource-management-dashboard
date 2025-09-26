export interface INotification {
    type: 'success' | 'error';
    message: string;
    description?: string;
    duration?: number;
}
