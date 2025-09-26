import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import ListManagement from '@/components/common/list-management';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import { initializeShowedColumns } from '@/components/common/list-management/filter/use-filter';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableNote from '@/components/common/table/table-note';
import pathnames from '@/pathnames';
import { searchParamsActions, selectSearchParams } from '@/redux/search-params-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import resignationService from '@/services/hr-management/resignation-management';
import { IFilterData } from '@/types/filter';
import { IResignationManagementState } from '@/types/filter-redux';
import { IResignation } from '@/types/hr-management/resignation-management';
import { IListManagementFilter, IListManagementQuickFilter, IListManagementTable } from '@/types/list-management';
import { formatTimeMonthDayYear, generateReduxSearchParams, processFilterParams, remapUnits } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useCancelableRequest from '@/utils/hook/useCancelableRequest';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { createSorter } from '@/utils/table';
import { ButtonProps, Form } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './index.scss';

const ResignationManagementPage = () => {
    const [filterForm] = Form.useForm();
    const navigation = useNavigate();
    const { showNotification } = useNotify();
    const getSignal = useCancelableRequest();
    const dispatch = useAppDispatch();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    // Filter: Show pending and resigned
    const filterParamsFromReduxResigned = selectSearchParamsRedux.resignationManagementResigned.filter;
    const searchByKeywordFromReduxResigned = selectSearchParamsRedux.resignationManagementResigned.searchByKeyword;
    const paginationTableFromReduxResigned = selectSearchParamsRedux.resignationManagementResigned.paginationTable;
    // Filter: Show cancelled resignation
    const filterParamsFromReduxCancelled = selectSearchParamsRedux.resignationManagementCancelled.filter;
    const searchByKeywordFromReduxCancelled = selectSearchParamsRedux.resignationManagementCancelled.searchByKeyword;
    const paginationTableFromReduxCancelled = selectSearchParamsRedux.resignationManagementCancelled.paginationTable;

    const { havePermission } = usePermissions('ResignationManagementList', 'ResignationManagement');

    // #region Filter
    // Filter: Show working resignation or broken commitment
    const [isCancelled, setIsCancelled] = useState(filterParamsFromReduxResigned?.isCancelled || false);
    const filterSegmentedOptions = [
        {
            label: 'Pending And Resigned',
            value: false
        },
        {
            label: 'Cancelled',
            value: true
        }
    ];

    // Filter data
    const [keyword, setKeyword] = useState((isCancelled ? searchByKeywordFromReduxCancelled : searchByKeywordFromReduxResigned) || '');
    const [filterData, setFilterData] = useState<IFilterData[]>([]);
    const [isLoadingFilter, setIsLoadingFilter] = useState(true);
    const [searchParams, setSearchParams] = useState(isCancelled ? filterParamsFromReduxCancelled : filterParamsFromReduxResigned);
    const enabledSearch = ['badgeId', 'fullName', 'workEmail'];
    const keywordPlaceholder = 'Search by Badge ID, Full Name, Work Email';

    // Effect: Update filter data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingFilter(true);
            const res = await resignationService.getAllIndexes();
            const allIndexes = res.data;

            if (allIndexes) {
                const companyOptions = allIndexes?.companies?.map(company => ({
                    label: company.companyName,
                    value: company.companyId.toString()
                }));
                const unitData = remapUnits(allIndexes?.units);
                const positionOptions = allIndexes?.positions?.map(position => ({
                    label: position.positionName,
                    value: position.positionId.toString()
                }));
                const statusOptions = allIndexes?.resignationStatuses
                    ?.filter(item => item.statusName !== 'Cancelled')
                    ?.map(status => ({
                        label: status.statusName,
                        value: status.statusId.toString()
                    }));
                const reasonOptions = allIndexes?.reasonForLeave?.map(status => ({
                    label: status.reasonName,
                    value: status.reasonId.toString()
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
                            <TreeSelect
                                multiple
                                size="small"
                                treeData={unitData || []}
                                placeholder="Select project"
                                searchPlaceholder="Search project"
                            />
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
                    ...(!isCancelled
                        ? [
                              {
                                  key: 'resignationStatusIds',
                                  forColumns: ['resignationStatusName'],
                                  label: 'Resignation Status',
                                  alwaysShow: true,
                                  control: (
                                      <BaseSelect
                                          mode="multiple"
                                          size="small"
                                          options={statusOptions || []}
                                          placeholder="Select resignation status"
                                          searchPlaceholder="Search resignation status"
                                      />
                                  )
                              }
                          ]
                        : []),
                    {
                        key: 'applyDate',
                        forColumns: ['applyDate'],
                        label: 'Apply Date',
                        alwaysShow: true,
                        colSpan: 12,
                        control: <FilterDateRange fromName="fromApplyDate" toName="toApplyDate" />
                    },
                    {
                        key: isCancelled ? 'cancelledDate' : 'resignDate',
                        forColumns: [isCancelled ? 'cancelledDate' : 'resignDate'],
                        label: isCancelled ? 'Cancel Date' : 'Resign Date',
                        alwaysShow: true,
                        colSpan: 12,
                        control: (
                            <FilterDateRange
                                fromName={isCancelled ? 'fromCancelledDate' : 'fromResignDate'}
                                toName={isCancelled ? 'toCancelledDate' : 'toResignDate'}
                            />
                        )
                    },
                    {
                        key: 'reasonForLeaveIds',
                        forColumns: ['reasonForLeaveName'],
                        label: 'Reason',
                        alwaysShow: true,
                        control: (
                            <BaseSelect
                                mode="multiple"
                                size="small"
                                options={reasonOptions || []}
                                placeholder="Select reason"
                                searchPlaceholder="Search reason"
                            />
                        )
                    }
                ];

                setFilterData(newFilterData);
            }

            setIsLoadingFilter(false);
        };

        fetchData();
    }, [isCancelled]);
    // #endregion Filter

    // #region Undo resignation
    const undoModalTitle = 'Undo Resignation';
    const [isShowUndoModal, setIsShowUndoModal] = useState(false);
    const [undoData, setUndoData] = useState<IResignation | null>(null);
    const undoModalContent = (
        <>
            <div>
                You're about to undo the resignation record of
                <br />
                <strong>
                    {undoData?.fullName} - {undoData?.badgeId}.
                </strong>
            </div>
            <div style={{ marginTop: 4 }}>
                This person still remain as an official employee and the
                <br />
                record will be removed from the list. Are you sure to undo it?
            </div>
        </>
    );

    const onShowUndoModal = (undoData: IResignation) => {
        setIsShowUndoModal(true);
        setUndoData(undoData);
    };

    const onUndoResignation = async () => {
        const res = await resignationService.undo(undoData?.resignationFormId);
        const { succeeded, message } = res;

        succeeded && setSearchParams({ ...searchParams });
        showNotification(succeeded, message);
        setIsShowUndoModal(false);
    };
    // #endregion Undo resignation

    // #region Send email
    const emailSendingModalTitle = 'Send Notification Email';
    const [isShowEmailSendingModal, setIsShowEmailSendingModal] = useState(false);
    const [emailData, setEmailData] = useState<IResignation | null>(null);
    const emailSendingModalContent = (
        <div style={{ maxWidth: 375, margin: 'auto' }}>Notification email will be sent to departments. Do you want to continue?</div>
    );

    const onShowEmailSendingModal = (emailData: IResignation) => {
        setIsShowEmailSendingModal(true);
        setEmailData(emailData);
    };

    const onSendEmail = async () => {
        const res = await resignationService.sendMail(emailData?.resignationFormId);
        const { succeeded, message } = res;

        succeeded && setSearchParams({ ...searchParams });
        showNotification(succeeded, message);
        setIsShowEmailSendingModal(false);
    };
    // #endregion Send email

    // #region Print
    const [printData, setPrintData] = useState<IResignation | null>(null);
    const [isShowPrintWarningModal, setIsShowPrintWarningModal] = useState(false);
    const printWarningModalTitle = 'Need To Update';
    const printWarningModalContent = (
        <>
            The resignation form of <strong>{printData?.fullName}</strong> can't be printed because Resignation Type is empty. You need to update
            Resignation Type on Resignation Details before printing.
        </>
    );

    const onClosePrintWarningModal = () => setIsShowPrintWarningModal(false);
    const onShowPrintWarningModal = (resignation: IResignation) => {
        setIsShowPrintWarningModal(true);
        setPrintData(resignation);
    };

    const onPrint = (resignation: IResignation) => {
        if (resignation.resignationTypeName)
            window.open(pathnames.hrManagement.resignationManagement.print.path + '/' + resignation.resignationFormId);
        else onShowPrintWarningModal(resignation);
    };
    // #endregion Print

    // #region Table
    const tableColumns: ColumnsType<IResignation> = [
        {
            dataIndex: 'badgeId',
            title: 'Badge ID',
            key: 'badgeId',
            fixed: 'left',
            width: 109,
            sorter: createSorter('badgeId'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fullName',
            title: 'Full Name',
            key: 'fullName',
            fixed: 'left',
            width: 300,
            sorter: createSorter('fullName'),
            render: (item: string, record: IResignation) =>
                renderWithFallback(
                    <Link
                        to={`${pathnames.hrManagement.resignationManagement.detail.path}/${record.resignationFormId}`}
                        style={{
                            display: 'flex',
                            gap: 4,
                            color: record.resignationStatusColor || '#323232'
                        }}
                        className="full-name"
                    >
                        <div>{item}</div>
                        {record.isCommitmentBound && <img src="/media/icons/broken-commitment-red.svg" />}
                    </Link>
                )
        },
        {
            dataIndex: 'workEmail',
            title: 'Work Email',
            key: 'workEmail',
            width: 183,
            sorter: createSorter('workEmail'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'projectName',
            title: ORG_UNITS.Project,
            key: 'projectName',
            width: 180,
            sorter: createSorter('projectName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcName',
            title: ORG_UNITS.DC,
            key: 'dcName',
            width: 137,
            sorter: createSorter('dcName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dgName',
            title: ORG_UNITS.DG,
            key: 'dgName',
            width: 129,
            sorter: createSorter('dgName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'positionName',
            title: 'Position',
            key: 'positionName',
            width: 200,
            sorter: createSorter('positionName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'grade',
            title: 'Grade',
            key: 'grade',
            width: 95,
            sorter: createSorter('grade', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'resignationStatusName',
            title: 'Resignation Status',
            key: 'resignationStatusName',
            width: 174,
            sorter: createSorter('resignationStatusName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'reasonName',
            title: 'Reason',
            key: 'reasonName',
            width: 279,
            sorter: createSorter('reasonName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'applyDate',
            title: 'Apply Date',
            key: 'applyDate',
            width: 158,
            sorter: createSorter('applyDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'resignDate',
            title: 'Resign Date',
            key: 'resignDate',
            width: 158,
            sorter: createSorter('resignDate', 'date'),
            render: (item: IResignation) => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'cancelledDate',
            title: 'Cancel Date',
            key: 'cancelledDate',
            width: 158,
            sorter: createSorter('cancelledDate', 'date'),
            render: (item: IResignation) => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'notes',
            title: 'Note',
            key: 'notes',
            width: 283,
            sorter: createSorter('notes'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'beforeWorkExp',
            title: 'Exp. Before TMA',
            key: 'beforeWorkExp',
            width: 160,
            sorter: createSorter('beforeWorkExp', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'currentWorkExp',
            title: 'TMA Exp.',
            key: 'currentWorkExp',
            width: 110,
            sorter: createSorter('currentWorkExp', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'totalWorkExp',
            title: 'Total Exp.',
            key: 'totalWorkExp',
            width: 110,
            sorter: createSorter('totalWorkExp', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'paMark',
            title: 'PA Mark',
            key: 'paMark',
            width: 104,
            sorter: createSorter('paMark', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'personalEmail',
            title: 'Personal Email',
            key: 'personalEmail',
            width: 183,
            sorter: createSorter('personalEmail'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'mobilePhone',
            title: 'Mobile Phone',
            key: 'mobilePhone',
            width: 123,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'companyName',
            title: 'Company',
            key: 'companyName',
            width: 200,
            sorter: createSorter('companyName'),
            render: (item: string) => renderWithFallback(item, true)
        },
        ...(!isCancelled
            ? [
                  {
                      title: 'Action',
                      key: 'action',
                      fixed: 'right' as const,
                      width: 88,
                      render: (record: IResignation) => (
                          <ButtonsIcon
                              items={[
                                  ...(record.resignationStatusName === 'Pending'
                                      ? [
                                            ...(havePermission('Print')
                                                ? [
                                                      {
                                                          icon: icons.tableAction.print,
                                                          tooltip: 'Print',
                                                          onClick: () => onPrint(record)
                                                      }
                                                  ]
                                                : []),

                                            ...(havePermission('Undo')
                                                ? [
                                                      {
                                                          icon: icons.tableAction.restore,
                                                          tooltip: 'Undo',
                                                          onClick: () => onShowUndoModal(record)
                                                      }
                                                  ]
                                                : [])
                                        ]
                                      : [
                                            !record.isSentResignationEmail && havePermission('SendMail')
                                                ? {
                                                      icon: icons.tableAction.sendEmail,
                                                      tooltip: 'Send notification email',
                                                      onClick: () => onShowEmailSendingModal(record)
                                                  }
                                                : undefined,
                                            undefined
                                        ])
                              ]}
                          />
                      )
                  }
              ]
            : [])
    ];

    const tableNote = () => {
        const data = isCancelled
            ? [
                  { title: 'Full Time', color: '#1E6D98' },
                  { title: 'Part Time', color: '#01BAD3' },
                  { title: 'Onsite', color: '#E66F00' },
                  { title: 'Leave Without Pay', color: '#54C5B5' },
                  { title: 'Maternity Leave', color: '#00A811' }
              ]
            : [
                  { title: 'Pending Resignation', color: '#88592B' },
                  { title: 'Resigned', color: '#323232' }
              ];

        return <TableNote data={data} />;
    };

    // Showed columns
    const initialShowColumnNames = [
        'badgeId',
        'fullName',
        'projectName',
        'dcName',
        'dgName',
        'positionName',
        'grade',
        'resignationStatusName',
        'reasonName',
        'applyDate',
        isCancelled ? 'cancelledDate' : 'resignDate',
        'notes',
        'beforeWorkExp',
        'currentWorkExp',
        'totalWorkExp',
        'paMark',
        'personalEmail',
        'workEmail',
        'mobilePhone',
        'companyName'
    ];

    // Data table
    const [isLoadingTable, setIsLoadingTable] = useState(true);
    const [dataTable, setDataTable] = useState<IResignation[]>([]);

    // Effect: Update data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingTable(true);
            const signal = getSignal();

            try {
                const res = await resignationService.search({ ...searchParams, isCancelled }, signal);
                const newDataTable = res.data || [];

                setDataTable(newDataTable);
            } catch (error) {
                setDataTable([]);
            }
            if (!signal.aborted) {
                setIsLoadingTable(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, isCancelled]);
    // #endregion Table

    // #region ListManagement
    const pageTitle = pathnames.hrManagement.resignationManagement.main.name;
    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.hrManagement.main.name },
        { title: pathnames.hrManagement.resignationManagement.main.name }
    ];
    const buttons: ButtonProps[] = havePermission('Add') && [
        {
            type: 'primary',
            children: pathnames.hrManagement.resignationManagement.add.name,
            onClick: () => navigation(pathnames.hrManagement.resignationManagement.add.path)
        }
    ];

    const updateFilterDataBySegmentedValue = (segmentedValue: boolean) => {
        if (segmentedValue !== isCancelled) {
            const indexResignDateColumn = initialShowColumnNames.findIndex(item => item === 'resignDate');
            const indexCancelledDateColumn = initialShowColumnNames.findIndex(item => item === 'cancelledDate');
            const newShowedColumns = [...initialShowColumnNames];

            if (segmentedValue) {
                newShowedColumns[indexResignDateColumn] = 'cancelledDate';
            } else {
                newShowedColumns[indexCancelledDateColumn] = 'resignDate';
            }

            updateShowedColumns(initializeShowedColumns(newShowedColumns, tableColumns, enabledSearch));
        }

        return filterData;
    };

    const quickFilter: IListManagementQuickFilter = {
        service: {
            getAll: resignationService.getAllQuickFilter,
            create: resignationService.createQuickFilter,
            update: resignationService.updateQuickFilter,
            delete: resignationService.deleteQuickFilter
        },
        onChange: (_, segmentedValue: boolean) => updateFilterDataBySegmentedValue(segmentedValue)
    };

    const { handlePageChange, setSearchByKeyword, showedColumns, updateShowedColumns } = useDataTableControls(
        isCancelled ? 'resignationManagementCancelled' : 'resignationManagementResigned',
        initialShowColumnNames,
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
            resignationManagementCancelled: {
                filter: {
                    ...(isCancelled ? dataReduxSearchParams : filterParamsFromReduxCancelled),
                    isCancelled
                }
            },
            resignationManagementResigned: {
                filter: {
                    ...(isCancelled ? filterParamsFromReduxResigned : dataReduxSearchParams),
                    isCancelled
                }
            }
        };

        dispatch(searchParamsActions.setFilterParamsRedux(updatedParams));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, dispatch, isCancelled, filterData, filterForm]);

    useEffect(() => {
        let processedParams = {};
        isCancelled
            ? (processedParams = processFilterParams(filterParamsFromReduxCancelled ?? {}))
            : (processedParams = processFilterParams(filterParamsFromReduxResigned ?? {}));

        // Set the processed values in the form
        filterForm.setFieldsValue(processedParams);
    }, [filterForm, isCancelled, filterParamsFromReduxCancelled, filterParamsFromReduxResigned]);

    const isShowFilter = searchParams
        ? Object.keys(searchParams).some(key => {
              const typedKey = key as keyof IResignationManagementState;
              return typedKey !== 'isCancelled' && searchParams[typedKey] != null;
          })
        : false;

    const filter: IListManagementFilter<IResignation> = {
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
            name: 'isCancelled',
            options: filterSegmentedOptions,
            value: isCancelled,
            onChange: value => {
                filterForm.resetFields();
                value
                    ? dispatch(searchParamsActions.resetPaginationParamsRedux('resignationManagementCancelled'))
                    : dispatch(searchParamsActions.resetPaginationParamsRedux('resignationManagementResigned'));
                setIsCancelled(value);
                setSearchParams(value ? filterParamsFromReduxCancelled : filterParamsFromReduxResigned);
            }
        },
        moreButtons: [
            havePermission('Export') && {
                name: 'exportFile',
                children: 'Export',
                fileName: 'Resignation List.xlsx',
                service: resignationService.export,
                onExport: (data: IResignation[]) => ({
                    resignationFormIds: data.map(item => item.resignationFormId.toString())
                })
            }
        ].filter(Boolean),
        onChangeData: setFilterData,
        onFilter: value => {
            setSearchParams(value);
        },
        isHideShowHideColumnsBtn: true
    };

    const getPaginationData = (isCancelled: boolean) => {
        const paginationData = isCancelled ? paginationTableFromReduxCancelled : paginationTableFromReduxResigned;
        return {
            currentPage: paginationData?.currentPage || 1,
            pageSize: paginationData?.pageSize || 10
        };
    };

    const table: IListManagementTable<IResignation> = {
        data: dataTable,
        loading: isLoadingTable,
        tableHeader: tableNote(),
        columns: tableColumns,
        rowClassName: (record, index) => {
            let className = `${index % 2 === 0 ? 'table-row-dark' : 'table-row-light'}`;
            if (record.isAttrition) className += ' resignation-row-warning';
            return className;
        },
        showedColumns: {
            data: showedColumns,
            onChange: updateShowedColumns
        },
        paginationTable: {
            ...getPaginationData(isCancelled),
            onChange: handlePageChange
        }
    };
    //#endregion ListManagement

    return (
        <>
            <ListManagement pageTitle={pageTitle} buttons={buttons} breadcrumb={breadcrumb} quickFilter={quickFilter} filter={filter} table={table} />
            <DialogCommon
                open={isShowUndoModal}
                onClose={() => setIsShowUndoModal(false)}
                icon={icons.dialog.warning}
                title={undoModalTitle}
                content={undoModalContent}
                buttonType="default-primary"
                buttonLeftClick={() => setIsShowUndoModal(false)}
                buttonRight="Undo"
                buttonRightClick={onUndoResignation}
            />
            <DialogCommon
                open={isShowEmailSendingModal}
                onClose={() => setIsShowEmailSendingModal(false)}
                icon={icons.dialog.info}
                title={emailSendingModalTitle}
                content={emailSendingModalContent}
                buttonType="default-primary"
                buttonLeftClick={() => setIsShowEmailSendingModal(false)}
                buttonRight="Send"
                buttonRightClick={onSendEmail}
            />
            <DialogCommon
                open={isShowPrintWarningModal}
                onClose={onClosePrintWarningModal}
                icon={icons.dialog.warning}
                title={printWarningModalTitle}
                content={printWarningModalContent}
                buttonType="default-primary"
                hiddenButtonLeft={true}
                buttonRight="Close"
                buttonRightClick={onClosePrintWarningModal}
            />
        </>
    );
};

export default ResignationManagementPage;
