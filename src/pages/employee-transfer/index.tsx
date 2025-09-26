import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import ListManagement from '@/components/common/list-management';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import { searchParamsActions, selectSearchParams } from '@/redux/search-params-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import employeeTransferService from '@/services/transfer-employee';
import { IDataBreadcrumb } from '@/types/common';
import { IFilterData, IFilterOption } from '@/types/filter';
import { IEmployeeTransferState } from '@/types/filter-redux';
import { IListManagementFilter, IListManagementQuickFilter, IListManagementTable } from '@/types/list-management';
import { ITransferEmployee } from '@/types/transfer-employee';
import { formatTimeMonthDayYear, generateReduxSearchParams, processFilterParams, remapUnits } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useLoading from '@/utils/hook/useLoading';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { createSorter } from '@/utils/table';
import { ButtonProps, Form } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const EmployeeTransferPage = () => {
    const [filterForm] = Form.useForm();
    const navigation = useNavigate();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const dispatch = useAppDispatch();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    // Filter: Show pending transfer
    const filterParamsFromReduxPending = selectSearchParamsRedux.employeeTransferPending.filter;
    const searchByKeywordFromReduxPending = selectSearchParamsRedux.employeeTransferPending.searchByKeyword;
    const paginationTableFromReduxPending = selectSearchParamsRedux.employeeTransferPending.paginationTable;
    // Filter: Show completed transfer
    const filterParamsFromReduxCompleted = selectSearchParamsRedux.employeeTransferCompleted.filter;
    const searchByKeywordFromReduxCompleted = selectSearchParamsRedux.employeeTransferCompleted.searchByKeyword;
    const paginationTableFromReduxCompleted = selectSearchParamsRedux.employeeTransferCompleted.paginationTable;

    const { havePermission } = usePermissions('EmployeeTransferList', 'EmployeeTransfer');

    // #region Filter
    // Filter: Show working resignation or broken commitment
    const [isCompletedTransfer, setIsCompletedTransfer] = useState(filterParamsFromReduxPending?.isCompletedTransfer || false);
    const filterSegmentedOptions = [
        {
            label: 'Pending Transfer',
            value: false
        },
        {
            label: 'Completed Transfer',
            value: true
        }
    ];

    // Filter data
    const [keyword, setKeyword] = useState((isCompletedTransfer ? searchByKeywordFromReduxCompleted : searchByKeywordFromReduxPending) || '');
    const [filterData, setFilterData] = useState<IFilterData[]>([]);
    const [loadingFilter, setLoadingFilter] = useState(true);
    const [searchParams, setSearchParams] = useState(isCompletedTransfer ? filterParamsFromReduxCompleted : filterParamsFromReduxPending);
    const enabledSearch = ['badgeId', 'fullName', 'workEmail'];
    const keywordPlaceholder = 'Search by Badge ID, Full Name, Work Email';

    const createBaseSelect = (options: IFilterOption[], placeholder: string = 'Select status', searchPlaceholder: string = 'Search status') => (
        <BaseSelect mode="multiple" size="small" options={options} placeholder={placeholder} searchPlaceholder={searchPlaceholder} />
    );

    // Effect: Update filter
    useEffect(() => {
        const fetchData = async () => {
            setLoadingFilter(true);
            const res = await employeeTransferService.getAllIndex();
            const { data } = res;

            const companyOptions = data?.companyBasicDtos?.map(item => ({
                label: item.companyName,
                value: item.companyId.toString()
            }));

            const unitData = remapUnits(data?.unitBasicDtos);

            const positionOptions = data?.positionBasicDtos?.map(item => ({
                label: item.positionName,
                value: item.positionId.toString()
            }));

            const workingStatusCompleted = data?.completedTransferStatus?.map(item => ({
                label: item.transferStatusName,
                value: item.transferStatusId.toString()
            }));

            const workingStatusPending = data?.pendingTransferStatus?.map(item => ({
                label: item.transferStatusName,
                value: item.transferStatusId.toString()
            }));

            // Init new filter data
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
                            options={companyOptions}
                            placeholder="Select company"
                            searchPlaceholder="Search company"
                        />
                    )
                },
                {
                    key: 'fromProjectIds',
                    forColumns: ['fromProjectName'],
                    label: `From ${ORG_UNITS.Project}`,
                    alwaysShow: true,
                    control: <TreeSelect multiple size="small" treeData={unitData} placeholder="Select project" searchPlaceholder="Search project" />
                },
                {
                    key: 'toProjectIds',
                    forColumns: ['toProjectName'],
                    label: `To ${ORG_UNITS.Project}`,
                    alwaysShow: true,
                    control: <TreeSelect multiple size="small" treeData={unitData} placeholder="Select project" searchPlaceholder="Search project" />
                },
                {
                    key: 'positionIds',
                    forColumns: ['positionName'],
                    label: 'Position',
                    alwaysShow: true,
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={positionOptions}
                            placeholder="Select position"
                            searchPlaceholder="Search position"
                        />
                    )
                },
                {
                    key: 'transferDate',
                    forColumns: ['transferDate'],
                    label: 'Transfer Date',
                    alwaysShow: true,
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromTransferDate" toName="toTransferDate" disableToDateProps={() => false} />
                },
                ...(isCompletedTransfer
                    ? [
                          {
                              key: 'transferStatusIds',
                              forColumns: ['transferStatusName'],
                              label: 'Status',
                              alwaysShow: true,
                              control: createBaseSelect(workingStatusCompleted || [])
                          },
                          {
                              key: 'completedDate',
                              forColumns: ['completedDate'],
                              label: 'Completed Date',
                              alwaysShow: true,
                              colSpan: 12,
                              control: <FilterDateRange fromName="fromCompletedDate" toName="toCompletedDate" disableToDateProps={() => false} />
                          }
                      ]
                    : [
                          {
                              key: 'transferStatusIds',
                              forColumns: ['transferStatusName'],
                              label: 'Status',
                              alwaysShow: true,
                              control: createBaseSelect(workingStatusPending || [])
                          }
                      ])
            ];

            setFilterData(newFilterData);
            setLoadingFilter(false);
        };

        fetchData();
    }, [isCompletedTransfer]);
    // #endregion Filter

    // #region Table
    // Table columns
    const tableColumns: ColumnsType<ITransferEmployee> = [
        {
            title: 'Badge ID',
            dataIndex: 'badgeId',
            key: 'badgeId',
            fixed: 'left',
            width: 150,
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
            render: (fullName: string, record) => (
                <Link
                    to={pathnames.transferEmployee.detail.path + '/' + record.employeeTransferId}
                    style={{ fontWeight: '500', textTransform: 'uppercase', color: '#323232' }}
                    className="full-name"
                >
                    {renderWithFallback(fullName)}
                </Link>
            )
        },
        {
            title: 'Work Email',
            dataIndex: 'workEmail',
            key: 'workEmail',
            width: 300,
            sorter: createSorter('workEmail'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'From Project',
            dataIndex: 'fromProjectName',
            key: 'fromProjectName',
            width: 200,
            sorter: createSorter('fromProjectName'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'To Project',
            dataIndex: 'toProjectName',
            key: 'toProjectName',
            width: 200,
            sorter: createSorter('toProjectName'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Status',
            dataIndex: 'transferStatusName',
            key: 'transferStatusName',
            width: 200,
            sorter: createSorter('transferStatusName'),
            render: (statusName: string, record) => {
                const statusMappings: { [key: string]: string } = {
                    Cancel: 'Cancelled',
                    Disapprove: 'Disapproved'
                };

                let status = statusMappings[statusName] || statusName;
                if (!isCompletedTransfer) {
                    if (statusName.includes('Pending')) {
                        status = `Pending approval - (${record.pendingApproveFullName} - ${record.pendingApproveEmail})`;
                    } else {
                        status = 'Waiting for Transfer Date';
                    }
                }
                return <div style={{ fontWeight: '500', color: record.transferStatusColor }}>{renderWithFallback(status)}</div>;
            }
        },
        {
            title: 'Transfer Date',
            dataIndex: 'transferDate',
            key: 'transferDate',
            width: 150,
            sorter: createSorter('transferDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Completed Date',
            dataIndex: 'completedDate',
            key: 'completedDate',
            width: 170,
            sorter: createSorter('completedDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Company',
            dataIndex: 'companyName',
            key: 'companyName',
            width: 200,
            sorter: createSorter('companyName'),
            render: (item: string) => renderWithFallback(item, true)
        },
        {
            title: 'Position',
            dataIndex: 'positionName',
            key: 'positionName',
            width: 200,
            sorter: createSorter('positionName'),
            render: item => renderWithFallback(item)
        },
        ...(havePermission('Delete') || havePermission('Approval') || havePermission('DisApprove')
            ? [
                  {
                      title: 'Action',
                      key: 'action',
                      fixed: 'right' as const,
                      width: 100,
                      hidden: isCompletedTransfer,
                      render: (record: ITransferEmployee) => {
                          const pendingItems = [
                              havePermission('Approval') &&
                                  record.isEnableApprove &&
                                  record.transferStatusName.includes('Pending') && {
                                      icon: icons.tableAction.approval,
                                      tooltip: 'Approval',
                                      link: pathnames.transferEmployee.approval.path + '/' + record.employeeTransferId
                                  },
                              havePermission('DisApprove') &&
                                  record.isEnableDisApprove &&
                                  record.transferStatusName.includes('Pending') && {
                                      icon: icons.tableAction.disApprove,
                                      tooltip: 'DisApprove',
                                      link: pathnames.transferEmployee.disApproval.path + '/' + record.employeeTransferId
                                  },
                              havePermission('Delete') &&
                                  record.isEnableCancel && {
                                      icon: icons.tableAction.delete,
                                      tooltip: 'Cancel',
                                      link: pathnames.transferEmployee.cancel.path + '/' + record.employeeTransferId
                                  }
                          ];

                          return <ButtonsIcon items={pendingItems} />;
                      }
                  }
              ]
            : [])
    ];

    // Showed columns
    const initialShowColumnNames = [
        'badgeId',
        'fullName',
        'workEmail',
        'fromProjectName',
        'toProjectName',
        'transferStatusName',
        'transferDate',
        'companyName',
        'positionName'
    ];

    // Data table
    const [dataTable, setDataTable] = useState<any[]>([]);

    // Effect: Update data
    useEffect(() => {
        const fetchData = async () => {
            try {
                turnOnLoading();
                const res = await employeeTransferService.getAllEmployeeTransfer({ ...searchParams, isCompletedTransfer } as any);
                const { succeeded, data } = res;

                if (succeeded && data) {
                    setDataTable(data);
                }
            } catch (error) {
                setDataTable([]);
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [searchParams, isCompletedTransfer, turnOnLoading, turnOffLoading]);
    // #endregion Table

    // #region ListManagement
    const pageTitle = pathnames.transferEmployee.main.name;
    const breadcrumb: IDataBreadcrumb[] = [{ title: pathnames.home.name }, { title: pathnames.transferEmployee.main.name }];
    const buttons: ButtonProps[] = havePermission('Add') && [
        {
            type: 'primary',
            onClick: () => navigation(pathnames.transferEmployee.add.path),
            children: 'Add New Transfer'
        }
    ];

    const quickFilter: IListManagementQuickFilter = {
        service: {
            getAll: employeeTransferService.getAllQuickFilter,
            create: employeeTransferService.createQuickFilter,
            delete: employeeTransferService.deleteQuickFilter,
            update: employeeTransferService.updateQuickFilter
        }
    };

    const { handlePageChange, setSearchByKeyword, showedColumns, updateShowedColumns } = useDataTableControls(
        isCompletedTransfer ? 'employeeTransferCompleted' : 'employeeTransferPending',
        initialShowColumnNames,
        tableColumns,
        enabledSearch
    );

    useEffect(() => {
        const updatedColumns = showedColumns.map(column => {
            if (column.key === 'completedDate') {
                return { ...column, alwaysShow: isCompletedTransfer };
            }
            return column;
        });

        updateShowedColumns(updatedColumns);
    }, [isCompletedTransfer, showedColumns, updateShowedColumns]);

    useEffect(() => {
        setSearchByKeyword(keyword);
    }, [keyword, setSearchByKeyword]);

    // Set data redux for filter
    useEffect(() => {
        const dataReduxSearchParams = generateReduxSearchParams(filterData, filterForm);
        const updatedParams = {
            employeeTransferCompleted: {
                filter: {
                    ...(isCompletedTransfer ? dataReduxSearchParams : filterParamsFromReduxCompleted),
                    isCompletedTransfer
                }
            },
            employeeTransferPending: {
                filter: {
                    ...(isCompletedTransfer ? filterParamsFromReduxPending : dataReduxSearchParams),
                    isCompletedTransfer
                }
            }
        };

        dispatch(searchParamsActions.setFilterParamsRedux(updatedParams));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, filterData, filterForm, dispatch, isCompletedTransfer]);

    useEffect(() => {
        let processedParams = {};
        isCompletedTransfer
            ? (processedParams = processFilterParams(filterParamsFromReduxCompleted ?? {}))
            : (processedParams = processFilterParams(filterParamsFromReduxPending ?? {}));

        // Set the processed values in the form
        filterForm.setFieldsValue(processedParams);
    }, [filterForm, isCompletedTransfer, filterParamsFromReduxCompleted, filterParamsFromReduxPending]);

    const isShowFilter = searchParams
        ? Object.keys(searchParams).some(key => {
              const typedKey = key as keyof IEmployeeTransferState;
              return typedKey !== 'isCompletedTransfer' && searchParams[typedKey] != null;
          })
        : false;

    const filter: IListManagementFilter<ITransferEmployee> = {
        isShowFilter,
        data: filterData,
        form: filterForm,
        value: searchParams,
        loading: loadingFilter,
        searchInput: {
            value: keyword,
            onChange: setKeyword,
            placeholder: keywordPlaceholder
        },
        segmented: {
            name: 'isCompletedTransfer',
            options: filterSegmentedOptions,
            value: isCompletedTransfer,
            onChange: value => {
                filterForm.resetFields();
                value
                    ? dispatch(searchParamsActions.resetPaginationParamsRedux('employeeTransferCompleted'))
                    : dispatch(searchParamsActions.resetPaginationParamsRedux('employeeTransferPending'));
                setIsCompletedTransfer(value);
                setSearchParams(value ? filterParamsFromReduxCompleted : filterParamsFromReduxPending);
            }
        },
        moreButtons: [
            havePermission('Export') && {
                name: 'exportFile',
                children: 'Export',
                fileName: 'Employee Transfer.xlsx',
                service: employeeTransferService.exportEmployeeTransfer,
                onExport: (data: ITransferEmployee[]) => ({ employeeTransferIds: data.map(item => item.employeeTransferId.toString()) }),
                disabled: isCompletedTransfer ? false : true
            }
        ].filter(Boolean),
        onChangeData: setFilterData,
        onFilter: value => {
            setSearchParams(value);
        },
        isHideShowHideColumnsBtn: true
    };

    const getPaginationData = (isCompletedTransfer: boolean) => {
        const paginationData = isCompletedTransfer ? paginationTableFromReduxCompleted : paginationTableFromReduxPending;
        return {
            currentPage: paginationData?.currentPage || 1,
            pageSize: paginationData?.pageSize || 10
        };
    };

    const table: IListManagementTable<ITransferEmployee> = {
        data: dataTable,
        loading: isLoading,
        columns: tableColumns,
        showedColumns: {
            data: showedColumns,
            onChange: updateShowedColumns
        },
        paginationTable: {
            ...getPaginationData(isCompletedTransfer),
            onChange: handlePageChange
        },
        className: 'min-h-498'
    };
    //#endregion ListManagement

    return <ListManagement pageTitle={pageTitle} buttons={buttons} breadcrumb={breadcrumb} quickFilter={quickFilter} filter={filter} table={table} />;
};

export default EmployeeTransferPage;
