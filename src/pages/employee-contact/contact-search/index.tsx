import Avatar from '@/components/common/avatar';
import DialogShowInfoEmployee from '@/components/common/dialog/dialog-show-info-employee';
import RenderProjectGroup from '@/components/common/dialog/dialog-show-info-employee/render-project-group';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import ListManagement from '@/components/common/list-management';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import { initializeShowedColumns } from '@/components/common/list-management/filter/use-filter';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import contactSearchService from '@/services/employee-contact/contact-search';
import employeeService from '@/services/hr-management/employee-management';
import { IDataBreadcrumb } from '@/types/common';
import { IFilterData } from '@/types/filter';
import { IEmployee } from '@/types/hr-management/employee-management';
import { IListManagementFilter, IListManagementQuickFilter, IListManagementTable } from '@/types/list-management';
import { ITableShowedColumn } from '@/types/table';
import { capitalizeFirstLetterOfWord, remapUnits } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { createSorter } from '@/utils/table';
import { Input } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

dayjs.extend(customParseFormat);

const EmployeeSearchPage = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { havePermission } = usePermissions('ContactSearchList', 'ContactSearch');

    // #region Filter
    // Search, Filter data
    const [keyword, setKeyword] = useState('');
    const [filterData, setFilterData] = useState<IFilterData[]>([]);
    const [loadingFilter, setLoadingFilter] = useState(true);
    const [filterCount, setFilterCount] = useState(0);
    const [searchParams, setSearchParams] = useState<any>({});
    const [onShowDetailEmployee, setOnShowDetailEmployee] = useState<boolean>(false);
    const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);

    const enabledSearch = ['badgeId', 'fullName', 'workEmail'];
    const keywordPlaceholder = 'Search by Badge ID, Full Name, Work Email';

    const [isFavorite, setIsFavorite] = useState(true);
    const filterSegmentedOptions = [
        {
            value: true,
            label: 'Favorite On'
        },
        {
            value: false,
            label: 'Favorite Off'
        }
    ];

    // Effect: Update filter
    useEffect(() => {
        const fetchData = async () => {
            setLoadingFilter(true);
            const res = await employeeService.getAllIndexes('ContactSearch');
            const employeeIndexes = res.data;

            // Get options for new filter data
            const companyOptions = employeeIndexes?.companies?.map(item => ({
                label: item.companyName,
                value: item.companyId.toString()
            }));
            const unitData = remapUnits(employeeIndexes?.units);
            const positionOptions = employeeIndexes?.positions?.map(item => ({
                label: item.positionName,
                value: item.positionId.toString()
            }));
            const gradeOptions = employeeIndexes?.grades?.map(item => ({
                label: item,
                value: item.toString()
            }));
            const locationOptions = employeeIndexes?.locationNames?.map(item => ({
                label: item,
                value: item.toString()
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
                            optionLabelProp="label"
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
                    key: 'grades',
                    forColumns: ['grade'],
                    label: 'Grade',
                    alwaysShow: true,
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
                    key: 'birthday',
                    forColumns: ['birthday'],
                    label: 'DOB',
                    alwaysShow: true,
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromBirthday" toName="toBirthday" />
                },
                {
                    key: 'joinDate',
                    forColumns: ['joinDate'],
                    label: 'Join Date',
                    alwaysShow: true,
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromJoinDate" toName="toJoinDate" />
                },
                {
                    key: 'locationNames',
                    forColumns: ['locationName'],
                    label: 'Location',
                    alwaysShow: true,
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
                    key: 'workPhone',
                    label: 'Work Phone',
                    forColumns: ['workPhone'],
                    alwaysShow: true,
                    control: <Input size="small" placeholder="Enter work phone" />
                },
                {
                    key: 'birthPlace',
                    label: 'Place Of Birth',
                    forColumns: ['birthPlace'],
                    alwaysShow: true,
                    control: <Input size="small" placeholder="Enter place of birth" />
                }
            ];

            setFilterData(newFilterData);
            setLoadingFilter(false);
        };

        fetchData();
    }, []);
    // #endregion Table

    // #region Table
    // Table columns
    const onFavorite = async (id: number) => {
        const res = await contactSearchService.favorite(id);
        const { succeeded = false, message = 'Favorite failed' } = res;

        if (succeeded) {
            const newDataTable = [...dataTable];
            const index = newDataTable.findIndex(item => item.employeeId === id);
            newDataTable[index].isFavorite = !newDataTable[index].isFavorite;

            setDataTable(newDataTable);
            showNotification(succeeded, message);
        }
    };

    const primaryColor = '#2a9ad6';

    const onShowModalDetail = async (item: IEmployee) => {
        setOnShowDetailEmployee(true);
        try {
            turnOnLoading();
            const res = await contactSearchService.getSortDetail(item.employeeId);
            const { succeeded, data } = res;

            if (succeeded && data) {
                setSelectedEmployee(data);
            }
        } catch (error) {
            showNotification(false, 'Get data employee detail for table contact failed');
        }

        turnOffLoading();
    };

    const onCloseModalDetailEmployee = () => {
        setOnShowDetailEmployee(false);
        setSelectedEmployee(null);
    };

    const tableColumns: ColumnsType<IEmployee> = [
        {
            title: 'Badge ID',
            dataIndex: 'badgeId',
            key: 'badgeId',
            fixed: 'left',
            width: 150,
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
                    to={pathnames.employeeContact.contactSearch.detail.path + '/' + record.employeeId}
                    style={{ color: record.statusColor || '#323232' }}
                    className="full-name"
                    target="_blank"
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
            render: (employeeImageUrl, record) => (
                <Avatar className="cursor-pointer" onClick={() => onShowModalDetail(record)} src={employeeImageUrl} />
            )
        },
        {
            title: 'Work Email',
            dataIndex: 'workEmail',
            key: 'workEmail',
            width: 200,
            sorter: createSorter('workEmail'),
            render: (workEmail: string) => {
                const emailJSX = (
                    <a href={`mailto:${workEmail}`} style={{ color: primaryColor }} className="underline">
                        {workEmail}
                    </a>
                );

                return workEmail ? emailJSX : '-';
            }
        },
        {
            title: 'Work Phone',
            dataIndex: 'workPhone',
            key: 'workPhone',
            width: 200,
            render: (workPhone: string) => renderWithFallback(workPhone)
        },
        {
            title: 'Position',
            dataIndex: 'positionName',
            key: 'positionName',
            width: 250,
            sorter: createSorter('positionName'),
            render: (positionName: string) => renderWithFallback(positionName)
        },
        {
            title: 'Location',
            dataIndex: 'locationName',
            key: 'locationName',
            width: 200,
            render: (locationName: string) => renderWithFallback(locationName)
        },
        {
            title: 'Project/Group',
            key: 'employeeContactUnitDtos',
            width: 'auto',
            render: (record: IEmployee) => <RenderProjectGroup items={record.employeeContactUnitDtos} />
        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 76,
            render: (_, record: IEmployee) => {
                const items: any = [
                    {
                        icon: record.isFavorite ? icons.tableAction.favorite : icons.tableAction.favoriteDisable,
                        tooltip: 'Update Favorite',
                        onClick: () => onFavorite(record.employeeId)
                    },
                    {
                        icon: icons.tableAction.resume,
                        tooltip: 'Resume',
                        link: pathnames.employeeContact.contactSearch.resume.path + '/' + record.employeeId,
                        target: '_blank'
                    }
                ];

                if (!havePermission('Update')) {
                    items.shift();
                }

                if (!havePermission('ViewResume')) {
                    items.pop();
                }

                return <ButtonsIcon items={items} />;
            }
        }
    ];

    // Showed columns
    const alwaysShowColumnNames = [
        'badgeId',
        'fullName',
        'employeeImageUrl',
        'workEmail',
        'workPhone',
        'positionName',
        'employeeContactUnitDtos',
        'locationName'
    ];

    const [showedColumns, setShowedColumns] = useState<ITableShowedColumn[]>(
        initializeShowedColumns(alwaysShowColumnNames, tableColumns, enabledSearch)
    );

    // Data table
    const [loadingTable, setLoadingTable] = useState(true);
    const [dataTable, setDataTable] = useState<IEmployee[]>([]);

    // Effect: Update data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingTable(true);

                const params = { ...searchParams, isFavorite };
                const res = await contactSearchService.search(params);
                const newDataTable = res.data || [];

                setDataTable(newDataTable);
            } catch (error) {
                setDataTable([]);
            } finally {
                setLoadingTable(false);
            }
        };

        fetchData();
    }, [searchParams, isFavorite]);
    // #endregion Table

    // List Management
    const pageTitle = capitalizeFirstLetterOfWord(pathnames.employeeContact.contactSearch.main.name);
    const breadcrumb: IDataBreadcrumb[] = [
        { title: pathnames.employeeContact.main.name },
        { title: pathnames.employeeContact.contactSearch.main.name }
    ];

    const quickFilter: IListManagementQuickFilter = {
        service: {
            getAll: contactSearchService.getAllQuickFilter,
            create: contactSearchService.createQuickFilter,
            delete: contactSearchService.deleteQuickFilter,
            update: contactSearchService.updateQuickFilter
        }
    };

    const filter: IListManagementFilter<IEmployee> = {
        data: filterData,
        value: searchParams,
        loading: loadingFilter,
        count: {
            value: filterCount,
            setValue: setFilterCount
        },
        searchInput: {
            value: keyword,
            onChange: setKeyword,
            placeholder: keywordPlaceholder
        },
        segmented: {
            name: 'isFavorite',
            options: filterSegmentedOptions,
            value: isFavorite,
            onChange: setIsFavorite
        },
        onChangeData: setFilterData,
        onFilter: setSearchParams
    };

    const table: IListManagementTable<IEmployee> = {
        data: dataTable,
        loading: loadingTable,
        columns: tableColumns,
        scroll: { x: 'max-content', y: 505 },
        showedColumns: {
            data: showedColumns,
            onChange: setShowedColumns
        }
    };

    return (
        <>
            <ListManagement pageTitle={pageTitle} breadcrumb={breadcrumb} quickFilter={quickFilter} filter={filter} table={table} />
            <DialogShowInfoEmployee
                onShowDetailEmployee={onShowDetailEmployee}
                selectedEmployee={selectedEmployee}
                onCloseModal={onCloseModalDetailEmployee}
                loading={isLoading}
            />
        </>
    );
};

export default EmployeeSearchPage;
