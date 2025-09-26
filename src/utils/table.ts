import { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import { TIME_FORMAT } from './constants';

const compareString = (a: string, b: string) => (a || '').localeCompare(b || '');

const compareDate = (a: string, b: string) => dayjs(a, TIME_FORMAT.VN_DATE).unix() - dayjs(b, TIME_FORMAT.VN_DATE).unix();

const compareNumber = (a: number, b: number) => {
    return a - b;
};

const compareBoolean = (a: boolean, b: boolean) => (a === b ? 0 : a ? 1 : -1);

const compareGrade = <T extends { minGrade: number; maxGrade: number }>(a: T, b: T): number => {
    if (!a || !b) return 0;

    const { minGrade: minGradeA, maxGrade: maxGradeA } = a;
    const { minGrade: minGradeB, maxGrade: maxGradeB } = b;

    return minGradeA !== minGradeB ? minGradeA - minGradeB : maxGradeA - maxGradeB;
};

export const createSorter = <T>(dataIndex: keyof T, type: 'string' | 'date' | 'number' | 'boolean' | 'grade' = 'string') => {
    return (a: T, b: T) => {
        if (type === 'grade') {
            return compareGrade(a as { minGrade: number; maxGrade: number }, b as { minGrade: number; maxGrade: number });
        }

        let valueA: any = a[dataIndex];
        let valueB: any = b[dataIndex];

        if (type === 'boolean') {
            if (valueA === undefined) valueA = false;
            if (valueB === undefined) valueB = false;
        }

        if (valueA === undefined) return 1;
        if (valueB === undefined) return -1;

        switch (type) {
            case 'date':
                return compareDate(valueA as string, valueB as string);
            case 'number':
                return compareNumber(valueA as number, valueB as number);
            case 'boolean':
                return compareBoolean(valueA as boolean, valueB as boolean);
            default:
                return compareString(valueA?.trim() as string, valueB?.trim() as string);
        }
    };
};

export const searchByKeyword = (data: any[], columns: ColumnType<any>[] = [], keyword: string, disableKeys: string[] = []) => {
    const newDataTable: any[] = [];
    const enabledColumns = columns.filter(column => disableKeys.findIndex(key => key === column.key || key === 'action') < 0);

    data.forEach(row => {
        let flag = false;

        enabledColumns.forEach(column => {
            const colKey = column.key?.toString() || '';
            const fieldValue = (row[colKey] ?? '').toString().toLowerCase();

            if (fieldValue.includes(keyword.toLowerCase())) {
                flag = true;
                return;
            }
        });

        if (flag) newDataTable.push(row);
    });

    return newDataTable;
};
