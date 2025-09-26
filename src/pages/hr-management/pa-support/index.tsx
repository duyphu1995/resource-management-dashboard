import { useCallback, useEffect, useState } from 'react';
import { Button } from 'antd';
import BaseBreadcrumb from '@/components/common/breadcrumb';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import { IDataBreadcrumb } from '@/types/common';
import { IPASupport } from '@/types/hr-management/pa-support';
import { formatDataTableFromOne } from '@/utils/common';
import paSupportService from '@/services/hr-management/pa-support';
import useNotify from '@/utils/hook/useNotify';
import './index.scss';
import useLoading from '@/utils/hook/useLoading';
import { ColumnsType } from 'antd/es/table';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';

const PASupportPage = () => {
    const pageTitle = pathnames.hrManagement.paSupport.main.name;
    const breadcrumb: IDataBreadcrumb[] = [{ title: pathnames.hrManagement.main.name }, { title: pageTitle }];

    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataTable, setDataTable] = useState<IPASupport[]>([]);

    const columns: ColumnsType<IPASupport> = [
        {
            dataIndex: 'key',
            key: 'key',
            title: '.No',
            width: 70,
            align: 'center',
            render: (item: number) => item
        },
        {
            dataIndex: 'badgeId',
            key: 'badgeId',
            title: 'BadgeID',
            width: 150,
            render: (item: string) => renderWithFallback(item)
        },
        {
            dataIndex: 'fullName',
            key: 'fullName',
            title: 'Full Name',
            width: 250,
            render: (item, record) => <span style={{ color: record.color, fontWeight: 500 }}>{renderWithFallback(item)}</span>
        },
        {
            dataIndex: 'hrmGrade',
            key: 'hrmGrade',
            title: 'HRM Level',
            width: 250,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'paGrade',
            key: 'paGrade',
            title: 'PA Level',
            width: 250,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'hrmPositionName',
            key: 'hrmPositionName',
            title: 'HRM Position',
            width: 250,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'paPositionName',
            key: 'paPositionName',
            title: 'PA Position',
            width: 250,
            render: item => renderWithFallback(item)
        }
    ];

    const fetchData = useCallback(
        async (clicked?: boolean) => {
            turnOnLoading();
            try {
                const response = await paSupportService.getList();
                const { succeeded, data, message } = response;

                if (succeeded) {
                    setDataTable(formatDataTableFromOne(data || []));
                }
                if (clicked) {
                    showNotification(succeeded, message);
                }
            } catch {
                showNotification(false, 'Failed to fetch data PA Support');
            } finally {
                turnOffLoading();
            }
        },
        [showNotification, turnOnLoading, turnOffLoading]
    );

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateData = async () => {
        turnOnLoading();

        try {
            const response = await paSupportService.updateData();
            const { succeeded, message } = response;

            if (succeeded) {
                fetchData();
            }

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Failed to update data');
        } finally {
            turnOffLoading();
        }
    };

    return (
        <div className="pa-support">
            <BaseBreadcrumb dataItem={breadcrumb} />
            <div className="pa-support__header">
                <h3 className="header__title">{pageTitle}</h3>
                <div className="header__group-btn">
                    <Button type="primary" onClick={() => fetchData(true)}>
                        Validate Data
                    </Button>
                    <Button type="primary" className="group-btn__update" onClick={handleUpdateData}>
                        Update
                    </Button>
                </div>
            </div>
            <div className="pa-support__table">
                <div className="table__description">
                    <h4>Mismatch Data</h4>
                    <ul>
                        <li>Up level</li>
                        <li>Down Level</li>
                        <li>Change Position</li>
                    </ul>
                </div>
                <BaseTable columns={columns} dataSource={dataTable} loading={isLoading} />
            </div>
        </div>
    );
};

export default PASupportPage;
