import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import terminationReasonService from '@/services/admin/termination-reason';
import { IAdminTerminationReason } from '@/types/admin';
import { IField } from '@/types/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
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
        href: pathnames.admin.appendix.employeeAppendix.terminationReason.main.path,
        title: pathnames.admin.appendix.employeeAppendix.terminationReason.main.name
    },
    { title: pathnames.admin.appendix.employeeAppendix.terminationReason.detail.name }
];

const TerminationReasonDetailPage = () => {
    const navigation = useNavigate();
    const { havePermission } = usePermissions('DetailsTerminationReasonAppendix', 'TerminationReason');
    const { reasonId = '' } = useParams();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IAdminTerminationReason | null>(null);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.terminationReason.detail.name;

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.terminationReason.main.path);
    const navigateToEditPage = () => navigation(pathnames.admin.appendix.employeeAppendix.terminationReason.edit.path + '/' + reasonId);

    const buttons: ButtonProps[] = [havePermission('Edit') && { type: 'primary', children: 'Edit', onClick: navigateToEditPage }].filter(Boolean);

    const fields: IField[] = [
        {
            label: 'Reason Name',
            value: renderWithFallback(data?.reasonName)
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const res = await terminationReasonService.getDetail(reasonId);
                const { data = null, succeeded = false } = res;

                if (succeeded && data) setData(data);
            } catch (error) {
                showNotification(false, 'Error fetching termination reason detail');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [reasonId, turnOnLoading, turnOffLoading, showNotification]);

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

export default TerminationReasonDetailPage;
