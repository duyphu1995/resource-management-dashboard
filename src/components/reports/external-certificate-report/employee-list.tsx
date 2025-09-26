import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import { IReportTabProps } from '@/pages/reports/external-certificate-report';
import externalCertificateReportService from '@/services/reports/external-certificate';
import { IEmployee } from '@/types/hr-management/employee-management';
import { formatDataTable, formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import { createSorter } from '@/utils/table';
import { TableColumnType } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '@/components/common/loading';

const EmployeeList = (props: IReportTabProps) => {
    const { searchParams, keyTabActive } = props;
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const subTitle = 'Employee List';
    const columns: TableColumnType<IEmployee>[] = [
        {
            dataIndex: 'badgeId',
            key: 'badgeId',
            title: 'Badge ID',
            width: 109,
            fixed: 'left',
            sorter: createSorter('badgeId'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fullName',
            key: 'fullName',
            title: 'Full Name',
            width: 300,
            fixed: 'left',
            sorter: createSorter('fullName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'certificateCatName',
            key: 'certificateCatName',
            title: 'Type',
            width: 180,
            sorter: createSorter('certificateCatName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'certificateName',
            key: 'certificateName',
            title: 'Certificate',
            width: 307,
            sorter: createSorter('certificateName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'issueDate',
            key: 'issueDate',
            title: 'Issued Date',
            width: 128,
            sorter: createSorter('issueDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            title: 'Expired Date',
            width: 128,
            sorter: createSorter('expiryDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 139,
            sorter: createSorter('projectName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: ORG_UNITS.DC,
            width: 137,
            sorter: createSorter('dcName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: ORG_UNITS.DG,
            width: 210,
            sorter: createSorter('dgName'),
            render: item => renderWithFallback(item)
        },
        {
            key: 'attachmentUrl',
            title: 'Attachment',
            width: 185,
            sorter: createSorter('attachmentUrl'),
            render: (record: IEmployee) =>
                record.attachmentUrl ? (
                    <Link target="_blank" to={record.attachmentUrl} className="underline" style={{ fontWeight: 'bold', color: '#2A9AD6' }}>
                        Attachment
                    </Link>
                ) : (
                    ''
                )
        }
    ];

    const [data, setData] = useState<IEmployee[]>([]);

    // Fetch new data by search params
    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const res = await externalCertificateReportService.getEmployeeList(searchParams);
                const { data = [], succeeded } = res;

                if (succeeded) {
                    setData(formatDataTable(data));
                }
            } catch (error: any) {
                throw new Error(error);
            } finally {
                turnOffLoading();
            }
        };

        if (keyTabActive === 'employeeList') fetchData();
    }, [searchParams, keyTabActive, turnOnLoading, turnOffLoading]);

    if (isLoading) return <Loading />;

    return (
        <div>
            <div className="external-certificate-report-sub-title">{subTitle}</div>
            <BaseTable dataSource={data} columns={columns} loading={isLoading} scroll={{ x: 'max-content', y: 511 }} className="min-h-511" />
        </div>
    );
};

export default EmployeeList;
