import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import emailSubscriptionService from '@/services/admin/email-subscription';
import { IAdminEmailSubscription } from '@/types/admin';
import { formatDataTable } from '@/utils/common';
import { createSorter } from '@/utils/table';
import { ButtonProps, Switch } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const EmailSubscriptionPage = () => {
    const navigation = useNavigate();

    const [allData, setAllData] = useState<IAdminEmailSubscription[]>([]);
    const [data, setData] = useState<IAdminEmailSubscription[]>(allData);

    const breadcrumbItems: BreadcrumbItemType[] = [
        { title: pathnames.admin.main.name },
        {
            title: pathnames.admin.emailSubscription.main.name,
            path: pathnames.admin.emailSubscription.main.path
        }
    ];

    const columns: ColumnType<any>[] = [
        {
            title: 'Name',
            key: 'subscriptionName',
            width: 150,
            sorter: createSorter('subscriptionName'),
            render: (record: any) =>
                renderWithFallback(
                    <Link
                        to={pathnames.admin.emailSubscription.detail.path + `/${record.emailSubscriptionId}`}
                        style={{ color: '#323232' }}
                        className="underline"
                    >
                        {record.subscriptionName}
                    </Link>
                )
        },
        {
            dataIndex: 'subscriptionEmail',
            title: 'Email',
            key: 'subscriptionEmail',
            width: 150,
            sorter: createSorter('subscriptionEmail'),
            render: (item: string) => renderWithFallback(item)
        },
        {
            dataIndex: 'isActive',
            title: 'Action',
            key: 'isActive',
            fixed: 'right',
            align: 'center',
            width: 100,
            render: (item: boolean) => <Switch disabled checked={item} />
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            const res = await emailSubscriptionService.getAll();
            const { data = [] } = res;

            setAllData(data);
            setData(data);
        };

        fetchData();
    }, []);

    const addButton: ButtonProps = {
        children: 'Add New',
        type: 'primary',
        onClick: () => navigation(pathnames.admin.emailSubscription.add.path)
    };

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <DetailHeader pageTitle="Email subscriptions" buttons={[addButton]} />

            <BaseTable columns={columns} dataSource={formatDataTable(data)} style={{ marginTop: 24 }} scroll={{ x: 1500 }} />
        </DetailContent>
    );
};

export default EmailSubscriptionPage;
