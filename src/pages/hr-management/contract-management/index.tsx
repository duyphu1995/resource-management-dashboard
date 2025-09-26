import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import InputCommon from '@/components/common/form/input';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import ListManagement from '@/components/common/list-management';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderBooleanStatus, renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableNote from '@/components/common/table/table-note';
import pathnames from '@/pathnames';
import { searchParamsActions, selectSearchParams } from '@/redux/search-params-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import contractService from '@/services/hr-management/contract-management';
import { IFilterData } from '@/types/filter';
import { IContractManagementState } from '@/types/filter-redux';
import { IContract } from '@/types/hr-management/contract-management';
import { IListManagementFilter, IListManagementQuickFilter, IListManagementTable } from '@/types/list-management';
import { formatTimeMonthDayYear, generateReduxSearchParams, processFilterParams, remapUnits } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useCancelableRequest from '@/utils/hook/useCancelableRequest';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { createSorter } from '@/utils/table';
import { ButtonProps, Checkbox, Form } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ContractManagementPage = () => {
    const [filterForm] = Form.useForm();
    const navigation = useNavigate();
    const { showNotification } = useNotify();
    const getSignal = useCancelableRequest();
    const dispatch = useAppDispatch();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    // Filter: Show active contract
    const filterParamsFromReduxActive = selectSearchParamsRedux.contractManagementActive.filter;
    const searchByKeywordFromReduxActive = selectSearchParamsRedux.contractManagementActive.searchByKeyword;
    const paginationTableFromReduxActive = selectSearchParamsRedux.contractManagementActive.paginationTable;
    // Filter: Show deleted contract
    const filterParamsFromReduxDeleted = selectSearchParamsRedux.contractManagementDeleted.filter;
    const searchByKeywordFromReduxDeleted = selectSearchParamsRedux.contractManagementDeleted.searchByKeyword;
    const paginationTableFromReduxDeleted = selectSearchParamsRedux.contractManagementDeleted.paginationTable;

    // Permission
    const { havePermission } = usePermissions('ContractManagementList', 'ContractManagement');

    // #region Filter
    // Filter: Show deleted contract
    const [isDeleted, setIsShowDeleted] = useState(filterParamsFromReduxActive?.isDeleted || false);
    const filterSegmentedOptions = [
        {
            value: false,
            label: 'Show Active Contracts'
        },
        {
            value: true,
            label: 'Show Deleted Contracts'
        }
    ];

    // Filter data
    const [keyword, setKeyword] = useState((isDeleted ? searchByKeywordFromReduxDeleted : searchByKeywordFromReduxActive) || '');
    const [filterData, setFilterData] = useState<IFilterData[]>([]);
    const [isLoadingFilter, setIsLoadingFilter] = useState(true);
    const [searchParams, setSearchParams] = useState(isDeleted ? filterParamsFromReduxDeleted : filterParamsFromReduxActive);
    const enabledSearch = ['badgeId', 'fullName', 'workEmail'];
    const keywordPlaceholder = 'Search by Badge ID, Full Name, Work Email';

    // Effect: Update filter data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingFilter(true);
            const res = await contractService.getAllIndexes();
            const contractIndexes = res.data;

            const companyOptions = contractIndexes?.companies?.map(item => ({
                label: item.companyName,
                value: item.companyId.toString()
            }));
            const unitData = remapUnits(contractIndexes?.units);
            const contractTypeOptions = contractIndexes?.contractTypes?.map(item => ({
                label: item.contractTypeName,
                value: item.contractTypeId.toString()
            }));
            const nonTechnicalOptions = contractIndexes?.nonTechnicalValues?.map(item => ({
                label: item === '0' ? 'No' : 'Yes',
                value: item
            }));
            const positionOptions = contractIndexes?.positions?.map(item => ({
                label: item.positionName,
                value: item.positionId.toString()
            }));
            const renewApprovalStatusOptions = contractIndexes?.renewApprovals?.map(item => ({
                label: item.renewApprovalStatusName,
                value: item.renewApprovalStatusId.toString()
            }));

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
                    key: 'contractTypeIds',
                    forColumns: ['contractTypeName'],
                    label: 'Contract Type',
                    alwaysShow: true,
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={contractTypeOptions || []}
                            placeholder="Select contract type"
                            searchPlaceholder="Search contract type"
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
                    forColumns: ['EndDate'],
                    label: 'End Date',
                    alwaysShow: true,
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromEndDate" toName="toEndDate" />
                },
                {
                    key: 'signOrder',
                    forColumns: ['signOrder'],
                    label: 'Sign Order',
                    alwaysShow: true,
                    control: <InputCommon type="number" min={1} size="small" placeholder="Enter sign order" typeInput="numbers-only" />
                },
                {
                    key: 'renewApprovalStatusIds',
                    forColumns: ['renewApprovalStatusName'],
                    label: 'Renew Approval',
                    alwaysShow: true,
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={renewApprovalStatusOptions || []}
                            placeholder="Select renew approval"
                            searchPlaceholder="Search renew approval"
                        />
                    )
                },
                {
                    key: 'nonTechnicalValues',
                    forColumns: ['nonTechnicalValues'],
                    label: 'Non - Technical',
                    alwaysShow: true,
                    control: <Checkbox.Group options={nonTechnicalOptions} />
                }
            ];

            setFilterData(newFilterData);
            setIsLoadingFilter(false);
        };

        fetchData();
    }, []);
    // #endregion Filter

    // #region Delete Contract
    // Delete contract
    const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
    const [deletedData, setDeletedData] = useState<IContract | null>(null);
    const deleteModalContent = (
        <>
            The contract of&nbsp;
            <strong>
                {deletedData?.fullName} - {deletedData?.badgeId}
            </strong>
            &nbsp;will be deleted. Are you sure you want to delete it?
        </>
    );

    const onShowDeleteModal = (deletedData: IContract) => {
        setIsShowDeleteModal(true);
        setDeletedData(deletedData);
    };
    const onCloseDeleteModal = () => setIsShowDeleteModal(false);

    // Handle delete contract
    const onDeleteContract = async () => {
        const res = await contractService.deleteContract(deletedData?.contractId || 0);
        const { succeeded, message } = res;
        showNotification(succeeded, message);

        // Close modal and reload data table
        setIsShowDeleteModal(false);
        setSearchParams({ ...searchParams });
    };
    // #endregion

    // #region Restore Contract
    // Restore contract
    const [isShowRestoreModal, setIsShowRestoreModal] = useState(false);
    const [restoredData, setRestoredData] = useState<IContract | null>(null);
    const restoreModalContent = (
        <>
            The contract of&nbsp;
            <strong>
                {restoredData?.fullName} - {restoredData?.badgeId}
            </strong>
            &nbsp;will be restored. Are you sure you want to restore it?
        </>
    );

    const onShowRestoreModal = (restoredData: IContract) => {
        setIsShowRestoreModal(true);
        setRestoredData(restoredData);
    };
    const onCloseRestoreModal = () => setIsShowRestoreModal(false);

    // Restore failed
    const [isShowRestoreFailedModal, setIsShowRestoreFailedModal] = useState(false);
    const [restoreFailedMessage, setRestoreFailedMessage] = useState('');
    const restoreFailedModalContent = <>{restoreFailedMessage}</>;

    const onShowRestoreFailedModal = (message: string = '') => {
        setRestoreFailedMessage(message);
        setIsShowRestoreFailedModal(true);
    };
    const onCloseRestoreFailedModal = () => setIsShowRestoreFailedModal(false);

    // Handle Restore contract
    const onRestoreContract = async () => {
        const res = await contractService.restoreContract(restoredData?.contractId || 0);
        const { succeeded, message } = res;

        // Successfully => show notification and reload data table
        if (succeeded) {
            setSearchParams({ ...searchParams });
        } else {
            // Failed
            // If contract is active => show failed modal
            // Else show notification
            if (res.status === 400) onShowRestoreFailedModal(res.message);
        }
        showNotification(succeeded, message);

        // Close modal and reload data table
        setIsShowRestoreModal(false);
    };
    // #endregion

    // #region DataTable

    // Table columns
    const openLabourContract = (record: IContract) => window.open(pathnames.hrManagement.contractManagement.print.path + '/' + record.contractId);
    const openLiquidationContract = (record: IContract) =>
        window.open(pathnames.hrManagement.contractManagement.printLiquidation.path + '/' + record.contractId);

    const tableColumns: ColumnsType<IContract> = [
        {
            title: 'Badge ID',
            dataIndex: 'badgeId',
            key: 'badgeId',
            fixed: 'left',
            width: 109,
            sorter: createSorter('badgeId'),
            render: badgeId => renderWithFallback(badgeId)
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
                    to={pathnames.hrManagement.contractManagement.detail.path + '/' + record.contractId}
                    style={{ color: record.statusColor }}
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
            width: 183,
            sorter: createSorter('workEmail'),
            render: workEmail => renderWithFallback(workEmail)
        },
        {
            title: 'Contract Type',
            dataIndex: 'contractTypeName',
            key: 'contractTypeName',
            width: 172,
            sorter: createSorter('contractTypeName'),
            render: contractTypeName => renderWithFallback(contractTypeName)
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            width: 126,
            sorter: createSorter('startDate', 'date'),
            render: startDate => renderWithFallback(formatTimeMonthDayYear(startDate))
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 126,
            sorter: createSorter('endDate', 'date'),
            render: endDate => renderWithFallback(formatTimeMonthDayYear(endDate))
        },
        {
            title: 'Sign Order',
            dataIndex: 'signOrder',
            key: 'signOrder',
            width: 125,
            sorter: createSorter('signOrder', 'number'),
            render: signOrder => renderWithFallback(signOrder)
        },
        {
            title: 'Company',
            dataIndex: 'companyName',
            key: 'companyName',
            width: 185,
            sorter: createSorter('companyName'),
            render: (item: string) => renderWithFallback(item, true)
        },
        {
            title: ORG_UNITS.DG,
            dataIndex: 'dgName',
            key: 'dgName',
            width: 129,
            sorter: createSorter('dgName'),
            render: dgName => renderWithFallback(dgName)
        },
        {
            title: ORG_UNITS.DC,
            dataIndex: 'dcName',
            key: 'dcName',
            width: 137,
            sorter: createSorter('dcName'),
            render: dcName => renderWithFallback(dcName)
        },
        {
            title: ORG_UNITS.Project,
            dataIndex: 'projectName',
            key: 'projectName',
            width: 139,
            sorter: createSorter('projectName'),
            render: projectName => renderWithFallback(projectName)
        },
        {
            title: 'Position',
            dataIndex: 'positionName',
            key: 'positionName',
            width: 123,
            sorter: createSorter('positionName'),
            render: positionName => renderWithFallback(positionName)
        },
        {
            title: 'Note',
            dataIndex: 'comment',
            key: 'comment',
            width: 125,
            sorter: createSorter('comment'),
            render: comment => renderWithFallback(comment, true, 20)
        },
        {
            title: 'Renew Approval',
            dataIndex: 'renewApprovalStatusName',
            key: 'renewApprovalStatusName',
            width: 155,
            sorter: createSorter('renewApprovalStatusName'),
            render: renewApprovalStatusName => renderWithFallback(renewApprovalStatusName)
        },
        {
            title: 'Non - Technical',
            dataIndex: 'isNonTechnical',
            key: 'isNonTechnical',
            width: 145,
            align: 'center',
            sorter: createSorter('isNonTechnical', 'boolean'),
            render: isNonTechnical => renderBooleanStatus(isNonTechnical, 'isNonTechnical')
        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: isDeleted ? 76 : 88,
            render: (record: IContract) =>
                isDeleted ? (
                    <ButtonsIcon
                        items={[
                            {
                                icon: icons.tableAction.restore,
                                tooltip: 'Restore',
                                onClick: () => onShowRestoreModal(record)
                            }
                        ]}
                    />
                ) : (
                    <ButtonsIcon
                        items={[
                            ...(havePermission('Print')
                                ? [
                                      {
                                          icon: icons.tableAction.print,
                                          iconAlt: pathnames.hrManagement.contractManagement.print.name,
                                          // If there is endDate then print labour contract
                                          ...(!record.endDate
                                              ? {
                                                    tooltip: pathnames.hrManagement.contractManagement.print.name
                                                }
                                              : // Else show contract options
                                                {
                                                    menu: {
                                                        items: [
                                                            {
                                                                key: pathnames.hrManagement.contractManagement.print.name,
                                                                label: pathnames.hrManagement.contractManagement.print.name,
                                                                onClick: () => openLabourContract(record)
                                                            },
                                                            {
                                                                key: pathnames.hrManagement.contractManagement.printLiquidation.name,
                                                                label: pathnames.hrManagement.contractManagement.printLiquidation.name,
                                                                onClick: () => openLiquidationContract(record)
                                                            }
                                                        ]
                                                    }
                                                }),
                                          // Else then navigation to print page
                                          onClick: () => !record.endDate && openLabourContract(record)
                                      }
                                  ]
                                : []),
                            ...(havePermission('Delete')
                                ? [
                                      {
                                          icon: icons.tableAction.delete,
                                          tooltip: 'Delete',
                                          onClick: () => onShowDeleteModal(record)
                                      }
                                  ]
                                : [])
                        ]}
                    />
                )
        }
    ];

    // Showed columns
    const alwaysShowColumnNames = [
        'badgeId',
        'fullName',
        'workEmail',
        'contractTypeName',
        'startDate',
        'endDate',
        'signOrder',
        'companyName',
        'dgName',
        'dcName',
        'projectName',
        'positionName',
        'comment',
        'renewApprovalStatusName',
        'isNonTechnical'
    ];

    // Data table
    const [isLoadingTable, setIsLoadingTable] = useState(true);
    const [dataTable, setDataTable] = useState<IContract[]>([]);

    // Effect: Update data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingTable(true);
            const signal = getSignal();

            try {
                const res = await contractService.searchContract({ ...searchParams, isDeleted }, signal);
                const newDataTable = res.data || [];

                setDataTable(newDataTable);
            } catch (error) {
                setDataTable([]);
            } finally {
                if (!signal.aborted) {
                    setIsLoadingTable(false);
                }
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, isDeleted]);
    // #endregion Table

    // #region ListManagement
    const pageTitle = pathnames.hrManagement.contractManagement.main.name;
    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.hrManagement.main.name },
        { title: pathnames.hrManagement.contractManagement.main.name }
    ];
    const buttons: ButtonProps[] = havePermission('Add') && [
        {
            type: 'primary',
            onClick: () => navigation(pathnames.hrManagement.contractManagement.add.path),
            children: pathnames.hrManagement.contractManagement.add.name
        }
    ];

    const quickFilter: IListManagementQuickFilter = {
        service: {
            getAll: contractService.getAllQuickFilter,
            create: contractService.createQuickFilter,
            delete: contractService.deleteQuickFilter,
            update: contractService.updateQuickFilter
        }
    };

    const { handlePageChange, setSearchByKeyword, showedColumns, updateShowedColumns } = useDataTableControls(
        isDeleted ? 'contractManagementDeleted' : 'contractManagementActive',
        alwaysShowColumnNames,
        tableColumns,
        enabledSearch
    );

    useEffect(() => {
        setSearchByKeyword(keyword);
    }, [keyword, setSearchByKeyword]);

    useEffect(() => {
        const dataReduxSearchParams = generateReduxSearchParams(filterData, filterForm);
        const updatedParams = {
            contractManagementDeleted: {
                filter: {
                    ...(isDeleted ? dataReduxSearchParams : filterParamsFromReduxDeleted),
                    isDeleted
                }
            },
            contractManagementActive: {
                filter: {
                    ...(isDeleted ? filterParamsFromReduxActive : dataReduxSearchParams),
                    isDeleted
                }
            }
        };

        dispatch(searchParamsActions.setFilterParamsRedux(updatedParams));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, dispatch, isDeleted, filterData, filterForm]);

    useEffect(() => {
        let processedParams = {};
        isDeleted
            ? (processedParams = processFilterParams(filterParamsFromReduxDeleted ?? {}))
            : (processedParams = processFilterParams(filterParamsFromReduxActive ?? {}));

        // Set the processed values in the form
        filterForm.setFieldsValue(processedParams);
    }, [filterForm, isDeleted, filterParamsFromReduxDeleted, filterParamsFromReduxActive]);

    const isShowFilter = searchParams
        ? Object.keys(searchParams).some(key => {
              const typedKey = key as keyof IContractManagementState;
              return typedKey !== 'isDeleted' && searchParams[typedKey] != null;
          })
        : false;

    const filter: IListManagementFilter<IContract> = {
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
            name: 'isDeleted',
            options: filterSegmentedOptions,
            value: isDeleted,
            onChange: value => {
                filterForm.resetFields();
                value
                    ? dispatch(searchParamsActions.resetPaginationParamsRedux('contractManagementDeleted'))
                    : dispatch(searchParamsActions.resetPaginationParamsRedux('contractManagementActive'));
                setIsShowDeleted(value);
                setSearchParams(value ? filterParamsFromReduxDeleted : filterParamsFromReduxActive);
            }
        },
        moreButtons: [
            havePermission('Export') && {
                name: 'exportFile',
                children: 'Export',
                fileName: 'Contract List.xlsx',
                service: contractService.exportContracts,
                onExport: (data: IContract[]) => ({ contractIds: data.map(item => item.contractId.toString()) })
            }
        ].filter(Boolean),
        onChangeData: setFilterData,
        onFilter: value => {
            setSearchParams(value);
        }
    };

    const getPaginationData = (isDeleted: boolean) => {
        const paginationData = isDeleted ? paginationTableFromReduxDeleted : paginationTableFromReduxActive;
        return {
            currentPage: paginationData?.currentPage || 1,
            pageSize: paginationData?.pageSize || 10
        };
    };

    const table: IListManagementTable<IContract> = {
        data: dataTable,
        loading: isLoadingTable,
        tableHeader: <TableNote />,
        columns: tableColumns,
        showedColumns: {
            data: showedColumns,
            onChange: updateShowedColumns
        },
        className: 'min-h-466',
        paginationTable: {
            ...getPaginationData(isDeleted),
            onChange: handlePageChange
        }
    };
    //#endregion ListManagement

    return (
        <>
            <ListManagement pageTitle={pageTitle} buttons={buttons} breadcrumb={breadcrumb} quickFilter={quickFilter} filter={filter} table={table} />

            {/* DIALOG */}
            <DialogCommon
                open={isShowRestoreModal}
                onClose={onCloseRestoreModal}
                icon={icons.dialog.info}
                title="Restore Contract"
                content={restoreModalContent}
                buttonType="default-primary"
                buttonLeftClick={onCloseRestoreModal}
                buttonRight="Yes, restore"
                buttonRightClick={onRestoreContract}
            />
            <DialogCommon
                open={isShowRestoreFailedModal}
                onClose={onCloseRestoreFailedModal}
                icon={icons.dialog.warning}
                title="Can't Restore Contract"
                content={restoreFailedModalContent}
                buttonType="default-primary"
                hiddenButtonLeft={true}
                buttonRight="Close"
                buttonRightClick={onCloseRestoreFailedModal}
            />
            <DialogCommon
                open={isShowDeleteModal}
                onClose={onCloseDeleteModal}
                icon={icons.dialog.delete}
                title="Delete Contract"
                content={deleteModalContent}
                buttonType="default-danger"
                buttonLeftClick={onCloseDeleteModal}
                buttonRightClick={onDeleteContract}
            />
        </>
    );
};

export default ContractManagementPage;
