import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTag from '@/components/common/tag';
import pathnames from '@/pathnames';
import salaryService from '@/services/admin/salary';
import contractService from '@/services/hr-management/contract-management';
import { IAdminSalary } from '@/types/admin';
import { IDataBreadcrumb, IField } from '@/types/common';
import { IContractIndexes } from '@/types/hr-management/contract-management';
import { formatCurrencyVND, formatMappingKey, formatTimeMonthDayYear, statusMapping } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import usePermissions from '@/utils/hook/usePermissions';
import { ButtonProps, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const breadcrumbList: IDataBreadcrumb[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.companyAppendix.main.name },
    { title: pathnames.admin.appendix.companyAppendix.contractSalary.main.name },
    {
        title: pathnames.admin.appendix.companyAppendix.contractSalary.detail.name,
        path: pathnames.admin.appendix.companyAppendix.contractSalary.add.path
    }
];

const DetailContractSalaryPage = () => {
    const navigation = useNavigate();
    const { id = '' } = useParams();
    const { havePermission } = usePermissions('DetailsContractSalaryAppendix', 'ContractSalary');
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IAdminSalary>();
    const [contractIndex, setContractIndex] = useState<IContractIndexes>();

    const pageTitle = 'Contract Salary Details';

    const goBack = () => {
        navigation(pathnames.admin.appendix.companyAppendix.contractSalary.main.path);
    };
    const navigateToEditPage = () => navigation(pathnames.admin.appendix.companyAppendix.contractSalary.edit.path + `/${id}`);

    const buttons: ButtonProps[] = [havePermission('Edit') && { type: 'primary', children: 'Edit', onClick: navigateToEditPage }].filter(Boolean);

    const getStatusTag = () => {
        const statusName = data?.isActive === true ? 'Active' : 'Inactive';
        return <BaseTag {...statusMapping[formatMappingKey(statusName)]} statusName={statusName} />;
    };

    const salaryCols: IField[] = [
        {
            label: 'Grade',
            value: renderWithFallback(data?.grade)
        },
        {
            label: 'Position',
            value: renderWithFallback(data?.positionName)
        },
        {
            label: 'Career',
            value: renderWithFallback(contractIndex?.careers.find(item => item.isNonTechnical === data?.isNonTechnical)?.career)
        },
        {
            label: 'Company',
            value: renderWithFallback(data?.companyName)
        },
        {
            label: 'Salary By Number',
            value: renderWithFallback(formatCurrencyVND(data?.salary))
        },
        {
            label: 'Salary By Text',
            value: renderWithFallback(data?.salaryInText)
        },
        {
            label: 'Created Date',
            value: renderWithFallback(formatTimeMonthDayYear(data?.createdOn))
        },
        {
            label: 'Edited Date',
            value: renderWithFallback(formatTimeMonthDayYear(data?.lastModifiedOn))
        },
        {
            label: 'Status',
            value: getStatusTag()
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            const res = await salaryService.getById(Number(id));
            setData(res.data);
        };

        const getContractAllIndex = async () => {
            const res = await contractService.getAllIndexes();
            setContractIndex(res.data);
        };

        const fetchDataAndContractIndex = async () => {
            turnOnLoading();
            await Promise.all([getContractAllIndex(), fetchData()]);
            turnOffLoading();
        };

        fetchDataAndContractIndex();
    }, [id, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <BaseBreadcrumb dataItem={breadcrumbList} />
                <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={goBack} />
                <DetailInfo>
                    <DetailFields data={salaryCols} />
                </DetailInfo>
            </Spin>
        </DetailContent>
    );
};

export default DetailContractSalaryPage;
