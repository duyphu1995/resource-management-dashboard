import DetailContent from '@/components/common/detail-management/detail-content';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import resignationService from '@/services/hr-management/resignation-management';
import { IResignationUpdatedHistory } from '@/types/hr-management/resignation-management';
import useLoading from '@/utils/hook/useLoading';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export interface IUpdatedHistoryProps {
    isReload: object;
}

const UpdatedHistory = (props: IUpdatedHistoryProps) => {
    const { isReload } = props;
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const { resignationFormId = '' } = useParams();
    const [data, setData] = useState<IResignationUpdatedHistory[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                turnOnLoading();

                const response = await resignationService.getUpdatedHistory(resignationFormId);
                const { succeeded, data = [] } = response;

                if (succeeded) {
                    setData(data.map((item, index) => ({ ...item, key: index })));
                } else {
                    setData([]);
                }
            } catch (error) {
                setData([]);
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [isReload, resignationFormId, turnOnLoading, turnOffLoading]);

    const columnsUpdateHistory: ColumnsType<IResignationUpdatedHistory> = [
        {
            dataIndex: 'time',
            key: 'time',
            title: 'Time',
            width: 168,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fieldName',
            key: 'fieldName',
            title: 'What Changes?',
            width: 248,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'from',
            key: 'from',
            title: 'From',
            width: 248,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'to',
            key: 'to',
            title: 'To',
            width: 318,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'byPeople',
            key: 'byPeople',
            title: 'Updated by people',
            width: 128,
            render: item => renderWithFallback(item)
        }
    ];

    return (
        <DetailContent>
            <BaseTable dataSource={data} columns={columnsUpdateHistory} loading={isLoading} />
        </DetailContent>
    );
};

export default UpdatedHistory;
