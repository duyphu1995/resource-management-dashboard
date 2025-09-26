import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import contractService from '@/services/hr-management/contract-management';
import { IField } from '@/types/common';
import { IContract } from '@/types/hr-management/contract-management';
import { formatCurrencyVND, formatTimeMonthDayYear } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { ButtonProps, Flex, Spin } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export interface IContractInfoSection {
    title: string;
    columns: IField[];
}

const ContractDetailPage = () => {
    const { contractId = '' } = useParams();
    const navigation = useNavigate();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    // Permission
    const { havePermission } = usePermissions('ContractDetails', 'ContractManagement');

    // Data
    const [data, setData] = useState<IContract | null>();

    const pageTitle = pathnames.hrManagement.contractManagement.detail.name;

    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.hrManagement.main.name },
        { title: pathnames.hrManagement.contractManagement.main.name, path: pathnames.hrManagement.contractManagement.main.path },
        { title: pageTitle }
    ];

    const employeeCols: IField[] = [
        {
            label: 'Full Name',
            value: renderWithFallback(data?.fullName)
        },
        {
            label: 'Badge ID',
            value: renderWithFallback(data?.badgeId)
        },
        {
            label: 'DOB',
            value: renderWithFallback(formatTimeMonthDayYear(data?.birthday))
        },
        {
            label: 'Place Of Birth',
            value: renderWithFallback(data?.birthPlace)
        },
        {
            label: 'Career',
            value: renderWithFallback(data?.career)
        },
        {
            label: 'Address',
            value: renderWithFallback(data?.contactAddress)
        },
        {
            label: 'ID Card',
            value: renderWithFallback(data?.idCardNo)
        },
        {
            label: 'Issued Date',
            value: renderWithFallback(formatTimeMonthDayYear(data?.idCardIssueDate))
        },
        {
            label: 'Issued Place',
            value: renderWithFallback(data?.idCardIssuePlace)
        }
    ];

    const companyCols: IField[] = [
        {
            label: 'Company Name',
            value: renderWithFallback(data?.companyName)
        },
        {
            label: 'Ms/Mr',
            value: renderWithFallback(data?.companyOwner)
        },
        {
            label: 'Position',
            value: renderWithFallback(data?.ownerPosition)
        },
        {
            label: 'Represent For',
            value: renderWithFallback(data?.representFor)
        },
        {
            label: 'Address',
            value: renderWithFallback(data?.companyAddress)
        },
        {
            label: 'Phone',
            value: renderWithFallback(data?.companyPhone)
        }
    ];

    const contractCols: IField[] = [
        {
            label: 'Contract Type',
            value: renderWithFallback(data?.contractTypeName)
        },
        {
            label: 'Validity Period',
            value: renderWithFallback(data?.validityName),
            hidden: data?.contractTypeName === 'Không xác định thời hạn'
        },
        {
            label: 'Start Date',
            value: renderWithFallback(formatTimeMonthDayYear(data?.startDate))
        },
        {
            label: 'End Date',
            value: renderWithFallback(formatTimeMonthDayYear(data?.endDate)),
            hidden: data?.contractTypeName === 'Không xác định thời hạn'
        },
        {
            label: 'Workplace',
            value: renderWithFallback(data?.companyName)
        },
        {
            label: 'Professional Titles',
            value: renderWithFallback(data?.professionalTitles)
        },
        {
            label: 'Position',
            value: renderWithFallback(data?.positionName)
        },
        {
            label: 'Salary Number',
            value: renderWithFallback(formatCurrencyVND(data?.salary) ?? 0)
        },
        {
            label: 'Salary Text',
            value: renderWithFallback(data?.salaryInText)
        },
        {
            label: 'Renew Approval',
            value: renderWithFallback(data?.renewApprovalStatusName)
        },
        {
            label: 'Note',
            value: renderWithFallback(data?.comment)
        }
    ];

    const goBack = () => navigation(pathnames.hrManagement.contractManagement.main.path);

    const buttons: ButtonProps[] = [
        havePermission('ViewEmployeeDetails') && {
            children: 'View Employee Details',
            onClick: () => navigation(pathnames.hrManagement.employeeManagement.detail.path + '/' + data?.employeeId)
        },
        havePermission('Edit') && {
            type: 'primary',
            children: 'Edit',
            onClick: () => navigation(pathnames.hrManagement.contractManagement.edit.path + '/' + contractId)
        }
    ].filter(Boolean);

    const contractSections: IContractInfoSection[] = [
        { title: 'Employee', columns: employeeCols },
        { title: 'Company', columns: companyCols },
        { title: 'Contract', columns: contractCols }
    ];

    // Fetch detail data
    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const res = await contractService.getContractDetail(contractId);
                const { succeeded = false, data = null } = res;

                if (succeeded && data) setData(data);
            } catch (error) {
                showNotification(false, 'Error fetching contract detail');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [contractId, turnOnLoading, turnOffLoading, showNotification]);

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <BaseBreadcrumb dataItem={breadcrumb} />
                <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={goBack} />

                {/* SECTIONS */}
                <Flex gap={'24px 24px'} vertical>
                    {contractSections.map((section, index) => (
                        <DetailInfo key={index} title={section.title + ' Information'}>
                            <DetailFields data={section.columns} />
                        </DetailInfo>
                    ))}
                </Flex>
            </Spin>
        </DetailContent>
    );
};

export default ContractDetailPage;
