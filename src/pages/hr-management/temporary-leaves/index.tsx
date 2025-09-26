import Avatar from '@/components/common/avatar';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import ListManagement from '@/components/common/list-management';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import { searchParamsActions, selectSearchParams } from '@/redux/search-params-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import temporaryLeaveService from '@/services/hr-management/temporary-management';
import { IFilterData } from '@/types/filter';
import { ITemporaryLeavesState } from '@/types/filter-redux';
import { IListManagementFilter, IListManagementQuickFilter, IListManagementTable } from '@/types/list-management';
import { formatTimeMonthDayYear, generateReduxSearchParams, processFilterParams, remapUnits } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { createSorter } from '@/utils/table';
import { ButtonProps, Form } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './index.scss';
import usePermissions from '@/utils/hook/usePermissions';

const TemporaryLeavesPage = () => {
    const [filterForm] = Form.useForm();
    const navigation = useNavigate();
    const { showNotification } = useNotify();
    const dispatch = useAppDispatch();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    // Filter: Show on-going
    const filterParamsFromReduxOnGoing = selectSearchParamsRedux.temporaryLeavesOnGoing.filter;
    const searchByKeywordFromReduxOnGoing = selectSearchParamsRedux.temporaryLeavesOnGoing.searchByKeyword;
    const paginationTableFromReduxOnGoing = selectSearchParamsRedux.temporaryLeavesOnGoing.paginationTable;
    // Filter: Show finished
    const filterParamsFromReduxFinished = selectSearchParamsRedux.temporaryLeavesFinish.filter;
    const searchByKeywordFromReduxFinished = selectSearchParamsRedux.temporaryLeavesFinish.searchByKeyword;
    const paginationTableFromReduxFinished = selectSearchParamsRedux.temporaryLeavesFinish.paginationTable;

    // #region Filter
    // Filter: Show deleted contract
    const [isFinish, setIsFinish] = useState(filterParamsFromReduxOnGoing?.isFinish || false);
    const filterSegmentedOptions = [
        {
            value: false,
            label: 'On-going'
        },
        {
            value: true,
            label: 'Finished'
        }
    ];

    const [keyword, setKeyword] = useState((isFinish ? searchByKeywordFromReduxFinished : searchByKeywordFromReduxOnGoing) || '');
    const [filterData, setFilterData] = useState<IFilterData[]>([]);
    const [isLoadingFilter, setIsLoadingFilter] = useState(true);
    const [searchParams, setSearchParams] = useState(isFinish ? filterParamsFromReduxFinished : filterParamsFromReduxOnGoing);
    const [showDialogDelete, setShowDialogDelete] = useState<boolean>(false);
    const [valueDelete, setValueDelete] = useState<any>({});

    const { havePermission } = usePermissions('TemporaryLeavesList', 'TemporaryLeaves');

    const enabledSearch = ['badgeId', 'fullName', 'workEmail'];
    const keywordPlaceholder = 'Search by Badge ID, Full Name, Work Email';

    // Effect: Update filter data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingFilter(true);
            const res = await temporaryLeaveService.getAllIndexes();
            const { companies, statuses, units } = res.data || {};

            const companyOptions = companies?.map(item => ({ label: item.companyName, value: item.companyId.toString() }));
            const unitOptions = remapUnits(units);
            const statusOptions = statuses?.map(item => ({ label: item.statusName, value: item.statusId.toString() }));

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
                        <TreeSelect
                            multiple
                            size="small"
                            treeData={unitOptions || []}
                            placeholder="Select project"
                            searchPlaceholder="Search project"
                        />
                    )
                },
                {
                    key: 'startDate',
                    forColumns: ['startDate'],
                    label: 'Start Date',
                    alwaysShow: true,
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromStartDate" toName="toStartDate" />
                },
                {
                    key: 'endDate',
                    forColumns: ['endDate'],
                    label: 'Expected End Date',
                    alwaysShow: true,
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromEndDate" toName="toEndDate" />
                },
                {
                    key: 'actualEndDate',
                    forColumns: ['ActualEndDate'],
                    label: 'Actual End Date',
                    alwaysShow: true,
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromActualEndDate" toName="toActualEndDate" />
                },
                {
                    key: 'LeaveTypeIds',
                    forColumns: ['LeaveTypeIds'],
                    label: 'Leave Types',
                    alwaysShow: true,
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={statusOptions || []}
                            placeholder="Select leave types"
                            searchPlaceholder="Search leave types"
                        />
                    )
                }
            ];

            setFilterData(newFilterData);
            setIsLoadingFilter(false);
        };

        fetchData();
    }, []);
    // #endregion Filter

    // #region DataTable
    const handleDeleteTemporaryLeave = async () => {
        try {
            const res = await temporaryLeaveService.deleteTemporaryLeave(valueDelete?.temporaryLeaveId);
            const { succeeded, message } = res;

            showNotification(succeeded, message);
            setShowDialogDelete(false);
            setSearchParams({ ...searchParams });
        } catch (error) {
            showNotification(false, 'Delete failed');
        }
    };

    const handleShowDeleteTemporaryLeave = (item: any) => {
        setValueDelete(item);
        setShowDialogDelete(true);
    };

    // Table columns
    const tableColumns: ColumnsType<any> = [
        {
            dataIndex: 'workEmail',
            key: 'workEmail'
        },
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
            render: (item: string, record) => (
                <Link
                    to={pathnames.hrManagement.temporaryLeaves.detail.path + '/' + record.temporaryLeaveId}
                    style={{ color: record.leaveTypeColor || '#323232' }}
                    className="full-name"
                >
                    {renderWithFallback(item)}
                </Link>
            )
        },
        {
            title: 'Photo',
            dataIndex: 'employeeImageUrl',
            key: 'employeeImageUrl',
            width: 72,
            render: item => <Avatar src={item} />
        },
        {
            title: ORG_UNITS.Project,
            dataIndex: 'projectName',
            key: 'projectName',
            width: 139,
            sorter: createSorter('projectName'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Leave Type',
            dataIndex: 'leaveTypeName',
            key: 'leaveTypeName',
            width: 165,
            sorter: createSorter('leaveTypeName'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Effort',
            dataIndex: 'effort',
            key: 'effort',
            width: 129,
            render: item => renderWithFallback(item + '%')
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            width: 126,
            sorter: createSorter('startDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Expected End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 180,
            sorter: createSorter('endDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Actual End Date',
            dataIndex: 'actualEndDate',
            key: 'actualEndDate',
            width: 180,
            sorter: createSorter('actualEndDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Note',
            dataIndex: 'notes',
            key: 'note',
            width: 204,
            sorter: createSorter('note'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 76,
            render: (record: any) => {
                const items = [
                    havePermission('Print') &&
                        (record.leaveTypeName === 'LeaveWithoutPaid'
                            ? {
                                  icon: icons.tableAction.print,
                                  iconAlt: 'Print',
                                  link: pathnames.hrManagement.temporaryLeaves.print.path + '/' + record.temporaryLeaveId,
                                  tooltip: 'Print'
                              }
                            : undefined),
                    havePermission('Delete') && {
                        icon: icons.tableAction.delete,
                        iconAlt: 'Delete',
                        onClick: () => handleShowDeleteTemporaryLeave(record),
                        tooltip: 'Delete'
                    }
                ].filter(Boolean);
                return <ButtonsIcon items={items} />;
            }
        }
    ];

    // Showed columns
    const alwaysShowColumnNames = [
        'badgeId',
        'fullName',
        'employeeImageUrl',
        'projectName',
        'leaveTypeName',
        'effort',
        'startDate',
        'endDate',
        'actualEndDate',
        'note'
    ];

    // Data table
    const [isLoadingTable, setIsLoadingTable] = useState(true);
    const [dataTable, setDataTable] = useState<any[]>([]);

    // Effect: Update data

    useEffect(() => {
        const getListTemporaryLeave = async () => {
            try {
                setIsLoadingTable(true);
                const res = await temporaryLeaveService.searchTemporary({ ...searchParams, isFinish });
                const newDataTable = res.data || [];

                setDataTable(newDataTable);
            } catch (error) {
                setDataTable([]);
            } finally {
                setIsLoadingTable(false);
            }
        };

        getListTemporaryLeave();
    }, [searchParams, isFinish]);
    // #endregion Table

    // #region ListManagement
    const pageTitle = pathnames.hrManagement.temporaryLeaves.main.name;
    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.hrManagement.main.name },
        { title: pathnames.hrManagement.temporaryLeaves.main.name }
    ];
    const buttons: ButtonProps[] = [
        havePermission('Add') && {
            type: 'primary',
            onClick: () => navigation(pathnames.hrManagement.temporaryLeaves.add.path),
            children: 'Add New Leave'
        }
    ].filter(Boolean);

    const quickFilter: IListManagementQuickFilter = {
        service: {
            getAll: temporaryLeaveService.getAllQuickFilter,
            create: temporaryLeaveService.createQuickFilter,
            delete: temporaryLeaveService.deleteQuickFilter,
            update: temporaryLeaveService.updateQuickFilter
        }
    };

    const { handlePageChange, setSearchByKeyword, showedColumns, updateShowedColumns } = useDataTableControls(
        isFinish ? 'temporaryLeavesFinish' : 'temporaryLeavesOnGoing',
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

        const updatedParams = {
            temporaryLeavesFinish: {
                filter: {
                    ...(isFinish ? dataReduxSearchParams : filterParamsFromReduxFinished),
                    isFinish
                }
            },
            temporaryLeavesOnGoing: {
                filter: {
                    ...(isFinish ? filterParamsFromReduxOnGoing : dataReduxSearchParams),
                    isFinish
                }
            }
        };

        dispatch(searchParamsActions.setFilterParamsRedux(updatedParams));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, dispatch, isFinish, filterData, filterForm]);

    useEffect(() => {
        let processedParams = {};
        isFinish
            ? (processedParams = processFilterParams(filterParamsFromReduxFinished ?? {}))
            : (processedParams = processFilterParams(filterParamsFromReduxOnGoing ?? {}));

        // Set the processed values in the form
        filterForm.setFieldsValue(processedParams);
    }, [filterForm, isFinish, filterParamsFromReduxFinished, filterParamsFromReduxOnGoing]);

    const isShowFilter = searchParams
        ? Object.keys(searchParams).some(key => {
              const typedKey = key as keyof ITemporaryLeavesState;
              return typedKey !== 'isFinish' && searchParams[typedKey] != null;
          })
        : false;

    const filter: IListManagementFilter<any> = {
        isShowFilter,
        data: filterData,
        form: filterForm,
        value: searchParams,
        loading: isLoadingFilter,
        searchInput: {
            value: keyword,
            placeholder: keywordPlaceholder,
            onChange: setKeyword
        },
        segmented: {
            name: 'isFinish',
            options: filterSegmentedOptions,
            value: isFinish,
            onChange: value => {
                filterForm.resetFields();
                value
                    ? dispatch(searchParamsActions.resetPaginationParamsRedux('temporaryLeavesFinish'))
                    : dispatch(searchParamsActions.resetPaginationParamsRedux('temporaryLeavesOnGoing'));
                setIsFinish(value);
                setSearchParams(value ? filterParamsFromReduxFinished : filterParamsFromReduxOnGoing);
            }
        },
        moreButtons: havePermission('Export')
            ? [
                  {
                      name: 'exportFile',
                      children: 'Export',
                      fileName: 'Temporary Leave Report.xlsx',
                      service: temporaryLeaveService.exportTemporaryLeave,
                      onExport: data => ({ temporaryLeaveIds: data.map(item => item.temporaryLeaveId.toString()) })
                  }
              ]
            : [],
        onChangeData: setFilterData,
        onFilter: value => {
            setSearchParams(value);
        }
    };

    const getPaginationData = (isFinish: boolean) => {
        const paginationData = isFinish ? paginationTableFromReduxFinished : paginationTableFromReduxOnGoing;
        return {
            currentPage: paginationData?.currentPage || 1,
            pageSize: paginationData?.pageSize || 10
        };
    };

    const table: IListManagementTable<any> = {
        data: dataTable,
        loading: isLoadingTable,
        columns: tableColumns,
        showedColumns: {
            data: showedColumns,
            onChange: updateShowedColumns
        },
        paginationTable: {
            ...getPaginationData(isFinish),
            onChange: handlePageChange
        },
        scroll: { x: 'max-content', y: 498 },
        className: 'min-h-498'
    };
    //#endregion ListManagement

    return (
        <>
            <ListManagement pageTitle={pageTitle} buttons={buttons} breadcrumb={breadcrumb} quickFilter={quickFilter} filter={filter} table={table} />

            <DialogCommon
                open={showDialogDelete}
                onClose={() => setShowDialogDelete(false)}
                title="Delete Temporary Leaves"
                content={
                    <>
                        The temporary leaves <strong>{valueDelete.fullName}</strong> - <strong>{valueDelete.badgeId}</strong> will be deleted. Are you
                        sure you want to delete this temporary leaves?
                    </>
                }
                icon={icons.dialog.delete}
                buttonType="default-danger"
                buttonLeftClick={() => setShowDialogDelete(false)}
                buttonRightClick={handleDeleteTemporaryLeave}
            />
        </>
    );
};

export default TemporaryLeavesPage;
