import { IBaselineHeadcountList } from '@/types/reports/headcount-baseline-report';
import { formatNumberWithDecimalPlaces } from '@/utils/common';
import { ReactNode } from 'react';

interface ISharedServiceUnit {
    name: string;
    number: string;
}

export const findSharedServiceUnitData = (data: any[]): any[] => {
    for (const item of data) {
        if (item.sharedServiceUnit) {
            const parsedSharedServiceUnit = JSON.parse(item.sharedServiceUnit);
            if (parsedSharedServiceUnit.length > 0) {
                return parsedSharedServiceUnit;
            }
        }
    }
    return [];
};

export const mapSharedServiceColumns = (sharedServiceUnitData: ISharedServiceUnit[], hiddenWithDCName?: string[]) => {
    return sharedServiceUnitData.map((service: ISharedServiceUnit) => ({
        key: service.name.toLowerCase().replace(/ /g, ''),
        title: service.name,
        width: service.name.length < 10 ? 120 : service.name.length * 15,
        render: (record: IBaselineHeadcountList) => {
            const { dcName } = record || {};
            if (hiddenWithDCName?.some(name => name === dcName)) {
                return null;
            }

            const sharedServiceUnit = JSON.parse(record.sharedServiceUnit);
            return record.isSharedServiceUnit
                ? null
                : renderWithZeroCheck(sharedServiceUnit?.find((unit: ISharedServiceUnit) => unit.name === service.name)?.number);
        }
    }));
};

export const calculateTotalSharedServices = (sharedServiceUnit: string | null) => {
    // Return null if there is no input data
    if (!sharedServiceUnit) return null;

    try {
        // Parse JSON data and check if there are no units
        const sharedServiceUnits: ISharedServiceUnit[] = JSON.parse(sharedServiceUnit);
        if (!sharedServiceUnits?.length) return null;

        // Calculate the total value of the units
        const total = sharedServiceUnits.reduce((sum, unit) => {
            const number = parseFloat(unit.number);
            return sum + (isNaN(number) ? 0 : number);
        }, 0);

        // Return null if the total is 0, otherwise return the total
        return total || null;
    } catch (error) {
        // Handle cases where the JSON is invalid
        return null;
    }
};

export const renderWithZeroCheck = (data: ReactNode) => {
    if (data === '' || data === null || data === undefined || data === 0 || data === '0') {
        return null;
    }

    if (typeof data === 'number') {
        data = formatNumberWithDecimalPlaces(data);
    }

    return data;
};
