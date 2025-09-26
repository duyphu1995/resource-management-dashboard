import { useEffect, useState } from 'react';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import { createSorter } from '@/utils/table';
import { TableColumnType } from 'antd';
import { ORG_UNITS } from '@/utils/constants';
import { ISpanControlList } from '@/types/reports/span-of-control-report';
import BaseTable from '@/components/common/table/table';
import spanOfControlReport from '@/services/reports/span-of-control-index-report';
import { ISpanControlFilter } from '@/types/reports/report';
import useLoading from '@/utils/hook/useLoading';
import './index.scss';

type Props = {
    filterParams: ISpanControlFilter;
    unitName?: string;
};

const SpansOfControlTable = ({ filterParams, unitName }: Props) => {
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<ISpanControlList[]>([]);
    const columns: TableColumnType<ISpanControlList>[] = [
        {
            key: 'no',
            title: 'No.',
            width: 109,
            fixed: 'left',
            align: 'center',
            render: (_, __, index) => index + 1
        },
        {
            dataIndex: 'badgeId',
            key: 'badgeId',
            title: 'Badge ID',
            width: 109,
            fixed: 'left',
            align: 'center',
            sorter: createSorter('badgeId'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fullName',
            key: 'fullName',
            title: 'Full Name',
            width: 300,
            fixed: 'left',
            sorter: createSorter('fullName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'email',
            key: 'email',
            title: 'Email',
            width: 200,
            sorter: createSorter('email'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'mainProject',
            key: 'mainProject',
            title: 'Main Project',
            width: 300,
            sorter: createSorter('mainProject'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dc',
            key: 'dc',
            title: ORG_UNITS.DC,
            width: 128,
            sorter: createSorter('dc'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dg',
            key: 'dg',
            title: ORG_UNITS.DG,
            width: 128,
            sorter: createSorter('dg'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'position',
            key: 'position',
            title: 'Position',
            width: 150,
            sorter: createSorter('position'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'grade',
            key: 'grade',
            title: 'Grade',
            width: 86,
            align: 'center',
            sorter: createSorter('grade', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'type',
            key: 'type',
            title: 'Type',
            width: 128,
            align: 'center',
            sorter: createSorter('type'),
            render: item => renderWithFallback(item)
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await spanOfControlReport.getSpanOfControlList(filterParams);
            setData(res.data || []);
            turnOffLoading();
        };

        fetchData();
    }, [filterParams, turnOnLoading, turnOffLoading]);

    return (
        <div className="spans-of-control-table">
            <p>*Note: This list contains employees whose main project is in {unitName || 'N/A'}</p>
            {!isLoading && <BaseTable dataSource={data} columns={columns} loading={isLoading} rowKey={'no'} bordered />}
        </div>
    );
};

export default SpansOfControlTable;
