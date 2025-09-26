import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import resignationService from '@/services/hr-management/contractor-management';
import { IContractorUpdatedHistory } from '@/types/hr-management/contractor-management';
import useLoading from '@/utils/hook/useLoading';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export interface IUpdatedHistoryProps {
    isReload: object;
}

const ContractorUpdatedHistory = (props: IUpdatedHistoryProps) => {
    const { isReload } = props;
    const { contractorId = '' } = useParams();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IContractorUpdatedHistory[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                turnOnLoading();
                const response = await resignationService.getUpdatedHistory(contractorId);
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
    }, [isReload, contractorId, turnOnLoading, turnOffLoading]);

    const columnsUpdateHistory: ColumnsType<IContractorUpdatedHistory> = [
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
            title: 'By People',
            width: 128,
            render: item => renderWithFallback(item)
        }
    ];

    return (
        <div className="update-history">
            <BaseTable dataSource={data} columns={columnsUpdateHistory} loading={isLoading} />
            <div className="bg"></div>
        </div>
    );
};

export default ContractorUpdatedHistory;
