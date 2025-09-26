import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import nationalityService from '@/services/admin/nationality';
import { IAdminNationality } from '@/types/admin';
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
        path: pathnames.admin.appendix.employeeAppendix.nationality.main.path,
        title: pathnames.admin.appendix.employeeAppendix.nationality.main.name
    },
    { title: pathnames.admin.appendix.employeeAppendix.nationality.detail.name }
];

const NationalityDetailPage = () => {
    const navigation = useNavigate();
    const { nationalityId = '' } = useParams();
    const { showNotification } = useNotify();
    const { havePermission } = usePermissions('DetailsNationalityAppendix', 'Nationality');
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IAdminNationality | null>(null);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.nationality.detail.name;

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.nationality.main.path);
    const navigateToEditPage = () => navigation(pathnames.admin.appendix.employeeAppendix.nationality.edit.path + '/' + nationalityId);

    const buttons: ButtonProps[] = [havePermission('Edit') && { type: 'primary', children: 'Edit', onClick: navigateToEditPage }].filter(Boolean);

    const fields: IField[] = [
        {
            label: 'National Name',
            value: renderWithFallback(data?.nationalityName)
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const res = await nationalityService.getDetail(nationalityId);
                const { data = null, succeeded = false } = res;

                if (succeeded && data) setData(data);
            } catch (error) {
                showNotification(false, 'Error fetching nationality detail');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [nationalityId, turnOnLoading, turnOffLoading, showNotification]);

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
