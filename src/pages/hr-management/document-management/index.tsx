import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import ListManagement from '@/components/common/list-management';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableNote from '@/components/common/table/table-note';
import pathnames from '@/pathnames';
import { searchParamsActions, selectSearchParams } from '@/redux/search-params-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import documentService from '@/services/hr-management/document-management';
import { IDataBreadcrumb } from '@/types/common';
import { IFilterData } from '@/types/filter';
import { IDocumentManagementState } from '@/types/filter-redux';
import { IDocumentList, IDocumentType } from '@/types/hr-management/document-management';
import { IListManagementFilter, IListManagementQuickFilter, IListManagementTable } from '@/types/list-management';
import { formatTimeMonthDayYear, generateReduxSearchParams, processFilterParams, remapUnits } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { createSorter } from '@/utils/table';
import { Checkbox, Form } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './index.scss';
import usePermissions from '@/utils/hook/usePermissions';
import { IEmployee } from '@/types/hr-management/employee-management';

const DocumentManagement = () => {
    const [filterForm] = Form.useForm();
    const { showNotification } = useNotify();
    const dispatch = useAppDispatch();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    const filterParamsFromRedux = selectSearchParamsRedux.documentManagement.filter;
    const searchByKeywordFromRedux = selectSearchParamsRedux.documentManagement.searchByKeyword;
    const paginationTableFromRedux = selectSearchParamsRedux.documentManagement.paginationTable;

    const [dataTable, setDataTable] = useState<IDocumentList[]>([]);

    // State for handling checkboxes
    const [checkedList, setCheckedList] = useState<number[]>([]);
    const [isIndeterminate, setIsIndeterminate] = useState(false);
    const [isCheckAll, setIsCheckAll] = useState(false);

    // Reminder email
    const [showReminderEmail, setShowReminderEmail] = useState(false);

    // #region Filter
    // Filter data
    const [keyword, setKeyword] = useState(searchByKeywordFromRedux || '');
    const [filterData, setFilterData] = useState<IFilterData[]>([]);
    const [isLoadingFilter, setIsLoadingFilter] = useState(true);

    // Search params
    const [searchParams, setSearchParams] = useState(filterParamsFromRedux || {});
    const enabledSearch = ['fullName', 'badgeId', 'workEmail'];

    const { havePermission } = usePermissions('DocumentManagementList', 'DocumentManagement');

    // Update filter
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingFilter(true);
            // Fetch document indexes
            const res = await documentService.getAllIndexes();
            const dataDocumentIndexes = res.data;
            // Fetch all document types
            const documentTypes = await documentService.getAllDocumentTypes();
            const dataDocumentTypes = documentTypes.data;

            // Get options for filter data
            const companyOptions = dataDocumentIndexes?.companies?.map(item => ({
                label: item.companyName,
                value: item.companyId.toString()
            }));
            const unitData = remapUnits(dataDocumentIndexes?.units);
            const positionOptions = dataDocumentIndexes?.positions?.map(item => ({
                label: item.positionName,
                value: item.positionId.toString()
            }));
            const statusOptions = dataDocumentIndexes?.statuses?.map(item => ({
                label: item.statusName,
                value: item.statusId.toString()
            }));
            const documentTypesStatusOptions = [
                {
                    label: 'Completed',
                    value: '1'
                },
                {
                    label: 'Not Completed',
                    value: '0'
                }
            ];
            const documentTypesOptions = dataDocumentTypes?.map(item => ({
                label: item.documentTypeName,
                value: item.documentTypeId.toString()
            }));

            // Validate requested date and received date
            const validateDocumentDate = ({ getFieldValue }: { getFieldValue: any }) => ({
                validator(_: any, value: any) {
                    const documentTypeIds = getFieldValue('documentTypeIds')?.toString();

                    if (value && !documentTypeIds) return Promise.reject(new Error('Type document filter field should have value'));
                    return Promise.resolve();
                }
            });

            const validateDocumentType = ({ getFieldValue }: { getFieldValue: any }) => ({
                validator(_: any, value: any) {
                    const requestedDate = getFieldValue('requestedDate');
                    const receivedDate = getFieldValue('receivedDate');

                    if (value?.toString() && !requestedDate && !receivedDate)
                        return Promise.reject(new Error('Requested Date or Received Date filter field should have value'));
                    return Promise.resolve();
                }
            });

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
                },
                {
                    key: 'joinedDate',
                    forColumns: ['startDate'],
                    label: 'Joined Date',
                    alwaysShow: true,
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromJoinedDate" toName="toJoinedDate" />
                },
                {
                    key: 'isCompletedValues',
                    forColumns: ['documentTypeName'],
                    label: 'Document Status',
                    alwaysShow: true,
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={documentTypesStatusOptions || []}
                            placeholder="Select document status"
                            searchPlaceholder="Search document status"
                        />
                    )
                },
                {
                    key: 'documentTypeIds',
                    forColumns: ['documentTypeName'],
                    label: 'Type Document',
                    alwaysShow: true,
                    rules: [validateDocumentType],
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={documentTypesOptions || []}
                            placeholder="Select type document"
                            searchPlaceholder="Search type document"
                        />
                    )
                },
                {
                    key: 'requestedDate',
                    forColumns: ['startDate'],
                    label: 'Requested Date',
                    alwaysShow: true,
                    rules: [validateDocumentDate],
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromRequestDate" toName="toRequestDate" />
                },
                {
                    key: 'receivedDate',
                    forColumns: ['startDate'],
                    label: 'Received Date',
                    alwaysShow: true,
                    rules: [validateDocumentDate],
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromReceivedDate" toName="toReceivedDate" />
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

    const renderDocumentType = <T extends keyof IDocumentType>(documentTypes: IDocumentType[], type: T, isImage: boolean = false) => (
        <table>
            <tbody>
                {documentTypes.map(doc => {
                    let content;
                    if (isImage) {
                        content = doc[type] ? <img src="/media/icons/check-green.svg" alt="icon-check" /> : '-';
                    } else if (type === 'requestDate' || type === 'receivedDate') {
                        content = renderWithFallback(formatTimeMonthDayYear(doc[type]));
                    } else {
                        content = renderWithFallback(doc[type], true);
                    }

                    const tdClassName = ['table-document-td', isImage && 'isCompleted'].filter(Boolean).join(' ');

                    return (
                        <tr className="table-document-tr" key={doc.documentTypeId}>
                            <td className={tdClassName}>{content || '-'}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );

    // Function to handle checkbox change for individual rows
    const onCheckboxChange = (checked: boolean, items: IDocumentList) => {
        const newCheckedList = checked ? [...checkedList, items.employeeId] : checkedList.filter(item => item !== items.employeeId);

        setCheckedList(newCheckedList);
        setIsIndeterminate(!!newCheckedList.length && newCheckedList.length < dataTable.length);
        setIsCheckAll(newCheckedList.length === dataTable.length);
    };

    // Function to handle "Select All" checkbox change
    const onCheckAllChange = (checked: boolean) => {
        const newCheckedList = checked ? dataTable.filter(item => !item.documents?.every(doc => doc.isCompleted)).map(item => item.employeeId) : [];
        setCheckedList(newCheckedList);
        setIsIndeterminate(false);
        setIsCheckAll(checked);
    };

    const tableColumns: ColumnsType<IDocumentList> = [
        {
            title: <Checkbox indeterminate={isIndeterminate} onChange={e => onCheckAllChange(e.target.checked)} checked={isCheckAll} />,
            key: 'checkbox',
            align: 'center',
            fixed: 'left',
            width: 52,
            render: (_, record: IDocumentList) => {
                const isAllCompleted = record.documents?.every(doc => doc.isCompleted);

                return (
                    <Checkbox
                        checked={checkedList.includes(record.employeeId)}
                        onChange={e => onCheckboxChange(e.target.checked, record)}
                        disabled={isAllCompleted}
                    />
                );
            }
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
            key: 'fullName',
            dataIndex: 'fullName',
            fixed: 'left',
            width: 300,
            sorter: createSorter('fullName'),
            render: (item: string, record) => (
                <Link
                    to={pathnames.hrManagement.documentManagement.detail.path + '/' + record.employeeId}
                    style={{ color: record.statusColor }}
                    className="full-name"
                >
                    {renderWithFallback(item)}
                </Link>
            )
        },
        {
            title: 'Work Email',
            dataIndex: 'workEmail',
            key: 'workEmail',
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            title: 'Company',
            dataIndex: 'companyName',
            key: 'companyName',
            width: 200,
            render: item => renderWithFallback(item, true)
        },
        {
            title: ORG_UNITS.DG,
            dataIndex: 'dgName',
            key: 'dgName',
            width: 158,
            sorter: createSorter('dgName'),
            render: item => renderWithFallback(item)
        },
        {
            title: ORG_UNITS.DC,
            dataIndex: 'dcName',
            key: 'dcName',
            width: 158,
            sorter: createSorter('dcName'),
            render: item => renderWithFallback(item)
        },
        {
            title: ORG_UNITS.Project,
            dataIndex: 'projectName',
            key: 'projectName',
            width: 180,
            render: item => renderWithFallback(item)
        },
        {
            title: 'Position',
            dataIndex: 'positionName',
            key: 'positionName',
            width: 200,
            sorter: createSorter('positionName'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Types',
            dataIndex: 'documents',
            key: 'types',
            width: 'auto',
            className: 'table-document-padding-0',
            render: item => renderDocumentType(item, 'documentTypeName')
        },
        {
            title: 'Completion Status',
            dataIndex: 'documents',
            key: 'isCompleted',
            align: 'center',
            width: 170,
            className: 'table-document-padding-0',
            render: item => renderDocumentType(item, 'isCompleted', true)
        },
        {
            title: 'Requested Date',
            dataIndex: 'documents',
            key: 'requestedDate',
            width: 158,
            className: 'table-document-padding-0',
            render: item => renderDocumentType(item, 'requestDate')
        },
        {
            title: 'Received Date',
            dataIndex: 'documents',
            key: 'receivedDate',
            width: 158,
            className: 'table-document-padding-0',
            render: item => renderDocumentType(item, 'receivedDate')
        },
        {
            title: 'Note',
            dataIndex: 'documents',
            key: 'notes',
            width: 200,
            className: 'table-document-padding-0',
            render: item => renderDocumentType(item, 'notes')
        },
        {
            title: 'Working Status',
            dataIndex: 'statusName',
            key: 'statusName',
            width: 158,
            sorter: createSorter('statusName'),
            render: (statusName: string) => renderWithFallback(statusName)
        },
        {
            title: 'Joined Date',
            dataIndex: 'joinDate',
            key: 'joinDate',
            width: 158,
            render: (joinDate: string) => renderWithFallback(formatTimeMonthDayYear(joinDate))
        }
    ];

    // Showed columns
    const alwaysShowColumnNames = [
        'checkbox',
        'badgeId',
        'fullName',
        'workEmail',
        'positionName',
        'companyName',
        'dgName',
        'dcName',
        'projectName',
        'types',
        'isCompleted',
        'requestedDate',
        'receivedDate',
        'notes',
        'statusName',
        'joinDate'
    ];

    // Get data from api
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingTable(true);
                const res = await documentService.getAllDocuments(searchParams);
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
    const pageTitle = pathnames.hrManagement.documentManagement.main.name;
    const breadcrumb: IDataBreadcrumb[] = [
        { title: pathnames.hrManagement.main.name },
        { title: pathnames.hrManagement.documentManagement.main.name }
    ];

    const quickFilter: IListManagementQuickFilter = {
        service: {
            getAll: documentService.getAllQuickFilter,
            create: documentService.createQuickFilter,
            delete: documentService.deleteQuickFilter,
            update: documentService.updateQuickFilter
        }
    };

    const { handlePageChange, setSearchByKeyword, showedColumns, updateShowedColumns } = useDataTableControls(
        'documentManagement',
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
                documentManagement: {
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
              const typedKey = key as keyof IDocumentManagementState;
              return searchParams[typedKey] != null;
          })
        : false;

    const moreButtons = [
        havePermission('ReminderEmail') && {
            children: 'Reminder Email',
            disabled: checkedList.length <= 0,
            onClick: () => setShowReminderEmail(true)
        },
        havePermission('Export') && {
            name: 'exportFile',
            children: 'Export',
            type: 'primary',
            fileName: 'Document.xlsx',
            service: documentService.exportDocuments,
            onExport: (data: IEmployee[]) => ({
                employeeIds: data.map((item: IEmployee) => item.employeeId.toString())
            })
        }
    ].filter(Boolean);

    const filter: IListManagementFilter<IDocumentList> = {
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
        moreButtons,
        onChangeData: setFilterData,
        onFilter: value => {
            setSearchParams(value);
        }
    };

    const table: IListManagementTable<IDocumentList> = {
        data: dataTable,
        loading: isLoadingTable,
        columns: tableColumns,
        showedColumns: {
            data: showedColumns,
            onChange: updateShowedColumns
        },
        tableHeader: <TableNote />,
        className: 'list-document-management min-h-466',
        rowClassName: (record, index) => {
            const isChecked = checkedList.includes(record.employeeId);
            const baseClass = index % 2 === 0 ? 'table-row-light' : 'table-row-dark';
            return isChecked ? `${baseClass} highlight-checked` : baseClass;
        },
        paginationTable: {
            currentPage: paginationTableFromRedux?.currentPage || 1,
            pageSize: paginationTableFromRedux?.pageSize || 10,
            onChange: handlePageChange
        },
        bordered: true
    };
    // #endregion ListManagement

    // Reminder email
    const handleReminderEmail = async () => {
        try {
            setShowReminderEmail(false);
            const employeeIds = checkedList.map(item => item.toString());
            const res = await documentService.reminderEmail({ employeeIds });
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Send mail failed');
        }
    };

    return (
        <>
            <ListManagement pageTitle={pageTitle} breadcrumb={breadcrumb} quickFilter={quickFilter} filter={filter} table={table} />
            {/* Reminder email */}
            <DialogCommon
                open={showReminderEmail}
                onClose={() => setShowReminderEmail(false)}
                title="Reminder Email"
                content="These employees will receive a reminder email. Are you sure you want to send these employees an email?"
                icon={icons.dialog.info}
                buttonType="default-primary"
                buttonLeftClick={() => setShowReminderEmail(false)}
                buttonRightClick={handleReminderEmail}
                buttonRight="Reminder"
            />
        </>
    );
};

export default DocumentManagement;
