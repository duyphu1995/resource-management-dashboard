import Avatar from '@/components/common/avatar';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import ListManagement from '@/components/common/list-management';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableNote from '@/components/common/table/table-note';
import pathnames from '@/pathnames';
import { searchParamsActions, selectSearchParams } from '@/redux/search-params-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import employeeService from '@/services/hr-management/employee-management';
import managementListService from '@/services/hr-management/management-list';
import { IDataBreadcrumb } from '@/types/common';
import { IFilterData } from '@/types/filter';
import { IManagementState } from '@/types/filter-redux';
import { IEmployee } from '@/types/hr-management/employee-management';
import { IManagement } from '@/types/hr-management/management-list';
import { IListManagementFilter, IListManagementQuickFilter, IListManagementTable } from '@/types/list-management';
import { generateReduxSearchParams, processFilterParams, remapUnits } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { createSorter } from '@/utils/table';
import { ButtonProps, Form } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

dayjs.extend(customParseFormat);

const ManagementListPage = () => {
    const [filterForm] = Form.useForm();
    const { showNotification } = useNotify();
    const dispatch = useAppDispatch();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    const filterParamsFromRedux = selectSearchParamsRedux.managementList.filter;
    const searchByKeywordFromRedux = selectSearchParamsRedux.managementList.searchByKeyword;
    const paginationTableFromRedux = selectSearchParamsRedux.managementList.paginationTable;

    // #region Filter
    // Search, Filter data
    const [keyword, setKeyword] = useState(searchByKeywordFromRedux || '');
    const [filterData, setFilterData] = useState<IFilterData[]>([]);
    const [loadingFilter, setLoadingFilter] = useState(true);
    const [searchParams, setSearchParams] = useState(filterParamsFromRedux || {});
    const enabledSearch = ['badgeId', 'fullName', 'workEmail'];
    const keywordPlaceholder = 'Search by Badge ID, Full Name, Work Email';

    const { havePermission } = usePermissions('ManagementList', 'Management');

    // Effect: Update filter
    useEffect(() => {
        const fetchData = async () => {
            setLoadingFilter(true);
            const res = await employeeService.getAllIndexes('ManagementList');
            const managementIndexes = res?.data;

            // Get options for new filter data
            const companyOptions = managementIndexes?.companies?.map(item => ({
                label: item.companyName,
                value: item.companyId.toString()
            }));
            const unitData = remapUnits(managementIndexes?.units || []);
            const positionOptions = managementIndexes?.positions?.map(item => ({
                label: item.positionName,
                value: item.positionId.toString()
            }));
            const statusOptions = managementIndexes?.statuses?.map(item => ({
                label: item.statusName,
                value: item.statusId.toString()
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
                    key: 'positionIds',
                    forColumns: ['positionName'],
                    label: 'Position',
                    alwaysShow: true,
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={positionOptions || []}
                            placeholder="Select position"
                            searchPlaceholder="Search position"
                        />
                    )
                },
                {
                    key: 'statusIds',
                    forColumns: ['statusName'],
                    label: 'Working Status',
                    alwaysShow: true,
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={statusOptions || []}
                            placeholder="Select working status"
                            searchPlaceholder="Search working status"
                        />
                    )
                }
            ];

            setFilterData(newFilterData);
            setLoadingFilter(false);
        };

        fetchData();
    }, []);
    // #endregion Table

    // #region Delete Management
    // Delete management data
    const deleteModalTitle = 'Delete Management';
    const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
    const [deletedData, setDeletedData] = useState<IManagement | null>(null);
    const deleteModalContent = (
        <>
            The manager&nbsp;
            <strong>
                {deletedData?.fullName} - {deletedData?.badgeId}
            </strong>
            &nbsp; will be removed out of Management List. Are you sure you want to remove ?
        </>
    );

    const onShowDeleteModal = (deletedData: IManagement) => {
        setIsShowDeleteModal(true);
        setDeletedData(deletedData);
    };
    const onCloseDeleteModal = () => setIsShowDeleteModal(false);

    // Handle delete management
    const onDeleteEmployee = async () => {
        const res = await managementListService.deleteManagement(deletedData?.employeeId || 0);
        const { succeeded, message } = res;

        // Show notification
        showNotification(succeeded, message);

        // Close modal and reload data table
        setIsShowDeleteModal(false);
        setSearchParams({ ...searchParams });
    };
    // #endregion Delete Employee

    // #region Table
    // Table columns
    const tableColumns: ColumnsType<IManagement> = [
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
            render: (badgeId: string) => renderWithFallback(badgeId)
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
                    to={pathnames.hrManagement.managementList.detail.path + '/' + record.employeeId}
                    style={{ color: record.statusColor }}
                    className="full-name"
                >
                    {renderWithFallback(fullName)}
                </Link>
            )
        },
        {
            title: 'Photo',
            dataIndex: 'employeeImageUrl',
            key: 'employeeImageUrl',
            width: 72,
            render: (employeeImageUrl: string) => <Avatar src={employeeImageUrl} />
        },
        {
            title: ORG_UNITS.Project,
            dataIndex: 'projectName',
            key: 'projectName',
            width: 139,
            sorter: createSorter('projectName'),
            render: (projectName: string) => renderWithFallback(projectName)
        },
        {
            title: 'Working Status',
            dataIndex: 'statusName',
            key: 'statusName',
            width: 166,
            sorter: createSorter('statusName'),
            render: (statusName: string) => renderWithFallback(statusName)
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            width: 204,
            sorter: createSorter('notes'),
            render: (notes: string) => renderWithFallback(notes)
        },
        {
            title: 'Position',
            dataIndex: 'positionName',
            key: 'positionName',
            width: 123,
            sorter: createSorter('positionName'),
            render: (positionName: string) => renderWithFallback(positionName)
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
            title: ORG_UNITS.DG,
            dataIndex: 'dgName',
            key: 'dgName',
            width: 129,
            sorter: createSorter('dgName'),
            render: (dgName: string) => renderWithFallback(dgName)
        },
        {
            title: ORG_UNITS.DC,
            dataIndex: 'dcName',
            key: 'dcName',
            width: 137,
            sorter: createSorter('dcName'),
            render: (dcName: string) => renderWithFallback(dcName)
        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 76,
            render: (record: IManagement) => (
                <ButtonsIcon
                    items={[
                        havePermission('Delete') && {
                            icon: icons.tableAction.delete,
                            iconAlt: 'Delete',
                            onClick: () => onShowDeleteModal(record),
                            tooltip: 'Delete'
                        }
                    ].filter(Boolean)}
                />
            )
        }
    ];

    // Showed columns
    const alwaysShowColumnNames = [
        'badgeId',
        'fullName',
        'employeeImageUrl',
        'projectName',
        'statusName',
        'notes',
        'positionName',
        'companyName',
        'dgName',
        'dcName'
    ];
    // Data table
    const [loadingTable, setLoadingTable] = useState(true);
    const [dataTable, setDataTable] = useState<IManagement[]>([]);

    // Effect: Update data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingTable(true);
                const res = await managementListService.searchManagement(searchParams);
                const newDataTable = (res.data as any) || [];

                setDataTable(newDataTable);
            } catch (error) {
                setDataTable([]);
            } finally {
                setLoadingTable(false);
            }
        };

        fetchData();
    }, [searchParams]);
    // #endregion Table

    // List Management
    const navigation = useNavigate();
    const pageTitle = pathnames.hrManagement.managementList.main.name;
    const breadcrumb: IDataBreadcrumb[] = [{ title: pathnames.hrManagement.main.name }, { title: pathnames.hrManagement.managementList.main.name }];
    const buttons: ButtonProps[] = [
        havePermission('Add') && {
            type: 'primary',
            onClick: () => navigation(pathnames.hrManagement.managementList.add.path),
            children: 'Add New Management'
        }
    ].filter(Boolean);

    const quickFilter: IListManagementQuickFilter = {
        service: {
            getAll: managementListService.getAllQuickFilter,
            create: managementListService.createQuickFilter,
            delete: managementListService.deleteQuickFilter,
            update: managementListService.updateQuickFilter
        }
    };

    const { handlePageChange, setSearchByKeyword, showedColumns, updateShowedColumns } = useDataTableControls(
        'managementList',
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
                managementList: {
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
              const typedKey = key as keyof IManagementState;
              return searchParams[typedKey] != null;
          })
        : false;

    const moreButtons = [
        havePermission('Export') && {
            name: 'exportFile',
            children: 'Export',
            fileName: 'Management.xlsx',
            service: employeeService.exportEmployees,
            onExport: (data: IEmployee[]) => ({
                employeeIds: data.map((item: IEmployee) => item.employeeId.toString())
            })
        }
    ].filter(Boolean);

    const filter: IListManagementFilter<IManagement> = {
        isShowFilter,
        data: filterData,
        form: filterForm,
        value: searchParams,
        loading: loadingFilter,
        searchInput: {
            value: keyword,
            placeholder: keywordPlaceholder,
            onChange: setKeyword
        },
        moreButtons,
        onChangeData: setFilterData,
        onFilter: value => {
            setSearchParams(value);
        }
    };

    const table: IListManagementTable<IManagement> = {
        data: dataTable,
        loading: loadingTable,
        tableHeader: <TableNote />,
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
        className: 'min-h-466'
    };

    return (
        <>
            <ListManagement pageTitle={pageTitle} buttons={buttons} breadcrumb={breadcrumb} quickFilter={quickFilter} filter={filter} table={table} />
            <DialogCommon
                open={isShowDeleteModal}
                onClose={onCloseDeleteModal}
                icon={icons.dialog.delete}
                title={deleteModalTitle}
                content={deleteModalContent}
                buttonType="default-danger"
                buttonLeftClick={onCloseDeleteModal}
                buttonRight="Remove"
                buttonRightClick={onDeleteEmployee}
            />
        </>
    );
};

export default ManagementListPage;
