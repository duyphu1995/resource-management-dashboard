import { Result } from '@/types/hr-management/onsite-management';
// Note: This file is used to store common functions used in the Onsite Management section
// Function: removeNullUndefinedEmpty for removing null, undefined, and empty values in objects and arrays
export const removeNullUndefinedEmpty = (obj: any) => {
    const newObj: any = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'object' && !Array.isArray(value)) {
                // Recursively remove null, undefined, and empty values in nested objects
                const nestedObj = removeNullUndefinedEmpty(value);
                if (Object.keys(nestedObj).length > 0) {
                    newObj[key] = nestedObj;
                }
            } else if (Array.isArray(value)) {
                // Remove null, undefined, and empty values in arrays
                const filteredArray = value
                    .map((item: any) => removeNullUndefinedEmpty(item))
                    .filter((item: any) => {
                        if (item.notes !== undefined || item.costFee !== undefined) {
                            // Keep items where notes is not undefined
                            return true;
                        }
                        return Object.keys(item).length > 0 && !(item.costFee === undefined);
                    });
                if (filteredArray.length > 0) {
                    newObj[key] = filteredArray;
                }
            } else {
                newObj[key] = value;
            }
        }
    });
    return newObj;
};
// Function: sumMonetaryUnit for summing up the total cost fee of each monetary unit
export const sumMonetaryUnit = (data: any) => {
    const result: Result = {};

    for (const key in data) {
        const item = data[key];

        if (item?.monetaryUnit && item?.costFee) {
            const { costFee, monetaryUnit } = item;

            if (!result[monetaryUnit]) {
                result[monetaryUnit] = {
                    totalCostFee: parseFloat(costFee),
                    totalMonetaryUnit: monetaryUnit
                };
            } else {
                result[monetaryUnit].totalCostFee += parseFloat(costFee);
            }
        }
    }

    return Object.values(result);
};
