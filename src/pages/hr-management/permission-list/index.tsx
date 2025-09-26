import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import roleAndPermissionService from '@/services/admin/role-and-permission';
import { IManagement } from '@/types/hr-management/management-list';
import { ORG_UNITS } from '@/utils/constants';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import './index.scss'

const PermissionListPage = () => {
    const [loadingTable, setLoadingTable] = useState(true);
    const [dataTable, setDataTable] = useState<IManagement[]>([]);

    const tableColumns: ColumnsType<any> = [
        {
            key: 'key',
            title: '#',
            width: 50,
            fixed: 'left',
            render: (_, __, index) => index + 1
        },

        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
            fixed: 'left',
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'workEmail',
            title: 'Email',
            key: 'workEmail',
            width: 150,
            render: item => renderWithFallback(item)
        },
        {
            title: 'Position',
            dataIndex: 'positionName',
            key: 'positionName',
            width: 180,
            render: (positionName: string) => renderWithFallback(positionName)
        },
        {
            title: ORG_UNITS.Project,
            dataIndex: 'projectName',
            key: 'projectName',
            width: 137,
            render: (projectName: string) => renderWithFallback(projectName)
        },

        {
            title: ORG_UNITS.DC,
            dataIndex: 'dcName',
            key: 'dcName',
            width: 137,
            render: (dcName: string) => renderWithFallback(dcName)
        },
        {
            title: 'Work Phone',
            dataIndex: 'workPhone',
            key: 'workPhone',
            width: 137,
            render: (workPhone: string) => renderWithFallback(workPhone)
        },
        {
            title: 'Access To',
            dataIndex: 'accessTo',
            key: 'accessTo',
            width: 200,
            children: [
                {
                    title: 'Page Name',
                    dataIndex: 'accessTo',
                    key: 'pageName',
                    render: (_, record) => (
                        <div className='td-margin' >
                            {record?.accessTo?.map((access: any, index: number) => (
                                <div className='td-childrend' key={index}>{access.pageName}</div>
                            ))}
                        </div>
                    ),
                },
                {
                    title: 'Permission',
                    dataIndex: 'accessTo',
                    key: 'permissions',
                    render: (_, record) => (
                        <div className='td-margin' >
                            {record?.accessTo?.map((access: any, index: number) => (
                                <div className='td-childrend' key={index}>{access.permissions}</div>
                            ))}
                        </div>
                    ),
                },
            ],
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingTable(true);
                const res = await roleAndPermissionService.getAllPermissionList();
                const newDataTable = (res.data as any) || [];
                setDataTable(newDataTable);
            } catch (error) {
                setDataTable([]);
            } finally {
                setLoadingTable(false);
            }
        };

        fetchData();
    }, []);

    return (
        <DetailContent>
            <DetailHeader pageTitle="Permission List" buttons={[]} />
            <BaseTable
                columns={tableColumns}
                dataSource={dataTable}
                pagination={false}
                bordered
                loading={loadingTable}
                scroll={{ x: 'max-content' }}
            />

        </DetailContent>
    );
};

export default PermissionListPage;
