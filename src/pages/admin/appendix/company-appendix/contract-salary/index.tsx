import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import SearchInput from '@/components/common/form/input/search-input';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import BaseTag from '@/components/common/tag';
import pathnames from '@/pathnames';
import { selectSearchParams } from '@/redux/search-params-slice';
import { useAppSelector } from '@/redux/store';
import salaryService from '@/services/admin/salary';
import { IAdminSalary } from '@/types/admin';
import { formatCurrencyVND, formatDataTable, formatMappingKey, formatTimeMonthDayYear, statusMapping } from '@/utils/common';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useLoading from '@/utils/hook/useLoading';
import usePermissions from '@/utils/hook/usePermissions';
import { createSorter, searchByKeyword } from '@/utils/table';
import { Button, Flex } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.companyAppendix.main.name },
    {
        title: pathnames.admin.appendix.companyAppendix.contractSalary.main.name,
        path: pathnames.admin.appendix.companyAppendix.contractSalary.main.path
    }
];

const ContractSalaryPage = () => {
    const navigation = useNavigate();
    const { havePermission } = usePermissions('AppendixCompanyAppendixContractSalaryList', 'ContractSalary');
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    const searchByKeywordFromRedux = selectSearchParamsRedux.adminContractSalary.searchByKeyword;
    const paginationTableFromRedux = selectSearchParamsRedux.adminContractSalary.paginationTable;

    const [keyword, setKeyword] = useState(searchByKeywordFromRedux || '');
    const [allData, setAllData] = useState<any[]>([]);
    const [data, setData] = useState<any[]>(allData);

    const [columns] = useState<ColumnType<IAdminSalary>[]>([
        {
            title: 'Grade',
            key: 'grade',
            fixed: 'left',
            width: 89,
            sorter: createSorter('grade', 'number'),
            render: (record: IAdminSalary) => (
                <Link
                    to={pathnames.admin.appendix.companyAppendix.contractSalary.detail.path + `/${record.salaryRangeId}`}
                    style={{ color: '#323232' }}
                    className="underline"
                >
                    {record.grade}
                </Link>
            )
        },
        {
            title: 'Position',
            key: 'positionName',
            fixed: 'left',
            width: 150,
            sorter: createSorter('positionName'),
            render: (record: IAdminSalary) => renderWithFallback(record.positionName)
        },
        {
            title: 'Career',
            key: 'career',
            fixed: 'left',
            width: 175,
            sorter: createSorter('career'),
            render: (record: IAdminSalary) => renderWithFallback(record.career)
        },
        {
            title: 'Salary By Number',
            key: 'salary',
            width: 168,
            sorter: createSorter('salary', 'number'),
            render: (record: IAdminSalary) => renderWithFallback(formatCurrencyVND(record.salary))
        },
        {
            dataIndex: 'salaryInText',
            title: 'Salary By Text',
            key: 'salaryInText',
            width: 172,
            sorter: createSorter('salaryInText'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'companyName',
            title: 'Company',
            key: 'companyName',
            width: 200,
            sorter: createSorter('companyName'),
            render: item => renderWithFallback(item, true)
        },
        {
            title: 'Status',
            dataIndex: 'statusName',
            key: 'statusName',
            width: 99,
            align: 'center',
            sorter: createSorter('statusName'),
            render: (statusName: string) => {
                const statusConfig = statusMapping[formatMappingKey(statusName)];
                return <BaseTag {...statusConfig} statusName={statusName} />;
            }
        },
        {
            dataIndex: 'createdOn',
            title: 'Created Date',
            key: 'createdOn',
            width: 150,
            sorter: createSorter('createdOn', 'date'),
            render: (item: string) => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'lastModifiedOn',
            title: 'Edited Date',
            key: 'lastModifiedOn',
            width: 150,
            sorter: createSorter('lastModifiedOn', 'date'),
            render: (item: string) => renderWithFallback(formatTimeMonthDayYear(item))
        }
    ]);

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await salaryService.getAll();
            const { data = [] } = res;
            const newData = data.map((item: any) => ({ ...item, statusName: item.isActive ? 'Active' : 'Inactive' }));

            setAllData(newData);
            turnOffLoading();
        };

        fetchData();
    }, [turnOnLoading, turnOffLoading]);

    // Update data when data or keyword changed
    useEffect(() => {
        setData(
            searchByKeyword(allData, columns, keyword, [
                'career',
                'salary',
                'salaryInText',
                'companyName',
                'statusName',
                'createdOn',
                'lastModifiedOn'
            ])
        );
    }, [keyword, allData, columns]);

    const { handlePageChange, setSearchByKeyword } = useDataTableControls('adminContractSalary');

    useEffect(() => {
        setSearchByKeyword(keyword);
    }, [keyword, setSearchByKeyword]);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <DetailHeader pageTitle="Contract Salary" />
            <Flex justify="space-between" gap={'20px 22px'}>
                <SearchInput style={{ width: 357 }} defaultValue={keyword} placeholder="Search by grade, position" setKeyword={setKeyword} />

                {havePermission('Add') && (
                    <Button type="primary" onClick={() => navigation(pathnames.admin.appendix.companyAppendix.contractSalary.add.path)}>
                        Add New Salary
                    </Button>
                )}
            </Flex>
            <BaseTable
                columns={columns}
                dataSource={formatDataTable(data)}
                style={{ marginTop: 24 }}
                loading={isLoading}
                scroll={{ x: 'max-content', y: 533 }}
                paginationTable={{
                    currentPage: paginationTableFromRedux?.currentPage || 1,
                    pageSize: paginationTableFromRedux?.pageSize || 10,
                    onChange: handlePageChange
                }}
            />
        </DetailContent>
    );
};

export default ContractSalaryPage;
