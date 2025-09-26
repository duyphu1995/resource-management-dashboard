import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTag from '@/components/common/tag';
import pathnames from '@/pathnames';
import emailSubscriptionService from '@/services/admin/email-subscription';
import { IAdminEmailSubscription } from '@/types/admin';
import { IDataBreadcrumb, IField } from '@/types/common';
import { formatMappingKey, statusMapping } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DetailEmailSubscriptionPage = () => {
    const navigation = useNavigate();
    const { id = '' } = useParams();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IAdminEmailSubscription | undefined>();

    const pageTitle = 'Email Subscription Details';

    const breadcrumbList: IDataBreadcrumb[] = [
        { title: pathnames.admin.main.name },
        { title: pathnames.admin.emailSubscription.main.name },
        { title: pathnames.admin.emailSubscription.detail.name }
    ];

    const goBack = () => {
        navigation(pathnames.admin.emailSubscription.main.path);
    };

    const buttons: ButtonProps[] = [
        {
            type: 'primary',
            children: 'Edit',
            onClick: () => {
                navigation(pathnames.admin.emailSubscription.edit.path + `/${id}`);
            }
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                turnOnLoading();
                const res = await emailSubscriptionService.getById(Number(id));
                const { data, succeeded } = res;
                if (succeeded) {
                    setData(data);
                    return;
                }
            } catch (error) {
                showNotification(false, 'Error fetching email subscription detail');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [id, turnOnLoading, turnOffLoading, showNotification]);

    const emailSubscriptionCols: IField[] = [
        {
            label: 'Name',
            value: renderWithFallback(data?.subscriptionName)
        },
        {
            label: 'Email',
            value: renderWithFallback(data?.subscriptionEmail)
        },
        {
            label: 'Status',
            value: (
                <BaseTag
                    {...statusMapping[formatMappingKey(data?.isActive ? 'Active' : 'Inactive')]}
                    statusName={data?.isActive ? 'Active' : 'Inactive'}
                />
            )
        }
    ];

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <BaseBreadcrumb dataItem={breadcrumbList} />
                <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={goBack} />
                <DetailInfo>
                    <DetailFields data={emailSubscriptionCols} />
                </DetailInfo>
            </Spin>
        </DetailContent>
    );
};

export default DetailEmailSubscriptionPage;
