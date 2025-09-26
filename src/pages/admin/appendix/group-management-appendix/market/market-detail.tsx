import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import marketService from '@/services/admin/market';
import { IAdminMarket } from '@/types/admin';
import { IField } from '@/types/common';
import useLoading from '@/utils/hook/useLoading';
import usePermissions from '@/utils/hook/usePermissions';
import { ButtonProps, Spin } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.groupManagementAppendix.main.name },
    {
        path: pathnames.admin.appendix.groupManagementAppendix.market.main.path,
        title: pathnames.admin.appendix.groupManagementAppendix.market.main.name
    },
    { title: pathnames.admin.appendix.groupManagementAppendix.market.detail.name }
];

const NationalityDetailPage = () => {
    const { marketplaceId = '' } = useParams();
    const navigation = useNavigate();
    const { havePermission } = usePermissions('DetailsMarketAppendix', 'Market');
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IAdminMarket | null>(null);

    const pageTitle = pathnames.admin.appendix.groupManagementAppendix.market.detail.name;

    const onGoBack = () => navigation(pathnames.admin.appendix.groupManagementAppendix.market.main.path);
    const navigateToEditPage = () => navigation(pathnames.admin.appendix.groupManagementAppendix.market.edit.path + '/' + marketplaceId);

    const buttons: ButtonProps[] = [havePermission('Edit') && { type: 'primary', children: 'Edit', onClick: navigateToEditPage }].filter(Boolean);

    const fields: IField[] = [
        {
            label: 'Market Name',
            value: renderWithFallback(data?.marketplaceName)
        },
        {
            label: 'Market Description',
            value: renderWithFallback(data?.marketplaceDescription)
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await marketService.getDetail(marketplaceId);
            const { data, succeeded } = res;

            if (succeeded && data) setData(data);
            turnOffLoading();
        };

        fetchData();
    }, [marketplaceId, navigation, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <Spin spinning={isLoading} style={{ height: '100%' }}>
                <BaseBreadcrumb dataItem={breadcrumbItems} />
                <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={onGoBack} />

                <DetailInfo>
                    <DetailFields data={fields} />
                </DetailInfo>
            </Spin>
        </DetailContent>
    );
};

export default NationalityDetailPage;
