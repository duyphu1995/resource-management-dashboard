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
import companyService from '@/services/admin/company';
import { ICompany } from '@/types/admin';
import { formatDataTable, formatMappingKey, formatTimeMonthDayYear, statusMapping } from '@/utils/common';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useLoading from '@/utils/hook/useLoading';
import usePermissions from '@/utils/hook/usePermissions';
import { createSorter, searchByKeyword } from '@/utils/table';
import { Button, Flex } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.companyAppendix.main.name },
    { title: pathnames.admin.appendix.companyAppendix.company.main.name, path: pathnames.admin.appendix.companyAppendix.company.main.path }
];

const CompanyPage = () => {
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { havePermission } = usePermissions('AppendixCompanyAppendixCompanyList', 'Company');
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    const searchByKeywordFromRedux = selectSearchParamsRedux.adminCompany.searchByKeyword;
    const paginationTableFromRedux = selectSearchParamsRedux.adminCompany.paginationTable;

    const [keyword, setKeyword] = useState(searchByKeywordFromRedux || '');
    const [allData, setAllData] = useState<ICompany[]>([]);
    const [data, setData] = useState<ICompany[]>(allData);

    const [columns] = useState<ColumnType<ICompany>[]>([
        {
            key: 'companyName',
            title: 'Company',
            width: 250,
            fixed: 'left',
            sorter: createSorter('companyName'),
            render: (record: ICompany) => (
                <Link
                    className="underline"
                    style={{ color: '#323232' }}
                    to={pathnames.admin.appendix.companyAppendix.company.detail.path + '/' + record.companyId}
                >
                    {renderWithFallback(record.companyName, true, 30)}
                </Link>
            )
        },
        {
            key: 'companyNameEN',
            title: 'English Name',
            width: 200,
            sorter: createSorter('companyNameEN'),
            render: (record: ICompany) => renderWithFallback(record.companyNameEN, true, 30)
        },
        {
            key: 'companyAcronym',
            title: 'Short Name',
            width: 200,
            sorter: createSorter('companyAcronym'),
            render: (record: ICompany) => renderWithFallback(record.companyAcronym, true, 30)
        },
        {
            key: 'prefixKeyContract',
            title: 'Badge ID Format',
            width: 160,
            sorter: createSorter('prefixKeyContract'),
            render: (record: ICompany) => renderWithFallback(record.prefixKeyContract)
        },
        {
            key: 'companyAddress',
            title: 'Address',
            width: 198,
            sorter: createSorter('companyAddress'),
            render: (record: ICompany) => renderWithFallback(record.companyAddress, true, 30)
        },
        {
            key: 'companyOwner',
            title: 'Mr/Ms',
            width: 200,
            sorter: createSorter('companyOwner'),
            render: (record: ICompany) => renderWithFallback(record.companyOwner)
        },
        {
            key: 'ownerPosition',
            title: 'Position',
            width: 121,
            sorter: createSorter('ownerPosition'),
            render: (record: ICompany) => renderWithFallback(record.ownerPosition)
        },
        {
            key: 'companyPhone',
            title: 'Phone',
            width: 121,
            sorter: createSorter('companyPhone'),
            render: (record: ICompany) => renderWithFallback(record.companyPhone, true, 30)
        },
        {
            key: 'companyFax',
            title: 'Fax',
            width: 150,
            sorter: createSorter('companyFax'),
            render: (record: ICompany) => renderWithFallback(record.companyFax, true, 30)
        },
        {
            key: 'statusName',
            title: 'Status',
            width: 99,
            sorter: createSorter('statusName'),
            render: (record: ICompany) => {
                const statusConfig = statusMapping[formatMappingKey(record.statusName)];

                return <BaseTag {...statusConfig} statusName={record.statusName} />;
            }
        },
        {
            key: 'createdOn',
            title: 'Created Date',
            width: 150,
            sorter: createSorter('createdOn', 'date'),
            render: (record: ICompany) => renderWithFallback(formatTimeMonthDayYear(record.createdOn))
        },
        {
            key: 'lastModifiedOn',
            title: 'Edited Date',
            width: 150,
            sorter: createSorter('lastModifiedOn', 'date'),
            render: (record: ICompany) => renderWithFallback(formatTimeMonthDayYear(record.lastModifiedOn))
        }
    ]);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await companyService.getAll();
            let { data = [] } = res;
            data = data.map(row => ({ ...row, statusName: row.isActive ? 'Active' : 'Inactive' })); // Add statusName by isActive

            setAllData(data);
            turnOffLoading();
        };

        fetchData();
    }, [turnOnLoading, turnOffLoading]);

    // Update data when data or keyword changed
    useEffect(() => {
        setData(
            searchByKeyword(allData, columns, keyword, [
                'companyNameEN',
                'companyAcronym',
                'prefixKeyContract',
                'companyAddress',
                'ownerPosition',
                'companyPhone',
                'companyFax',
                'statusName',
                'createdOn',
                'lastModifiedOn'
            ])
        );
    }, [keyword, allData, columns]);

    const { handlePageChange, setSearchByKeyword } = useDataTableControls('adminCompany');

    useEffect(() => {
        setSearchByKeyword(keyword);
    }, [keyword, setSearchByKeyword]);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <DetailHeader pageTitle={pathnames.admin.appendix.companyAppendix.company.main.name} />

            {/* Search Input and Button Add new */}
            <Flex justify="space-between" gap={'20px 22px'}>
                <SearchInput style={{ width: 357 }} defaultValue={keyword} placeholder="Search by company, Mr/Ms" setKeyword={setKeyword} />

                {havePermission('Add') && (
                    <Link to={pathnames.admin.appendix.companyAppendix.company.add.path}>
                        <Button type="primary">{pathnames.admin.appendix.companyAppendix.company.add.name}</Button>
                    </Link>
                )}
            </Flex>

            {/* TABLE */}
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

export default CompanyPage;
