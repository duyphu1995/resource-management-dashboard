import Avatar from '@/components/common/avatar';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import ListManagement from '@/components/common/list-management';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderBooleanStatus, renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableNote, { ITableNoteData } from '@/components/common/table/table-note';
import pathnames from '@/pathnames';
import { searchParamsActions, selectSearchParams } from '@/redux/search-params-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import contractorService from '@/services/hr-management/contractor-management';
import { IDataBreadcrumb } from '@/types/common';
import { IFilterData } from '@/types/filter';
import { IContractorManagementState } from '@/types/filter-redux';
import { IContractor } from '@/types/hr-management/contractor-management';
import { IListManagementFilter, IListManagementQuickFilter, IListManagementTable } from '@/types/list-management';
import { formatTimeMonthDayYear, generateReduxSearchParams, processFilterParams, remapUnits } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { createSorter } from '@/utils/table';
import { Checkbox, Flex, Form, Input, InputNumber } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

dayjs.extend(customParseFormat);

const ContractorManagementPage = () => {
    const [filterForm] = Form.useForm();
    const { showNotification } = useNotify();
    const dispatch = useAppDispatch();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    const filterParamsFromRedux = selectSearchParamsRedux.contractorManagement.filter;
    const searchByKeywordFromRedux = selectSearchParamsRedux.contractorManagement.searchByKeyword;
    const paginationTableFromRedux = selectSearchParamsRedux.contractorManagement.paginationTable;

    // #region Filter
    // Search, Filter data
    const [keyword, setKeyword] = useState(searchByKeywordFromRedux || '');
    const [filterData, setFilterData] = useState<IFilterData[]>([]);
    const [loadingFilter, setLoadingFilter] = useState(true);
    const [searchParams, setSearchParams] = useState(filterParamsFromRedux || {});

    const { havePermission } = usePermissions('ContractorManagementList', 'ContractorManagement');

    const enabledSearch = ['contractorBadgeId', 'fullName'];
    const keywordPlaceholder = 'Search by Contractor ID, First Name, Last Name';

    // Effect: Update filter
    useEffect(() => {
        const fetchData = async () => {
            setLoadingFilter(true);
            const res = await contractorService.getAllIndexes();
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
            const gradeOptions = managementIndexes?.grades?.map(item => ({
                label: item,
                value: item.toString()
            }));
            const contractorStatusOptions = managementIndexes?.contractorStatuses?.map(item => ({
                label: item.statusName,
                value: item.statusId.toString()
            }));
            const genderOptions = managementIndexes?.genders?.map(item => ({
                label: item.genderName,
                value: item.genderId.toString()
            }));

            // Init new filter data
            const newFilterData: IFilterData[] = [
                {
                    key: 'companyIds',
                    label: 'Company',
                    forColumns: ['companyName'],
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
                    label: ORG_UNITS.Project,
                    forColumns: ['dgName', 'dcName', 'projectName'],
                    alwaysShow: true,
                    control: (
                        <TreeSelect multiple size="small" treeData={unitData || []} placeholder="Select project" searchPlaceholder="Search project" />
                    )
                },
                {
                    key: 'positionIds',
                    label: 'Position',
                    forColumns: ['positionName'],
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
                    key: 'contractorStatuses',
                    label: 'Contractor Status',
                    forColumns: ['contractorStatus'],
                    alwaysShow: true,
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={contractorStatusOptions || []}
                            placeholder="Select contractor status"
                            searchPlaceholder="Search contractor status"
                        />
                    )
                },
                {
                    key: 'grades',
                    label: 'Grade',
                    forColumns: ['grade'],
                    show: Boolean(searchParams?.grades),
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={gradeOptions || []}
                            placeholder="Select contractor grade"
                            searchPlaceholder="Search contractor grade"
                        />
                    )
                },
                {
                    key: 'joinDate',
                    label: 'Join Date',
                    forColumns: ['joinDate'],
                    colSpan: 12,
                    show: Boolean(searchParams?.toJoinDate || searchParams?.fromJoinDate),
                    control: <FilterDateRange fromName="fromJoinDate" toName="toJoinDate" />
                },
                {
                    key: 'signOrder',
                    forColumns: ['signOrder'],
                    label: 'Sign Order',
                    show: Boolean(searchParams?.signOrder),
                    control: (
                        <Input
                            type="number"
                            size="small"
                            placeholder="Enter sign order"
                            min={0}
                            onKeyDown={e => {
                                if (e.key === '-' || e.key === 'e') {
                                    e.preventDefault();
                                }
                            }}
                        />
                    )
                },
                {
                    key: 'effort',
                    forColumns: ['effort'],
                    label: 'Effort',
                    show: Boolean(searchParams?.effort),
                    control: <InputNumber size="small" className="w-100" placeholder="Enter effort" addonAfter="%" min={0} step={1} precision={0} />
                },
                {
                    key: 'billableValues',
                    label: 'Billable',
                    forColumns: ['isBillable'],
                    show: Boolean(searchParams?.billableValues),
                    control: (
                        <Checkbox.Group
                            options={[
                                { label: 'Yes', value: '1' },
                                { label: 'No', value: '0' }
                            ]}
                        />
                    )
                },
                {
                    key: 'endDate',
                    label: 'End Date',
                    forColumns: ['endDate'],
                    colSpan: 12,
                    show: Boolean(searchParams?.toEndDate || searchParams?.fromEndDate),
                    control: <FilterDateRange fromName="fromEndDate" toName="toEndDate" />
                },
                {
                    key: 'intendToEmployeeDate',
                    label: 'Intend To Be Employee',
                    forColumns: ['intendToEmployeeDate'],
                    colSpan: 12,
                    show: Boolean(searchParams?.toIntendToEmployeeDate || searchParams?.fromIntendToEmployeeDate),
                    control: <FilterDateRange fromName="fromIntendToEmployeeDate" toName="toIntendToEmployeeDate" />
                },
                {
                    key: 'sendMailDate',
                    label: 'Send To Personal Email',
                    forColumns: ['sendMailDate'],
                    colSpan: 12,
                    show: Boolean(searchParams?.toSendMailDate || searchParams?.fromSendMailDate),
                    control: <FilterDateRange fromName="fromSendMailDate" toName="toSendMailDate" />
                },
                {
                    key: 'birthday',
                    label: 'DOB',
                    forColumns: ['birthday'],
                    colSpan: 12,
                    show: Boolean(searchParams?.toBirthday || searchParams?.fromBirthday),
                    control: <FilterDateRange fromName="fromBirthday" toName="toBirthday" />
                },
                {
                    key: 'birthPlace',
                    label: 'Place Of Birth',
                    forColumns: ['birthPlace'],
                    show: Boolean(searchParams?.birthPlace),
                    control: <Input size="small" placeholder="Enter place of birth" />
                },
                {
                    key: 'genderIds',
                    label: 'Gender',
                    forColumns: ['genderName'],
                    show: Boolean(searchParams?.genderIds),
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={genderOptions || []}
                            placeholder="Select gender"
                            searchPlaceholder="Search gender"
                        />
                    )
                },
                {
                    key: 'personalEmail',
                    label: 'Personal Email',
                    forColumns: ['personalEmail'],
                    show: Boolean(searchParams?.personalEmail),
                    control: <Input size="small" placeholder="Enter personal email" />
                },
                {
                    key: 'mobilePhone',
                    label: 'Mobile Phone',
                    forColumns: ['mobilePhone'],
                    show: Boolean(searchParams?.mobilePhone),
                    control: <Input size="small" placeholder="Enter mobile phone" />
                },
                {
                    key: 'idCard',
                    label: 'ID Card',
                    forColumns: ['idCard'],
                    show: Boolean(searchParams?.idCard),
                    control: <Input size="small" placeholder="Enter ID card" />
                },
                {
                    key: 'idCardIssuePlace',
                    label: 'ID Card Issued Place',
                    forColumns: ['idCardIssuePlace'],
                    show: Boolean(searchParams?.idCardIssuePlace),
                    control: <Input size="small" placeholder="Enter ID card issue place" />
                },
                {
                    key: 'idCardIssueDate',
                    label: 'ID Card Issued Date',
                    forColumns: ['idCardIssueDate'],
                    colSpan: 12,
                    show: Boolean(searchParams?.toIdCardIssueDate || searchParams?.fromIdCardIssueDate),
                    control: <FilterDateRange fromName="fromIdCardIssueDate" toName="toIdCardIssueDate" />
                },
                {
                    key: 'transferDate',
                    label: 'Transfer From RMS',
                    forColumns: ['transferDate'],
                    colSpan: 12,
                    show: Boolean(searchParams?.toTransferDate || searchParams?.fromTransferDate),
                    control: <FilterDateRange fromName="fromTransferDate" toName="toTransferDate" />
                },
                {
                    key: 'permanentAddress',
                    label: 'Permanent Address',
                    forColumns: ['permanentAddress'],
                    show: Boolean(searchParams?.permanentAddress),
                    control: <Input size="small" placeholder="Enter permanent address" />
                },
                {
                    key: 'contactAddress',
                    label: 'Contact Address',
                    forColumns: ['contactAddress'],
                    show: Boolean(searchParams?.contactAddress),
                    control: <Input size="small" placeholder="Enter contact address" />
                }
            ];

            setFilterData(newFilterData);
            setLoadingFilter(false);
        };

        fetchData();
    }, []);
    // #endregion Table

    // #region Delete
    // Delete data
    const deleteModalTitle = 'Delete Contractor';
    const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
    const [deletedData, setDeletedData] = useState<IContractor | null>(null);
    const deleteModalContent = (
        <>
            The contractor&nbsp;
            <strong>
                {deletedData?.fullName} - {deletedData?.badgeId}
            </strong>
            &nbsp; will be deleted. Are you sure you want to delete this contractor?
        </>
    );

    const onShowDeleteModal = (deletedData: IContractor) => {
        setIsShowDeleteModal(true);
        setDeletedData(deletedData);
    };
    const onCloseDeleteModal = () => setIsShowDeleteModal(false);

    // Handle delete management
    const onDeleteEmployee = async () => {
        const res = await contractorService.deleteContractor(deletedData?.contractorId || 0);
        const { succeeded, message } = res;

        // Show notification
        showNotification(succeeded, message);

        // Close modal and reload data table
        setIsShowDeleteModal(false);
        setSearchParams({ ...searchParams });
    };
    // #endregion Delete Employee

    // Fetch contractor statuses for table notes
    const [statuses, setStatuses] = useState<ITableNoteData[]>([]);
    useEffect(() => {
        const fetchStatuses = async () => {
            const res = await contractorService.getAllContractorStatus();
            const { data = [] } = res;
            const newStatusesData: ITableNoteData[] = data.map(item => ({ title: item.contractorStatus, color: item.contractorStatusColor }));

            setStatuses(newStatusesData);
        };

        fetchStatuses();
    }, []);

    // Fetch contractor status count
    const [statusCounts, setStatusCounts] = useState<{ title: string; value: number }[]>([]);
    useEffect(() => {
        const fetchStatusCounts = async () => {
            const res = await contractorService.getContractorStatusCount();
            const { succeeded, data } = res;

            if (succeeded && data) {
                const newStatusCount = [
                    { title: 'Total', value: data.total },
                    { title: 'Working', value: data.working },
                    { title: 'End', value: data.end }
                ];

                setStatusCounts(newStatusCount);
            }
        };

        fetchStatusCounts();
    }, []);

    // #region Table
    const orderStatus = useMemo(() => ['Contractor', 'Convert to Employee', 'End contractor'], []);
    const handleSortStatus = useCallback((statusList: ITableNoteData[]) => {
        statusList.sort((a, b) => orderStatus.indexOf(a.title) - orderStatus.indexOf(b.title));
        return statusList;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tableNote = (
        <Flex justify="space-between" align="center" gap={24}>
            <TableNote data={handleSortStatus(statuses)} />
            <Flex gap={24}>
                {statusCounts.map((item, index) => (
                    <Flex gap={8} key={index}>
                        <div style={{ color: '#767676' }}>{item.title}</div>
                        <div style={{ fontWeight: 500, color: '#323232 ' }}>{item.value}</div>
                    </Flex>
                ))}
            </Flex>
        </Flex>
    );

    // Table columns
    const tableColumns: ColumnsType<IContractor> = [
        {
            title: 'Contractor ID',
            dataIndex: 'contractorBadgeId',
            key: 'contractorBadgeId',
            fixed: 'left',
            width: 139,
            sorter: createSorter('contractorBadgeId', 'number'),
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
                    to={pathnames.hrManagement.contractorManagement.detail.path + '/' + record.contractorId}
                    style={{ fontWeight: 500, textTransform: 'uppercase', color: record.contractorStatusColor || '#323232' }}
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
            title: ORG_UNITS.DC,
            dataIndex: 'dcName',
            key: 'dcName',
            width: 137,
            sorter: createSorter('dcName'),
            render: item => renderWithFallback(item)
        },
        {
            title: ORG_UNITS.DG,
            dataIndex: 'dgName',
            key: 'dgName',
            width: 129,
            sorter: createSorter('dgName'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Position',
            dataIndex: 'positionName',
            key: 'positionName',
            width: 123,
            sorter: createSorter('positionName'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            width: 95,
            sorter: createSorter('grade', 'number'),
            render: item => renderWithFallback(item)
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
            title: 'Effort',
            dataIndex: 'effort',
            key: 'effort',
            width: 129,
            render: item => renderWithFallback(item + '%')
        },
        {
            title: 'Billable',
            dataIndex: 'isBillable',
            key: 'isBillable',
            align: 'center',
            width: 98,
            sorter: createSorter('isBillable', 'boolean'),
            render: item => renderBooleanStatus(item, 'billable')
        },
        {
            title: 'Joined Date',
            dataIndex: 'joinDate',
            key: 'joinDate',
            width: 126,
            sorter: createSorter('joinDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 126,
            sorter: createSorter('endDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Intend To Be Employee',
            dataIndex: 'intendToEmployeeDate',
            key: 'intendToEmployeeDate',
            width: 204,
            sorter: createSorter('intendToEmployeeDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Send To Personal Email',
            dataIndex: 'sendMailDate',
            key: 'sendMailDate',
            width: 204,
            sorter: createSorter('sendMailDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Convert To Employee',
            dataIndex: 'convertToEmployeeDate',
            key: 'convertToEmployeeDate',
            width: 204,
            sorter: createSorter('convertToEmployeeDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Contractor Status',
            dataIndex: 'contractorStatus',
            key: 'contractorStatus',
            width: 177,
            sorter: createSorter('contractorStatus'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'DOB',
            dataIndex: 'birthday',
            key: 'birthday',
            width: 126,
            sorter: createSorter('birthday', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Place Of Birth',
            dataIndex: 'birthPlace',
            key: 'birthPlace',
            width: 166,
            sorter: createSorter('birthPlace'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Gender',
            dataIndex: 'genderName',
            key: 'genderName',
            width: 98,
            sorter: createSorter('genderName'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Personal Email',
            dataIndex: 'personalEmail',
            key: 'personalEmail',
            width: 183,
            sorter: createSorter('personalEmail'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Mobile Phone',
            dataIndex: 'mobilePhone',
            key: 'mobilePhone',
            width: 123,
            render: item => renderWithFallback(item)
        },
        {
            title: 'Permanent Address',
            dataIndex: 'permanentAddress',
            key: 'permanentAddress',
            width: 179,
            sorter: createSorter('permanentAddress'),
            render: item => renderWithFallback(item, true)
        },
        {
            title: 'Contact Address',
            dataIndex: 'contactAddress',
            key: 'contactAddress',
            width: 170,
            sorter: createSorter('contactAddress'),
            render: item => renderWithFallback(item, true)
        },
        {
            title: 'ID Card',
            dataIndex: 'idCardNo',
            key: 'idCardNo',
            width: 151,
            sorter: createSorter('idCardNo'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'ID Card Issued Date',
            dataIndex: 'idCardIssueDate',
            key: 'idCardIssueDate',
            width: 182,
            sorter: createSorter('idCardIssueDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'ID Card Issued Place',
            dataIndex: 'idCardIssuePlace',
            key: 'idCardIssuePlace',
            width: 186,
            sorter: createSorter('idCardIssuePlace'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Note',
            dataIndex: 'notes',
            key: 'notes',
            width: 204,
            sorter: createSorter('notes'),
            render: item => renderWithFallback(item, true, 22)
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
            title: 'Transfer From RMS',
            dataIndex: 'transferDate',
            key: 'transferDate',
            width: 174,
            sorter: createSorter('transferDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 76,
            render: (record: IContractor) => (
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
        'contractorBadgeId',
        'fullName',
        'employeeImageUrl',
        'dcName',
        'dgName',
        'positionName',
        'grade',
        'projectName',
        'effort',
        'isBillable',
        'joinDate',
        'endDate',
        'intendToEmployeeDate',
        'sendMailDate',
        'convertToEmployeeDate',
        'contractorStatus',
        'birthday',
        'birthPlace',
        'genderName',
        'personalEmail',
        'mobilePhone',
        'permanentAddress',
        'contactAddress',
        'idCardNo',
        'idCardIssueDate',
        'idCardIssuePlace',
        'notes',
        'companyName',
        'transferDate'
    ];

    // Data table
    const [loadingTable, setLoadingTable] = useState(true);
    const [dataTable, setDataTable] = useState<IContractor[]>([]);

    // Effect: Update data
    useEffect(() => {
        const fetchData = async () => {
            setLoadingTable(true);
            try {
                const res = await contractorService.searchContractor(searchParams);
                const newDataTable = res.data || [];

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
    const pageTitle = pathnames.hrManagement.contractorManagement.main.name;
    const breadcrumb: IDataBreadcrumb[] = [
        { title: pathnames.hrManagement.main.name },
        { title: pathnames.hrManagement.contractorManagement.main.name }
    ];

    const quickFilter: IListManagementQuickFilter = {
        service: {
            getAll: contractorService.getAllQuickFilter,
            create: contractorService.createQuickFilter,
            delete: contractorService.deleteQuickFilter,
            update: contractorService.updateQuickFilter
        }
    };

    const { handlePageChange, setSearchByKeyword, showedColumns, updateShowedColumns } = useDataTableControls(
        'contractorManagement',
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
                contractorManagement: {
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
              const typedKey = key as keyof IContractorManagementState;
              return searchParams[typedKey] != null;
          })
        : false;

    const moreButtons = [
        havePermission('Export') && {
            name: 'exportFile',
            children: 'Export',
            fileName: 'Contractor List.xlsx',
            service: contractorService.exportContractors,
            onExport: (data: IContractor[]) => ({ contractorIds: data.map(item => item.contractorId.toString()) })
        }
    ].filter(Boolean);

    const filter: IListManagementFilter<IContractor> = {
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
        moreButtons,
        onChangeData: setFilterData,
        onFilter: value => {
            setSearchParams(value);
        }
    };

    const table: IListManagementTable<IContractor> = {
        data: dataTable,
        loading: loadingTable,
        tableHeader: tableNote,
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
        scroll: { x: 'max-content', y: 449 },
        className: 'min-h-449'
    };

    return (
        <>
            <ListManagement pageTitle={pageTitle} breadcrumb={breadcrumb} quickFilter={quickFilter} filter={filter} table={table} />
            <DialogCommon
                open={isShowDeleteModal}
                onClose={onCloseDeleteModal}
                icon={icons.dialog.delete}
                title={deleteModalTitle}
                content={deleteModalContent}
                buttonType="default-danger"
                buttonLeftClick={onCloseDeleteModal}
                buttonRight="Delete"
                buttonRightClick={onDeleteEmployee}
            />
        </>
    );
};

export default ContractorManagementPage;
