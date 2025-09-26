import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import ListManagement from '@/components/common/list-management';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import { searchParamsActions, selectSearchParams } from '@/redux/search-params-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import updateIdCardListService from '@/services/hr-management/update-id-card-list';
import { IDataBreadcrumb } from '@/types/common';
import { IFilterData } from '@/types/filter';
import { IUpdateIDCardListState } from '@/types/filter-redux';
import { IUpdateIDCardList } from '@/types/hr-management/update-id-card-list';
import { IListManagementFilter, IListManagementQuickFilter, IListManagementTable } from '@/types/list-management';
import { formatTimeMonthDayYear, generateReduxSearchParams, processFilterParams, remapUnits } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import usePermissions from '@/utils/hook/usePermissions';
import { createSorter } from '@/utils/table';
import { Avatar, Form } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const UpdateIDCardListPage = () => {
    const [filterForm] = Form.useForm();
    const [dataTable, setDataTable] = useState<IUpdateIDCardList[]>([]);
    const dispatch = useAppDispatch();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    const filterParamsFromRedux = selectSearchParamsRedux.updateIDCardList.filter;
    const searchByKeywordFromRedux = selectSearchParamsRedux.updateIDCardList.searchByKeyword;
    const paginationTableFromRedux = selectSearchParamsRedux.updateIDCardList.paginationTable;

    // #region Filter
    // Filter data
    const [keyword, setKeyword] = useState(searchByKeywordFromRedux || '');
    const [filterData, setFilterData] = useState<IFilterData[]>([]);
    const [isLoadingFilter, setIsLoadingFilter] = useState(true);

    const { havePermission } = usePermissions('UpdateIDCardList', 'HRManagement');

    // Search params
    const [searchParams, setSearchParams] = useState(filterParamsFromRedux || {});
    const enabledSearch = ['fullName', 'badgeId', 'workEmail'];

    // Update filter
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingFilter(true);
            const res = await updateIdCardListService.getAllIndexes();
            const data = res.data;

            // Get options for new filter data
            const companyOptions = data?.companies?.map(item => ({
                label: item.companyName,
                value: item.companyId.toString()
            }));

            const unitData = remapUnits(data?.units);

            const newFilterData: IFilterData[] = [
                {
                    key: 'companyIds',
                    forColumns: ['companyName'],
                    label: 'Company',
                    alwaysShow: true,
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={companyOptions || []}
                            placeholder="Select company"
                            searchPlaceholder="Search company"
                        />
                    )
                },
                {
                    key: 'unitIds',
                    forColumns: ['dgName', 'dcName', 'projectName'],
                    label: ORG_UNITS.Project,
                    alwaysShow: true,
                    control: (
                        <TreeSelect multiple size="small" treeData={unitData || []} placeholder="Select project" searchPlaceholder="Search project" />
                    )
                },
                {
                    key: 'submitDate',
                    forColumns: ['submitDate'],
                    label: 'Submit On',
                    alwaysShow: true,
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromSubmitOn" toName="toSubmitOn" />
                }
            ];

            setFilterData(newFilterData);
            setIsLoadingFilter(false);
        };

        fetchData();
    }, []);
    // #endregion Filter

    // #region Table
    const [isLoadingTable, setIsLoadingTable] = useState(false);

    const tableColumns: ColumnsType<IUpdateIDCardList> = [
        {
            title: 'Badge ID',
            dataIndex: 'badgeId',
            key: 'badgeId',
            fixed: 'left',
            width: 109,
            sorter: createSorter('badgeId'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
            fixed: 'left',
            width: 300,
            sorter: createSorter('fullName'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Photo',
            dataIndex: 'employeeImageUrl',
            key: 'employeeImageUrl',
            width: 72,
            render: item => <Avatar src={item} />
        },
        {
            title: 'ID Number',
            dataIndex: 'idCardNo',
            key: 'idCardNo',
            width: 130,
            sorter: createSorter('idCardNo', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Issue Date',
            dataIndex: 'idCardIssueDate',
            key: 'idCardIssueDate',
            width: 130,
            sorter: createSorter('idCardIssueDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Issue Place',
            dataIndex: 'idCardIssuePlace',
            key: 'idCardIssuePlace',
            width: 200,
            sorter: createSorter('idCardIssuePlace'),
            render: item => renderWithFallback(item, true)
        },
        {
            title: 'Font Side Image',
            dataIndex: 'idCardFontImageUrl',
            key: 'idCardFontImageUrl',
            width: 150,
            render: item => havePermission('ViewAttachment') && (
                <Link to={item} target="_blank" className="view-attachment underline">
                    View attachment
                </Link>
            )
        },
        {
            title: 'Back Side Image',
            dataIndex: 'idCardBackImageUrl',
            key: 'idCardBackImageUrl',
            width: 150,
            render: item => havePermission('ViewAttachment') && (
                <Link to={item} target="_blank" className="view-attachment underline">
                    View attachment
                </Link>
            )
        },
        {
            title: 'Submit On',
            dataIndex: 'submitOn',
            key: 'submitOn',
            width: 130,
            sorter: createSorter('submitOn', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Main Project',
            dataIndex: 'projectName',
            key: 'projectName',
            width: 130,
            sorter: createSorter('projectName'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Company',
            dataIndex: 'companyName',
            key: 'companyName',
            width: 200,
            sorter: createSorter('companyName'),
            render: item => renderWithFallback(item, true)
        },
        {
            title: ORG_UNITS.DC,
            dataIndex: 'dcName',
            key: 'dcName',
            width: 130,
            sorter: createSorter('dcName'),
            render: item => renderWithFallback(item)
        },
        {
            title: ORG_UNITS.DG,
            dataIndex: 'dgName',
            key: 'dgName',
            width: 130,
            sorter: createSorter('gdName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'workEmail',
            key: 'workEmail'
        }
    ];

    // Showed columns
    const alwaysShowColumnNames = [
        'badgeId',
        'fullName',
        'employeeImageUrl',
        'idCardNo',
        'idCardIssueDate',
        'idCardIssuePlace',
        'idCardStatusName',
        'idCardFontImageUrl',
        'idCardBackImageUrl',
        'submitOn',
        'projectName',
        'companyName',
        'dcName',
        'dgName'
    ];

    // Get data from api
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingTable(true);
                const res = await updateIdCardListService.getAllUpdateIdCardList(searchParams);
                const newData = res.data || [];

                setDataTable(newData);
            } catch (error) {
                setDataTable([]);
            } finally {
                setIsLoadingTable(false);
            }
        };

        fetchData();
    }, [searchParams]);
    // #endregion Table

    // #region ListManagement
    const pageTitle = pathnames.hrManagement.updateIDCardList.main.name;
    const breadcrumb: IDataBreadcrumb[] = [{ title: pathnames.hrManagement.main.name }, { title: pathnames.hrManagement.updateIDCardList.main.name }];
    const quickFilter: IListManagementQuickFilter = {
        service: {
            getAll: updateIdCardListService.getAllQuickFilter,
            create: updateIdCardListService.createQuickFilter,
            delete: updateIdCardListService.deleteQuickFilter,
            update: updateIdCardListService.updateQuickFilter
        }
    };

    const { handlePageChange, setSearchByKeyword, showedColumns, updateShowedColumns } = useDataTableControls(
        'updateIDCardList',
        alwaysShowColumnNames,
        tableColumns,
        enabledSearch
    );

    useEffect(() => {
        setSearchByKeyword(keyword);
    }, [keyword, setSearchByKeyword]);

    // Set data redux for filter
    useEffect(() => {
        const dataReduxSearchParams = generateReduxSearchParams(filterData, filterForm);

        dispatch(
            searchParamsActions.setFilterParamsRedux({
                updateIDCardList: {
                    filter: { ...dataReduxSearchParams }
                }
            })
        );
    }, [searchParams, dispatch, filterData, filterForm]);

    useEffect(() => {
        const processedParams = processFilterParams(filterParamsFromRedux ?? {});

        // Set the processed values in the form
        filterForm.setFieldsValue(processedParams);
    }, [filterParamsFromRedux, filterForm]);

    const isShowFilter = searchParams
        ? Object.keys(searchParams).some(key => {
            const typedKey = key as keyof IUpdateIDCardListState;
            return searchParams[typedKey] != null;
        })
        : false;

    const filter: IListManagementFilter<IUpdateIDCardList> = {
        isShowFilter,
        data: filterData,
        form: filterForm,
        value: searchParams,
        loading: isLoadingFilter,
        searchInput: {
            value: keyword,
            placeholder: 'Search by Badge ID, Full Name, Work Email',
            onChange: setKeyword
        },
        moreButtons: havePermission('Export') ? [
            {
                name: 'exportFile',
                children: 'Export',
                fileName: 'UpdateIDCardList.xlsx',
                service: updateIdCardListService.exportUpdateIdCardList,
                onExport: data => ({ employeeIds: data.map(item => item.employeeId.toString()) })
            }
        ] : [],
        onChangeData: setFilterData,
        onFilter: value => {
            setSearchParams(value);
        }
    };

    const table: IListManagementTable<IUpdateIDCardList> = {
        data: dataTable,
        loading: isLoadingTable,
        columns: tableColumns,
        showedColumns: {
            data: showedColumns,
            onChange: updateShowedColumns
        },
        paginationTable: {
            currentPage: paginationTableFromRedux?.currentPage || 1,
            pageSize: paginationTableFromRedux?.pageSize || 10,
            onChange: handlePageChange
        },
        className: 'min-h-498'
    };
    // #endregion ListManagement

    return (
        <>
            <ListManagement pageTitle={pageTitle} breadcrumb={breadcrumb} quickFilter={quickFilter} filter={filter} table={table} />
        </>
    );
};

export default UpdateIDCardListPage;
