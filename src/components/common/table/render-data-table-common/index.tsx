import { formatNumberWithDecimalPlaces } from '@/utils/common';
import { Tooltip } from 'antd';
import { ReactNode } from 'react';

export const renderBooleanStatus = (value: boolean, trueText: string) => (
    <div className={'not-' + trueText.toLowerCase()}>
        {value ? (
            <img src="/media/icons/check-green.svg" alt={trueText.toLowerCase()} />
        ) : (
            <img src="/media/icons/uncheck-red.svg" alt={'not-' + trueText.toLowerCase()} />
        )}
    </div>
);

export const renderWithFallback = (data: ReactNode, enableTruncate: boolean = false, truncateLength: number = 19) => {
    if (data === '' || data === null || data === undefined) {
        return '-';
    }

    if (typeof data === 'number') {
        data = formatNumberWithDecimalPlaces(data);
    }

    if (enableTruncate && truncateLength && typeof data === 'string' && data.length > truncateLength) {
        const truncatedName = data.slice(0, truncateLength) + '...';
        return <Tooltip title={data}>{truncatedName}</Tooltip>;
    }

    return data;
};
