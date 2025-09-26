import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import { ITableHaveActionAddProps } from '@/types/common';
import { ICommitments } from '@/types/hr-management/onsite-management';
import { formatDataTable, formatTimeMonthDayYear } from '@/utils/common';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

interface ICommitmentsShowMoreNote extends ICommitments {
    isShowMore: boolean;
}

const TableCommitment = (props: ITableHaveActionAddProps<ICommitments[]>) => {
    const { dataProps } = props;

    useEffect(() => {
        setDataSource(formatDataTable(dataProps));
    }, [dataProps]);

    const [dataSource, setDataSource] = useState<ICommitmentsShowMoreNote[]>([]);

    const handleShowMore = (record: ICommitmentsShowMoreNote) => {
        const index = dataSource.findIndex(item => item === record);
        setDataSource(prevState => {
            const newArray = [...prevState];
            newArray[index].isShowMore = !newArray[index].isShowMore;
            return newArray;
        });
    };

    //Commitment
    const columnsCommitment: ColumnsType<ICommitmentsShowMoreNote> = [
        {
            dataIndex: 'commitmentTypeName',
            key: 'commitmentTypeName',
            title: 'Commitment Type',
            fixed: 'left',
            width: 228,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fromDate',
            key: 'fromDate',
            title: 'From',
            width: 128,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'toDate',
            key: 'toDate',
            title: 'To',
            width: 128,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'signedDate',
            key: 'signedDate',
            title: 'Signed Date',
            width: 120,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'notes',
            key: 'notes',
            title: 'Note',
            width: 120,
            render: (note: string, record: ICommitmentsShowMoreNote) => {
                const truncatedString = note ? note?.slice(0, 20) + '...' : '-';

                return (
                    <p className="commitment__note">
                        {record.isShowMore ? note : truncatedString}
                        {note?.length > 20 && (
                            <span className="more-btn" onClick={() => handleShowMore(record)}>
                                {record?.isShowMore ? 'Less' : 'More'}
                            </span>
                        )}
                    </p>
                );
            }
        }
    ];

    return <TableHaveAdd title="Commitment" dataSource={dataSource} columns={columnsCommitment} tableScroll={{ x: 'max-content', y: 400 }} />;
};

export default TableCommitment;
