import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import employeeApi from '@/services/hr-management/employee-management';
import { IUpdatedHistory } from '@/types/hr-management/employee-management';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

const UpdatedHistory: React.FC<{ isReload: object }> = ({ isReload }) => {
    const { id = '' } = useParams();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IUpdatedHistory[]>([]);

    useEffect(() => {
        turnOnLoading();
        const getEmployee = async () => {
            try {
                const response = await employeeApi.getUpdatedHistory(id);

                const { succeeded, data = [] } = response;
                if (succeeded) {
                    setData(data.map((item, index) => ({ ...item, key: index })));
                }
            } catch (error) {
                showNotification(false, 'Get updated history failed');
            }
        };
        turnOffLoading();
        getEmployee();
    }, [isReload, id, showNotification, turnOnLoading, turnOffLoading]);

    const columnsUpdateHistory: ColumnsType<IUpdatedHistory> = [
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

export default UpdatedHistory;
