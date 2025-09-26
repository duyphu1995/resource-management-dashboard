import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import ListManagement from '@/components/common/list-management';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableNote from '@/components/common/table/table-note';
import pathnames from '@/pathnames';
import { searchParamsActions, selectSearchParams } from '@/redux/search-params-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import onsiteService from '@/services/hr-management/onsite-management';
import { IFilterData } from '@/types/filter';
import { IOnsiteManagementState } from '@/types/filter-redux';
import { IOnsite } from '@/types/hr-management/onsite-management';
import { IListManagementFilter, IListManagementQuickFilter, IListManagementTable } from '@/types/list-management';
import { formatTimeMonthDayYear, generateReduxSearchParams, processFilterParams, remapUnits } from '@/utils/common';
import { ORG_UNITS, TIME_FORMAT } from '@/utils/constants';
import useCancelableRequest from '@/utils/hook/useCancelableRequest';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { createSorter } from '@/utils/table';
import { ButtonProps, Form, Input } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './index.scss';

const OnsiteManagementPage = () => {
    const [filterForm] = Form.useForm();
    const navigation = useNavigate();
    const { showNotification } = useNotify();
    const getSignal = useCancelableRequest();
    const dispatch = useAppDispatch();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    // Filter: Show working onsite
    const filterParamsFromReduxWorking = selectSearchParamsRedux.onsiteManagementWorking.filter;
    const searchByKeywordFromReduxWorking = selectSearchParamsRedux.onsiteManagementWorking.searchByKeyword;
    const paginationTableFromReduxWorking = selectSearchParamsRedux.onsiteManagementWorking.paginationTable;
    // Filter: Show broken commitment
    const filterParamsFromReduxBroken = selectSearchParamsRedux.onsiteManagementBroken.filter;
    const searchByKeywordFromReduxBroken = selectSearchParamsRedux.onsiteManagementBroken.searchByKeyword;
    const paginationTableFromReduxBroken = selectSearchParamsRedux.onsiteManagementBroken.paginationTable;

    const { havePermission } = usePermissions('OnsiteManagementList', 'OnsiteManagement');

    const currentDate = dayjs();

    // #region Filter
    // Filter: Show working onsite or broken commitment
    const [isBrokenCommitment, setIsShowBrokenCommitment] = useState(filterParamsFromReduxWorking?.isBrokenCommitment || false);
    const filterSegmentedOptions = [
        {
            label: 'Working Onsite',
            value: false
        },
        {
            label: 'Broken Commitment',
            value: true
        }
    ];

    // Filter data
    const [keyword, setKeyword] = useState((isBrokenCommitment ? searchByKeywordFromReduxBroken : searchByKeywordFromReduxWorking) || '');
    const [filterData, setFilterData] = useState<IFilterData[]>([]);
    const [isLoadingFilter, setIsLoadingFilter] = useState(true);
    const [searchParams, setSearchParams] = useState(isBrokenCommitment ? filterParamsFromReduxBroken : filterParamsFromReduxWorking);
    const enabledSearch = ['badgeId', 'fullName', 'workEmail'];
    const keywordPlaceholder = 'Search by Badge ID, Full Name, Work Email';

    // Effect: Update filter data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingFilter(true);
            const res = await onsiteService.getAllIndexes();
            const onsiteIndexes = res.data;

            const companyOptions = onsiteIndexes?.companies?.map(company => ({
                label: company.companyName,
                value: company.companyId.toString()
            }));
            const unitData = remapUnits(onsiteIndexes?.units);
            const positionOptions = onsiteIndexes?.positions?.map(position => ({
                label: position.positionName,
                value: position.positionId.toString()
            }));
            const countryOptions = onsiteIndexes?.onsiteCountries?.map(country => ({
                label: country.countryName,
                value: country.onsiteCountryId.toString()
            }));
            const visaOptions = onsiteIndexes?.visaTypes?.map(visa => ({
                label: visa.visaTypeName,
                value: visa.visaTypeName
            }));

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
                    key: 'onsiteCountryIds',
                    label: 'Country',
                    forColumns: ['countryName'],
                    alwaysShow: true,
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={countryOptions || []}
                            placeholder="Select country"
                            searchPlaceholder="Search country"
                        />
                    )
                },
                {
                    key: 'cityNames',
                    label: 'City',
                    forColumns: ['cityName'],
                    alwaysShow: true,
                    control: <Input size="small" placeholder="Enter city" />
                },
                {
                    key: 'visaTypeNames',
                    label: 'Visa Type',
                    forColumns: ['visaTypeName'],
                    alwaysShow: true,
                    control: (
                        <BaseSelect
                            mode="multiple"
                            size="small"
                            options={visaOptions || []}
                            placeholder="Select visa type"
                            searchPlaceholder="Search visa type"
                        />
                    )
                },
                {
                    key: 'flightDepartureDate',
                    label: 'Flight Departure',
                    forColumns: ['flightDepartureDate'],
                    alwaysShow: true,
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromFlightDeparture" toName="toFlightDeparture" />
                },
                {
                    key: 'expectedEndDate',
                    label: 'Expected End',
                    forColumns: ['expectedEndDate'],
                    alwaysShow: true,
                    colSpan: 12,
                    control: <FilterDateRange fromName="fromExpectedEndDate" toName="toExpectedEndDate" />
                }
            ];

            setFilterData(newFilterData);
            setIsLoadingFilter(false);
        };

        fetchData();
    }, []);
    // #endregion Filter

    // #region Delete onsite
    const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
    const [deletedData, setDeletedData] = useState<IOnsite | null>(null);
    const deleteContent = (
        <>
            The onsite <strong>{deletedData?.fullName}</strong> - <strong>{deletedData?.badgeId}</strong> will be deleted. Are you sure you want to
            delete this onsite?
        </>
    );

    const onShowDeleteModal = (deleteData: IOnsite) => {
        setIsShowDeleteModal(true);
        setDeletedData(deleteData);
    };

    const onDeleteOnsite = async () => {
        const res = await onsiteService.deleteOnsite(deletedData?.onsiteFormId || 0);
        const { succeeded, message } = res;

        // Show notification
        showNotification(succeeded, message);
        setIsShowDeleteModal(false);
        setSearchParams({ ...searchParams });
    };

    // #endregion Delete onsite

    // #region Table
    const tableColumns: ColumnsType<IOnsite> = [
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
                    to={pathnames.hrManagement.onsiteManagement.detail.path + '/' + record.onsiteFormId}
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
            width: 183,
            sorter: createSorter('workEmail'),
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
            title: ORG_UNITS.DG,
            dataIndex: 'dgName',
            key: 'dgName',
            width: 129,
            sorter: createSorter('dgName'),
            render: item => renderWithFallback(item)
        },
        {
            title: ORG_UNITS.DC,
            dataIndex: 'dcName',
            key: 'dcName',
            width: 105,
            sorter: createSorter('dcName'),
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
            title: 'Position',
            dataIndex: 'positionName',
            key: 'positionName',
            width: 123,
            sorter: createSorter('positionName'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Country',
            dataIndex: 'countryName',
            key: 'countryName',
            width: 150,
            sorter: createSorter('countryName'),
            render: (item, record) => (
                <div className="country-status" style={{ color: record.countryColor }}>
                    <span className="status-dot" style={{ backgroundColor: record.countryColor }} />
                    {renderWithFallback(item)}
                </div>
            )
        },
        {
            title: 'City',
            dataIndex: 'cityName',
            key: 'cityName',
            width: 150,
            sorter: createSorter('cityName'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Visa Type',
            dataIndex: 'visaTypeName',
            key: 'visaTypeName',
            width: 150,
            sorter: createSorter('visaTypeName'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
            width: 150,
            render: item => renderWithFallback(item)
        },
        {
            title: 'Flight Departure',
            dataIndex: 'flightDeparture',
            key: 'flightDeparture',
            width: 150,
            sorter: createSorter('flightDeparture', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Expected End',
            dataIndex: 'expectedEndDate',
            key: 'expectedEndDate',
            width: 150,
            sorter: createSorter('expectedEndDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            title: 'Cash From TMA',
            dataIndex: 'cashFromTMA',
            key: 'cashFromTMA',
            width: 150,
            sorter: createSorter('cashFromTMA'),
            render: item => renderWithFallback(item)
        },
        ...(havePermission('Delete')
            ? [
                  {
                      title: 'Action',
                      key: 'action',
                      fixed: 'right' as const,
                      width: 100,
                      render: (record: IOnsite) => {
                          const { actualEndDate, expectedEndDate } = record;
                          // format date to compare
                          const newActualEndDate = dayjs(actualEndDate, TIME_FORMAT.VN_DATE);
                          const newExpectedEndDate = dayjs(expectedEndDate, TIME_FORMAT.VN_DATE);

                          return (
                              <ButtonsIcon
                                  items={[
                                      (() => {
                                          if (actualEndDate) {
                                              // Case 1 & 2: If actualEndDate exists
                                              if (currentDate.isAfter(newActualEndDate)) {
                                                  return undefined;
                                              }
                                          } else if (expectedEndDate) {
                                              // Case 3: If actualEndDate does not exist but expectedEndDate does
                                              if (currentDate.isAfter(newExpectedEndDate)) {
                                                  return undefined;
                                              }
                                          }

                                          return {
                                              icon: icons.tableAction.delete,
                                              iconAlt: 'Delete Onsite',
                                              onClick: () => onShowDeleteModal(record),
                                              tooltip: 'Delete'
                                          };
                                      })()
                                  ]}
                              />
                          );
                      }
                  }
              ]
            : [])
    ];

    // Showed columns
    const alwaysShowColumnNames = [
        'badgeId',
        'fullName',
        'workEmail',
        'companyName',
        'dgName',
        'dcName',
        'projectName',
        'positionName',
        'countryName',
        'cityName',
        'visaTypeName',
        'customer',
        'flightDeparture',
        'expectedEndDate',
        'cashFromTMA'
    ];

    // Data table
    const [isLoadingTable, setIsLoadingTable] = useState(true);
    const [dataTable, setDataTable] = useState<IOnsite[]>([]);

    // Effect: Update data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingTable(true);
            const signal = getSignal();

            try {
                const res = await onsiteService.searchOnsite({ ...searchParams, isBrokenCommitment }, signal);
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
    }, [searchParams, isBrokenCommitment]);
    // #endregion Table

    // #region ListManagement
    const pageTitle = pathnames.hrManagement.onsiteManagement.main.name;
    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.hrManagement.main.name },
        { title: pathnames.hrManagement.onsiteManagement.main.name }
    ];
    const buttons: ButtonProps[] = havePermission('Add') && [
        {
            type: 'primary',
            children: 'Add New Onsite',
            onClick: () => navigation(pathnames.hrManagement.onsiteManagement.add.path)
        }
    ];

    const quickFilter: IListManagementQuickFilter = {
        service: {
            getAll: onsiteService.getAllQuickFilter,
            create: onsiteService.createQuickFilter,
            update: onsiteService.updateQuickFilter,
            delete: onsiteService.deleteQuickFilter
        }
    };

    const { handlePageChange, setSearchByKeyword, showedColumns, updateShowedColumns } = useDataTableControls(
        isBrokenCommitment ? 'onsiteManagementBroken' : 'onsiteManagementWorking',
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
            onsiteManagementBroken: {
                filter: {
                    ...(isBrokenCommitment ? dataReduxSearchParams : filterParamsFromReduxBroken),
                    isBrokenCommitment
                }
            },
            onsiteManagementWorking: {
                filter: {
                    ...(isBrokenCommitment ? filterParamsFromReduxWorking : dataReduxSearchParams),
                    isBrokenCommitment
                }
            }
        };

        dispatch(searchParamsActions.setFilterParamsRedux(updatedParams));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, dispatch, isBrokenCommitment, filterData, filterForm]);

    useEffect(() => {
        let processedParams = {};
        isBrokenCommitment
            ? (processedParams = processFilterParams(filterParamsFromReduxBroken ?? {}))
            : (processedParams = processFilterParams(filterParamsFromReduxWorking ?? {}));

        // Set the processed values in the form
        filterForm.setFieldsValue(processedParams);
    }, [filterForm, isBrokenCommitment, filterParamsFromReduxBroken, filterParamsFromReduxWorking]);

    const isShowFilter = searchParams
        ? Object.keys(searchParams).some(key => {
              const typedKey = key as keyof IOnsiteManagementState;
              return typedKey !== 'isBrokenCommitment' && searchParams[typedKey] != null;
          })
        : false;

    const filter: IListManagementFilter<IOnsite> = {
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
            name: 'isBrokenCommitment',
            options: filterSegmentedOptions,
            value: isBrokenCommitment,
            onChange: value => {
                filterForm.resetFields();
                value
                    ? dispatch(searchParamsActions.resetPaginationParamsRedux('onsiteManagementBroken'))
                    : dispatch(searchParamsActions.resetPaginationParamsRedux('onsiteManagementWorking'));
                setIsShowBrokenCommitment(value);
                setSearchParams(value ? filterParamsFromReduxBroken : filterParamsFromReduxWorking);
            }
        },
        moreButtons: [
            havePermission('Export') && {
                name: 'exportFile',
                children: 'Export',
                fileName: 'Onsite List.xlsx',
                service: onsiteService.exportOnsite,
                onExport: (data: IOnsite[]) => ({ onsiteFormIds: data.map(item => item.onsiteFormId.toString()) })
            }
        ].filter(Boolean),
        onChangeData: setFilterData,
        onFilter: value => {
            setSearchParams(value);
        }
    };

    const getPaginationData = (isBrokenCommitment: boolean) => {
        const paginationData = isBrokenCommitment ? paginationTableFromReduxBroken : paginationTableFromReduxWorking;
        return {
            currentPage: paginationData?.currentPage || 1,
            pageSize: paginationData?.pageSize || 10
        };
    };

    const table: IListManagementTable<IOnsite> = {
        data: dataTable,
        loading: isLoadingTable,
        tableHeader: <TableNote />,
        columns: tableColumns,
        showedColumns: {
            data: showedColumns,
            onChange: updateShowedColumns
        },
        paginationTable: {
            ...getPaginationData(isBrokenCommitment),
            onChange: handlePageChange
        }
    };

    return (
        <>
            <ListManagement pageTitle={pageTitle} buttons={buttons} breadcrumb={breadcrumb} quickFilter={quickFilter} filter={filter} table={table} />
            <DialogCommon
                open={isShowDeleteModal}
                onClose={() => setIsShowDeleteModal(false)}
                icon={icons.dialog.delete}
                title="Delete Onsite"
                content={deleteContent}
                buttonType="default-danger"
                buttonLeftClick={() => setIsShowDeleteModal(false)}
                buttonRightClick={onDeleteOnsite}
            />
        </>
    );
};

export default OnsiteManagementPage;
