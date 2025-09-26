import Avatar from '@/components/common/avatar';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import InputCommon from '@/components/common/form/input';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import ListManagement from '@/components/common/list-management';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import SubTab from '@/components/common/tab/sub-tab';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderBooleanStatus, renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableNote from '@/components/common/table/table-note';
import pathnames from '@/pathnames';
import { searchParamsActions, selectSearchParams } from '@/redux/search-params-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import employeeService from '@/services/hr-management/employee-management';
import { IDataBreadcrumb } from '@/types/common';
import { IFilterData, IFilterExportButton, IFilterImportButton } from '@/types/filter';
import { IManagementState } from '@/types/filter-redux';
import { ICompany, IEmployee } from '@/types/hr-management/employee-management';
import { IListManagementFilter, IListManagementQuickFilter, IListManagementTable } from '@/types/list-management';
import { formatTimeMonthDayYear, generateReduxSearchParams, processFilterParams, remapUnits } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { createSorter } from '@/utils/table';
import { ButtonProps, Checkbox, Flex, Form, Input } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './index.scss';

dayjs.extend(customParseFormat);

const EmployeeManagement = () => {
    const navigation = useNavigate();
    const [filterForm] = Form.useForm();
    const { showNotification } = useNotify();
    const dispatch = useAppDispatch();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    const filterParamsFromRedux = selectSearchParamsRedux.employeeManagement.filter;
    const searchByKeywordFromRedux = selectSearchParamsRedux.employeeManagement.searchByKeyword;
    const paginationTableFromRedux = selectSearchParamsRedux.employeeManagement.paginationTable;

    const { havePermission } = usePermissions('EmployeeManagementList', 'EmployeeManagement');

    // #region Filter
    // Search, Filter data
    const [keyword, setKeyword] = useState(searchByKeywordFromRedux || '');
    const [filterData, setFilterData] = useState<IFilterData[]>([]);
    const [companyIds, setCompanyIds] = useState<number>(0);
    const [loadingFilter, setLoadingFilter] = useState(true);
    const [searchParams, setSearchParams] = useState(filterParamsFromRedux);

    const [companyList, setCompanyList] = useState<ICompany[]>([]);

    const enabledSearch = ['badgeId', 'fullName', 'workEmail'];
    const keywordPlaceholder = 'Search by Badge ID, Full Name, Work Email';

    // Validate requested date and received date
    const validateUnit = ({ getFieldValue }: { getFieldValue: any }) => ({
        validator(_: any, value: any) {
            const documentTypeIds = getFieldValue('mainProjectValues')?.toString();

            if (documentTypeIds && (!value || !value.length)) return Promise.reject(new Error('You must select at least one option'));
            return Promise.resolve();
        }
    });

    // Effect: Update filter
    useEffect(() => {
        const fetchData = async () => {
            setLoadingFilter(true);
            const res = await employeeService.getAllIndexes();
            const employeeIndexes = res.data;

            // Get options for new filter data

            const unitData = remapUnits(employeeIndexes?.units);
            const positionOptions = employeeIndexes?.positions?.map(item => ({
                label: item.positionName,
                value: item.positionId.toString()
            }));
            const nationalityOptions = employeeIndexes?.nationalities?.map(item => ({
                label: item.nationalityName,
                value: item.nationalityId.toString()
            }));
            const genderOptions = employeeIndexes?.genders?.map(item => ({
                label: item.genderName,
                value: item.genderId.toString()
            }));
            const statusOptions = employeeIndexes?.statuses?.map(item => ({
                label: item.statusName,
                value: item.statusId.toString()
            }));
            const maritalStatusOptions = employeeIndexes?.maritalStatuses?.map(item => ({
                label: item.maritalStatusName,
                value: item.maritalStatusId.toString()
            }));
            const educationOptions = employeeIndexes?.educationNames?.map(item => ({
                label: item,
                value: item.toString()
            }));
            const gradeOptions = employeeIndexes?.grades?.map(item => ({
                label: item,
                value: item.toString()
            }));
            const resignationOptions = employeeIndexes?.resignationStatuses?.map(item => ({
                label: item.statusName,
                value: item.statusId.toString()
            }));
            const locationOptions = employeeIndexes?.locationNames?.map(item => ({
                label: item,
                value: item.toString()
            }));

            // Init new filter data
            const newFilterData: IFilterData[] = [
                {
                    key: 'unitIds',
                    label: ORG_UNITS.Project,
                    forColumns: ['dgName', 'dcName', 'projectName'],
                    alwaysShow: true,
                    rules: [validateUnit],
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
                    key: 'statusIds',
                    label: 'Working Status',
                    forColumns: ['statusName'],
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
                    key: 'birthday',
                    label: 'DOB',
                    forColumns: ['birthday'],
                    show: Boolean(searchParams?.toBirthday || searchParams?.fromBirthday),
                    colSpan: 12,
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
                    key: 'workPhone',
                    label: 'Work Phone',
                    forColumns: ['workPhone'],
                    show: Boolean(searchParams?.workPhone),
                    control: <Input size="small" placeholder="Enter work phone" />
                },
                {
                    key: 'mobilePhone',
                    label: 'Mobile Phone',
                    forColumns: ['mobilePhone'],
                    show: Boolean(searchParams?.mobilePhone),
                    control: <InputCommon size="small" placeholder="Enter mobile phone" typeInput="phone-number" />
                },
                {
                    key: 'homePhone',
                    label: 'Home Phone',
                    forColumns: ['homePhone'],
                    show: Boolean(searchParams?.homePhone),
                    control: <Input size="small" placeholder="Enter home phone" />
                },
                {
                    key: 'resignationStatusIds',
                    label: 'Resignation Status',
                    forColumns: ['resignationStatusName'],
                    show: Boolean(searchParams?.resignationStatusIds),
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={resignationOptions || []}
                            placeholder="Select resignation status"
                            searchPlaceholder="Search resignation status"
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
                            placeholder="Select grade"
                            searchPlaceholder="Search grade"
                        />
                    )
                },
                {
                    key: 'idCardNo',
                    label: 'ID Card',
                    forColumns: ['idCardNo'],
                    show: Boolean(searchParams?.idCardNo),
                    control: <Input size="small" placeholder="Enter ID Card" />
                },
                {
                    key: 'idCardIssueDate',
                    label: 'ID Card Issued Date',
                    forColumns: ['idCardIssueDate'],
                    show: Boolean(searchParams?.fromIdCardIssueDate || searchParams?.toIdCardIssueDate),
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromIdCardIssueDate" toName="toIdCardIssueDate" />
                },
                {
                    key: 'joinDate',
                    label: 'Join Date',
                    forColumns: ['joinDate'],
                    show: Boolean(searchParams?.fromJoinDate || searchParams?.toJoinDate),
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromJoinDate" toName="toJoinDate" />
                },
                {
                    key: 'maritalStatusIds',
                    label: 'Marital Status',
                    forColumns: ['maritalStatusName'],
                    show: Boolean(searchParams?.maritalStatusIds),
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={maritalStatusOptions || []}
                            placeholder="Select marital status"
                            searchPlaceholder="Search marital status"
                        />
                    )
                },
                {
                    key: 'nationalityIds',
                    label: 'Nationality',
                    forColumns: ['nationalityName'],
                    show: Boolean(searchParams?.nationalityIds),
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={nationalityOptions || []}
                            placeholder="Select nationality"
                            searchPlaceholder="Search nationality"
                        />
                    )
                },
                {
                    key: 'locationNames',
                    label: 'Location',
                    forColumns: ['locationName'],
                    show: Boolean(searchParams?.locationNames),
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={locationOptions || []}
                            placeholder="Select location"
                            searchPlaceholder="Search location"
                        />
                    )
                },
                {
                    key: 'passportNo',
                    label: 'Passport',
                    forColumns: ['passportNo'],
                    show: Boolean(searchParams?.passportNo),
                    control: <Input size="small" placeholder="Enter passport" />
                },
                {
                    key: 'passportIssueDate',
                    label: 'Passport Issued Date',
                    forColumns: ['passportIssueDate'],
                    show: Boolean(searchParams?.fromPassportIssueDate || searchParams?.toPassportIssueDate),
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromPassportIssueDate" toName="toPassportIssueDate" />
                },
                {
                    key: 'passportExpiryDate',
                    label: 'Passport Expiry Date',
                    forColumns: ['passportExpiryDate'],
                    show: Boolean(searchParams?.fromPassportExpiryDate || searchParams?.toPassportExpiryDate),
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromPassportExpiryDate" toName="toPassportExpiryDate" />
                },
                {
                    key: 'educationNames',
                    label: 'Education',
                    forColumns: ['educationNames'],
                    show: Boolean(searchParams?.educationNames),
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={educationOptions || []}
                            placeholder="Select education"
                            searchPlaceholder="Search education"
                        />
                    )
                },
                {
                    key: 'mainProjectValues',
                    forColumns: ['mainProjectValues'],
                    label: 'Main Project',
                    show: Boolean(searchParams?.mainProjectValues),
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
                    key: 'blacklistedValues',
                    label: 'Blacklist',
                    forColumns: ['isBlacklisted'],
                    show: Boolean(searchParams?.blacklistedValues),
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
                    key: 'lowPerformanceValues',
                    label: 'Low Performance',
                    forColumns: ['isLowPerformance'],
                    show: Boolean(searchParams?.lowPerformanceValues),
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
                    key: 'groupPAToolValues',
                    label: 'Dept/TIP/JP project',
                    forColumns: ['isGroupByPATool'],
                    show: Boolean(searchParams?.groupPAToolValues),
                    control: (
                        <Checkbox.Group
                            options={[
                                { label: 'Yes', value: '1' },
                                { label: 'No', value: '0' }
                            ]}
                        />
                    )
                }
            ];

            setCompanyList(employeeIndexes?.companies || []);
            setFilterData(newFilterData);
            setLoadingFilter(false);
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // #endregion Table

    // #region Delete Employee
    // Delete employee data
    const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
    const [deletedData, setDeletedData] = useState<IEmployee | null>(null);
    const deleteModalContent = (
        <>
            The employee&nbsp;
            <strong>
                {deletedData?.fullName} - {deletedData?.badgeId}
            </strong>
            &nbsp; will be deleted. Are you sure you want to delete this employee?
        </>
    );

    const onShowDeleteModal = (deletedData: IEmployee) => {
        setIsShowDeleteModal(true);
        setDeletedData(deletedData);
    };
    const onCloseDeleteModal = () => setIsShowDeleteModal(false);

    // Handle delete employee
    const onDeleteEmployee = async () => {
        const res = await employeeService.deleteEmployee(deletedData?.employeeId || 0);
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
    const tableColumns: ColumnsType<IEmployee> = [
        {
            title: 'Badge ID',
            dataIndex: 'badgeId',
            key: 'badgeId',
            fixed: 'left',
            width: 109,
            sorter: createSorter('badgeId'),
            render: (item: string) => renderWithFallback(item, true, 7)
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
                    to={pathnames.hrManagement.employeeManagement.detail.path + '/' + record.employeeId}
                    style={{ color: record.statusColor }}
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
            render: (employeeImageUrl: string) => <Avatar src={employeeImageUrl} />
        },
        {
            title: 'Joined Date',
            dataIndex: 'joinDate',
            key: 'joinDate',
            width: 126,
            sorter: createSorter('joinDate', 'date'),
            render: (item: string) => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Work Email',
            dataIndex: 'workEmail',
            key: 'workEmail',
            width: 183,
            sorter: createSorter('workEmail'),
            render: (item: string) => renderWithFallback(item, true, 16)
        },
        {
            title: 'Location',
            dataIndex: 'locationName',
            key: 'locationName',
            width: 240,
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'Work Phone',
            dataIndex: 'workPhone',
            key: 'workPhone',
            width: 129,
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'Contract Type',
            dataIndex: 'contractTypeName',
            key: 'contractTypeName',
            width: 180,
            sorter: createSorter('contractTypeName'),
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'Position',
            dataIndex: 'positionName',
            key: 'positionName',
            width: 180,
            sorter: createSorter('positionName'),
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            width: 95,
            sorter: createSorter('grade', 'number'),
            render: (item: number) => renderWithFallback(item)
        },
        {
            title: ORG_UNITS.Project,
            dataIndex: 'projectName',
            key: 'projectName',
            width: 139,
            sorter: createSorter('projectName'),
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: ORG_UNITS.DC,
            dataIndex: 'dcName',
            key: 'dcName',
            width: 137,
            sorter: createSorter('dcName'),
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: ORG_UNITS.DG,
            dataIndex: 'dgName',
            key: 'dgName',
            width: 129,
            sorter: createSorter('dgName'),
            render: (item: string) => renderWithFallback(item, true)
        },
        {
            title: 'Gender',
            dataIndex: 'genderName',
            key: 'genderName',
            width: 98,
            sorter: createSorter('genderName'),
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'DOB',
            dataIndex: 'birthday',
            key: 'birthday',
            width: 126,
            sorter: createSorter('birthday', 'date'),
            render: (item: string) => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Company',
            dataIndex: 'companyName',
            key: 'companyName',
            width: 187,
            sorter: createSorter('companyName'),
            render: (item: string) => renderWithFallback(item, true)
        },
        {
            title: 'Mobile Phone',
            dataIndex: 'mobilePhone',
            key: 'mobilePhone',
            width: 123,
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'Emergency',
            dataIndex: 'emergencyPhone',
            key: 'emergencyPhone',
            width: 120,
            render: (item: string) => renderWithFallback(item)
        },

        {
            title: 'Working Status',
            dataIndex: 'statusName',
            key: 'statusName',
            width: 166,
            sorter: createSorter('statusName'),
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'Resignation Status',
            dataIndex: 'resignationStatusName',
            key: 'resignationStatusName',
            width: 166,
            sorter: createSorter('resignationStatusName'),
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'Home Phone',
            dataIndex: 'homePhone',
            key: 'homePhone',
            width: 123,
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'Place Of Birth',
            dataIndex: 'birthPlace',
            key: 'birthPlace',
            width: 144,
            sorter: createSorter('birthPlace'),
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'ID Card',
            dataIndex: 'idCardNo',
            key: 'idCardNo',
            width: 151,
            sorter: createSorter('idCardNo', 'number'),
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'ID Card Issue Date',
            dataIndex: 'idCardIssueDate',
            key: 'idCardIssueDate',
            width: 182,
            sorter: createSorter('idCardIssueDate', 'date'),
            render: (item: string) => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Marital Status',
            dataIndex: 'maritalStatusName',
            key: 'maritalStatusName',
            width: 138,
            sorter: createSorter('maritalStatusName'),
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'Nationality',
            dataIndex: 'nationalityName',
            key: 'nationalityName',
            width: 126,
            sorter: createSorter('nationalityName'),
            render: (item: string) => renderWithFallback(item)
        },

        {
            title: 'Education',
            dataIndex: 'educationNames',
            key: 'educationNames',
            width: 200,
            render: (educationNames: string[]) => {
                return (
                    <div>
                        {educationNames &&
                            educationNames.map((item: string, index: number) => (
                                <Flex key={index}>
                                    <div style={{ width: 16, minWidth: 16 }}>•</div>
                                    <div>{item}</div>
                                </Flex>
                            ))}
                    </div>
                );
            }
        },
        {
            title: 'Passport',
            dataIndex: 'passportNo',
            key: 'passportNo',
            width: 111,
            sorter: createSorter('passportNo', 'number'),
            render: (passportNo: string) => renderWithFallback(passportNo)
        },
        {
            title: 'Passport Issue Date',
            dataIndex: 'passportIssueDate',
            key: 'passportIssueDate',
            width: 186,
            sorter: createSorter('passportIssueDate', 'date'),
            render: (item: string) => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Passport Expiry Date',
            dataIndex: 'passportExpiryDate',
            key: 'passportExpiryDate',
            width: 186,
            sorter: createSorter('passportExpiryDate', 'date'),
            render: (item: string) => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Blacklist',
            dataIndex: 'isBlacklisted',
            key: 'isBlacklisted',
            align: 'center',
            width: 100,
            sorter: createSorter('isBlacklisted', 'boolean'),
            render: (isBlacklisted: boolean) => renderBooleanStatus(isBlacklisted, 'blacklist')
        },
        {
            title: 'Low Performance',
            dataIndex: 'isLowPerformance',
            key: 'isLowPerformance',
            align: 'center',
            width: 165,
            sorter: createSorter('isLowPerformance', 'boolean'),
            render: (isLowPerformance: boolean) => renderBooleanStatus(isLowPerformance, 'low-performance')
        },
        {
            title: 'Dept/TIP/JP project',
            dataIndex: 'isGroupByPATool',
            key: 'isGroupByPATool',
            align: 'center',
            width: 180,
            sorter: createSorter('isGroupByPATool', 'boolean'),
            render: (isGroupByPATool: boolean) => renderBooleanStatus(isGroupByPATool, 'isGroupByPATool')
        },
        ...(havePermission('Delete')
            ? [
                  {
                      title: 'Action',
                      key: 'action',
                      fixed: 'right' as const,
                      width: 88,
                      render: (record: IEmployee) => (
                          <ButtonsIcon
                              items={[
                                  {
                                      icon: icons.tableAction.delete,
                                      onClick: () => onShowDeleteModal(record),
                                      tooltip: 'Delete'
                                  }
                              ]}
                          />
                      )
                  }
              ]
            : [])
    ];

    // Showed columns
    const alwaysShowColumnNames = [
        'badgeId',
        'fullName',
        'employeeImageUrl',
        'joinDate',
        'workEmail',
        'locationName',
        'workPhone',
        'contractTypeName',
        'positionName',
        'grade',
        'projectName',
        'dgName',
        'dcName'
    ];

    // Data table
    const [loadingTable, setLoadingTable] = useState(true);
    const [employeeList, setEmployeeList] = useState<IEmployee[]>([]);

    // Effect: Update data
    useEffect(() => {
        const fetchData = async () => {
            setLoadingTable(true);

            try {
                const res = await employeeService.getAllEmployee({ ...searchParams, companyIds: undefined });
                const newDataTable = res.data || [];

                setEmployeeList(newDataTable);
            } catch (error) {
                setEmployeeList([]);
            } finally {
                setLoadingTable(false);
            }
        };

        fetchData();
    }, [searchParams]);

    // #endregion Table

    // #region ListManagement
    const pageTitle = pathnames.hrManagement.employeeManagement.main.name;
    const breadcrumb: IDataBreadcrumb[] = [
        { title: pathnames.hrManagement.main.name },
        { title: pathnames.hrManagement.employeeManagement.main.name }
    ];
    const buttons: ButtonProps[] = havePermission('Add') && [
        {
            type: 'primary',
            onClick: () => navigation(pathnames.hrManagement.employeeManagement.add.path),
            children: pathnames.hrManagement.employeeManagement.add.name
        }
    ];

    const moreButtons: (ButtonProps | IFilterImportButton | IFilterExportButton<any>)[] = [
        havePermission('Export') && {
            name: 'exportFile',
            children: 'Export',
            fileName: 'Employees.xlsx',
            service: employeeService.exportEmployees,
            onExport: (data: IEmployee[]) => ({ employeeIds: data.map((item: IEmployee) => item.employeeId.toString()) })
        },

        havePermission('Import') && {
            name: 'importFile',
            children: 'Import',
            service: employeeService.importEmployees
        }
    ].filter(Boolean);

    const quickFilter: IListManagementQuickFilter = {
        service: {
            getAll: employeeService.getAllQuickFilter,
            create: employeeService.createQuickFilter,
            delete: employeeService.deleteQuickFilter,
            update: employeeService.updateQuickFilter
        }
    };

    const { handlePageChange, setSearchByKeyword, showedColumns, updateShowedColumns } = useDataTableControls(
        'employeeManagement',
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
                employeeManagement: {
                    filter: { ...dataReduxSearchParams, companyIds: [companyIds] }
                }
            })
        );
    }, [searchParams, dispatch, companyIds, filterData, filterForm]);

    useEffect(() => {
        const processedParams = processFilterParams(filterParamsFromRedux ?? {});

        // Set the processed values in the form
        filterForm.setFieldsValue(processedParams);
    }, [filterParamsFromRedux, filterForm]);

    const isShowFilter = searchParams
        ? Object.keys(searchParams).some(key => {
              const typedKey = key as keyof IManagementState;
              return typedKey !== 'companyIds' && searchParams[typedKey] != null;
          })
        : false;

    const filter: IListManagementFilter<IEmployee> = {
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

    const items = [{ companyId: 0, companyName: 'All employees' }, ...companyList].map(item => ({
        key: String(item.companyId),
        label: item.companyName
    }));

    const scrollToDefault = () => {
        const tableBody = document.querySelector('.employee-management .ant-table-body');
        if (tableBody) {
            tableBody.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
    };

    const handleOnChangeTabs = (key: string) => {
        scrollToDefault();
        setCompanyIds(Number(key));
        handlePageChange(1, 10);
    };

    const tableHeader = (
        <div className="table-header">
            {!loadingFilter && (
                <>
                    <TableNote />
                    <SubTab items={items} activeKey={companyIds.toString()} onChange={handleOnChangeTabs} className="table-header__tabs" />
                </>
            )}
        </div>
    );

    const table: IListManagementTable<IEmployee> = {
        data: employeeList.filter(item => {
            return companyIds ? item.companyId === companyIds : true;
        }),
        loading: loadingTable,
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
        className: 'min-h-417',
        scroll: { x: 'max-content', y: 417 },
        tableHeader
    };
    //#endregion ListManagement

    useEffect(() => {
        searchParams?.companyIds && setCompanyIds(searchParams?.companyIds[0]);
    }, [searchParams?.companyIds]);

    return (
        <div className="employee-management">
            <ListManagement pageTitle={pageTitle} buttons={buttons} breadcrumb={breadcrumb} quickFilter={quickFilter} filter={filter} table={table} />
            <DialogCommon
                open={isShowDeleteModal}
                onClose={onCloseDeleteModal}
                icon={icons.dialog.delete}
                title="Delete Employee"
                content={deleteModalContent}
                buttonType="default-danger"
                buttonLeftClick={onCloseDeleteModal}
                buttonRightClick={onDeleteEmployee}
            />
        </div>
    );
};

export default EmployeeManagement;
