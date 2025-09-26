import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import healthTrackingService from '@/services/admin/health-tracking';
import { IAdminHealthTracking } from '@/types/admin';
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
    { title: pathnames.admin.appendix.employeeAppendix.main.name },
    {
        path: pathnames.admin.appendix.employeeAppendix.healthTracking.main.path,
        title: pathnames.admin.appendix.employeeAppendix.healthTracking.main.name
    },
    { title: pathnames.admin.appendix.employeeAppendix.healthTracking.detail.name }
];

const HealthTrackingDetailPage = () => {
    const { certificateId = '' } = useParams();
    const navigation = useNavigate();
    const { havePermission } = usePermissions('DetailsHealthTrackingAppendix', 'HealthTracking');
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IAdminHealthTracking | null>(null);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.healthTracking.detail.name;

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.healthTracking.main.path);
    const navigateToEditPage = () => navigation(pathnames.admin.appendix.employeeAppendix.healthTracking.edit.path + '/' + certificateId);

    const buttons: ButtonProps[] = [havePermission('Edit') && { type: 'primary', children: 'Edit', onClick: navigateToEditPage }].filter(Boolean);

    const fields: IField[] = [
        {
            label: 'Certificate Type Name',
            value: renderWithFallback(data?.certificateName)
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await healthTrackingService.getDetail(certificateId);
            const { data, succeeded } = res;

            if (succeeded && data) setData(data);
            turnOffLoading();
        };

        fetchData();
    }, [certificateId, navigation, turnOnLoading, turnOffLoading]);

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

export default HealthTrackingDetailPage;
