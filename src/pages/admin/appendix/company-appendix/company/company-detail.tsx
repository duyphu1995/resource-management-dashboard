import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTag from '@/components/common/tag';
import pathnames from '@/pathnames';
import companyService from '@/services/admin/company';
import { ICompany } from '@/types/admin';
import { IField } from '@/types/common';
import { formatMappingKey, statusMapping } from '@/utils/common';
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
    { title: pathnames.admin.appendix.companyAppendix.company.main.name, path: pathnames.admin.appendix.companyAppendix.company.main.path },
    { title: pathnames.admin.appendix.companyAppendix.company.detail.name }
];

const CompanyDetailPage = () => {
    const navigation = useNavigate();
    const { companyId = '' } = useParams();
    const { havePermission } = usePermissions('DetailsCompanyAppendix', 'Company');
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const pageTitle = pathnames.admin.appendix.companyAppendix.company.detail.name;

    const [data, setData] = useState<ICompany | null>(null);

    // Handle go back
    const onGoBack = () => navigation(pathnames.admin.appendix.companyAppendix.company.main.path);
    const navigateToEditPage = () => navigation(pathnames.admin.appendix.companyAppendix.company.edit.path + '/' + companyId);

    // Header buttons
    const buttons: ButtonProps[] = [havePermission('Edit') && { type: 'primary', children: 'Edit', onClick: navigateToEditPage }].filter(Boolean);

    const getStatus = () => {
        const statusName = data?.isActive ? 'Active' : 'Inactive';
        const statusConfig = statusMapping[formatMappingKey(statusName)];

        return <BaseTag {...statusConfig} statusName={statusName} />;
    };

    const fields: IField[] = [
        {
            label: 'Badge ID Format',
            value: renderWithFallback(data?.prefixKeyContract, true, 50)
        },
        {
            label: 'Company Name',
            value: renderWithFallback(data?.companyName, true, 50)
        },
        {
            label: 'English Name',
            value: renderWithFallback(data?.companyNameEN, true, 50)
        },
        {
            label: 'Short Name',
            value: renderWithFallback(data?.companyAcronym, true, 50)
        },
        {
            label: 'Address',
            value: renderWithFallback(data?.companyAddress, true, 50)
        },
        {
            label: 'Mr/Ms',
            value: renderWithFallback(data?.companyOwner, true, 50)
        },
        {
            label: 'Position',
            value: renderWithFallback(data?.ownerPosition, true, 50)
        },
        {
            label: 'Phone',
            value: renderWithFallback(data?.companyPhone, true, 50)
        },
        {
            label: 'Fax',
            value: renderWithFallback(data?.companyFax, true, 50)
        },
        {
            label: 'Tax ID',
            value: renderWithFallback(data?.companyTaxId, true, 50)
        },
        {
            label: 'Status',
            value: getStatus()
        }
    ];

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await companyService.getDetail(companyId);
            const { succeeded, data } = res;

            if (succeeded && data) setData(data);
            turnOffLoading();
        };

        fetchData();
    }, [companyId, navigation, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
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

export default CompanyDetailPage;
