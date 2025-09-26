import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import languageCertificationService from '@/services/admin/language-certification';
import { IAdminLanguageCertification } from '@/types/admin';
import { IField } from '@/types/common';
import useLoading from '@/utils/hook/useLoading';
import { ButtonProps, Spin } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.main.name },
    {
        title: pathnames.admin.appendix.employeeAppendix.languageCertification.main.name,
        path: pathnames.admin.appendix.employeeAppendix.languageCertification.main.path
    },
    { title: pathnames.admin.appendix.employeeAppendix.languageCertification.detailLanguage.name }
];

const LanguageCertificationDetailPage = () => {
    const { id = '' } = useParams();
    const navigation = useNavigate();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IAdminLanguageCertification | null>(null);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.languageCertification.detailLanguage.name;

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.languageCertification.main.path);
    const navigateToEditPage = () => navigation(pathnames.admin.appendix.employeeAppendix.languageCertification.editLanguage.path + '/' + id);

    const buttons: ButtonProps[] = [{ type: 'primary', children: 'Edit', onClick: navigateToEditPage }];

    const fields: IField[] = [
        {
            label: 'Language Name',
            value: renderWithFallback(data?.languageName)
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();

            const res = await languageCertificationService.getDetailLanguage(id);
            const { data, succeeded } = res;

            if (succeeded && data) setData(data);

            turnOffLoading();
        };

        fetchData();
    }, [id, navigation, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <Spin spinning={isLoading} style={{ height: '100%' }}>
                <BaseBreadcrumb dataItem={breadcrumbItems} />
                <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={onGoBack} />

                {/* DETAIL INFO */}
                <DetailInfo>
                    <DetailFields data={fields} />
                </DetailInfo>
            </Spin>
        </DetailContent>
    );
};

export default LanguageCertificationDetailPage;
