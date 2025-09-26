import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import documentService from '@/services/hr-management/document-management';
import { ITabUpdateHistory, ITableHaveActionAddProps } from '@/types/common';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TabDocumentUpdateHistory = (props: ITableHaveActionAddProps<any>) => {
    const { isReload } = props;
    const [data, setData] = useState<ITabUpdateHistory[]>([]);
    const { id } = useParams();

    // Column table
    const columnUpdateHistory: ColumnsType<ITabUpdateHistory> = [
        {
            dataIndex: 'time',
            key: 'time',
            title: 'Time',
            width: 180,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fieldName',
            key: 'fieldName',
            title: 'What Changes?',
            width: 310,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'from',
            key: 'from',
            title: 'From',
            width: 310,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'to',
            key: 'to',
            title: 'To',
            width: 310,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'byPeople',
            key: 'byPeople',
            title: 'Updated by',
            width: 180,
            render: item => renderWithFallback(item)
        }
    ];

    // Get data history updated document
    useEffect(() => {
        const fetchData = async () => {
            const res = await documentService.getUpdateHistory(Number(id));
            const data = res.data || [];

            const modifiedData = data.map((item, index) => ({
                ...item,
                key: index.toString()
            }));

            setData(modifiedData);
        };

        fetchData();
    }, [id, isReload]);

    return <BaseTable rootClassName="table-update-history" dataSource={data} columns={columnUpdateHistory} scroll={{ x: 1500 }} bordered={true} />;
};

export default TabDocumentUpdateHistory;
