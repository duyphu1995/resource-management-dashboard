import { Subject } from 'rxjs';

const subject1 = new Subject();
const subject2 = new Subject();

export const dragNodeService = {
    sendDragInfo: (ordinalId: string) => subject1.next({ draggedNodeId: ordinalId }),
    clearDragInfo: () => subject1.next(null),
    getDragInfo: () => subject1.asObservable()
};

export const selectNodeService = {
    sendSelectedNodeInfo: (ordinalId: string) => subject2.next({ draggedNodeId: ordinalId }),
    clearSelectedNodeInfo: () => subject2.next(null),
    getSelectedNodeInfo: () => subject2.asObservable()
};
