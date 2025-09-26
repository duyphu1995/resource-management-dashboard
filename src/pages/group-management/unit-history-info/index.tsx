import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import TreeSelect from '@/components/common/form/tree-select';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import ReportFilter from '@/components/common/report-filter';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import UnitService from '@/services/group-management/unit';
import { IFilterData } from '@/types/filter';
import { IUnitNode } from '@/types/group-management/group-management';
import { IUnitHistoryInfo } from '@/types/group-management/unit-history-info';
import { formatDataTable, remapUnits } from '@/utils/common';
import { ORG_UNITS, TIME_FORMAT } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { Form, TableColumnType } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export interface ITableUnitHistoryInfo {
    time: string;
    byPeople: string;
    managedBy: string;
    fieldName: string;
    from: string;
    to: string;
    unitName: string;
    unitTypeName: string;
    programName: string;
    dcName: string;
    dgName: string;
    buName: string;
    action: string;
}

const UnitHistoryInfoPage = () => {
    const { unitId = '' } = useParams();
    const [filterForm] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IUnitHistoryInfo[]>([]);
    const [detailUnit, setDetailUnit] = useState<IUnitNode>();
    const [allOptions, setAllOptions] = useState<any>([]);
    const [searchParams, setSearchParams] = useState<any>(null);

    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.home.name },
        { title: pathnames.groupManagement.main.name, path: pathnames.groupManagement.main.path },
        { title: pathnames.groupManagement.unitHistoryInfo.main.name }
    ];

    const filterData: IFilterData[] = [
        {
            key: 'unit',
            label: 'Select Unit',
            forColumns: [],
            show: true,
            control: (
                <TreeSelect
                    size="middle"
                    multiple={false}
                    placeholder="Select unit"
                    treeData={allOptions}
                    searchPlaceholder="Search unit"
                    treeDefaultExpandAll
                    rootClassName="tree-select-parent-unit"
                    style={{ maxHeight: '30px' }}
                />
            )
        },
        {
            key: 'date',
            label: 'Date',
            forColumns: [],
            show: true,
            control: <FilterDateRange fromName="fromDate" toName="toDate" allowClear={false} />,
            colSpan: 10
        }
    ];

    const pageTitle = `Historical Information Of Unit ${detailUnit?.unitName}`;

    //get data unit by Id
    useEffect(() => {
        const getDataUnitById = async () => {
            const newId = searchParams?.unit || unitId;

            if (newId) {
                const res = await UnitService.getUnitById(newId);
                const { data, succeeded } = res;

                if (succeeded && data) setDetailUnit(data);
            }
        };

        if (searchParams?.unit || unitId) getDataUnitById();
    }, [unitId, searchParams?.unit]);

    //get all options for select unit
    useEffect(() => {
        const fetchDataOptionsUnit = async () => {
            const res = await UnitService.getAllIndex();
            const { data, succeeded } = res;
            const unitDataOptions = data ? remapUnits(data.unitBasicDtos) : [];

            if (succeeded && unitDataOptions) setAllOptions(unitDataOptions);
        };

        fetchDataOptionsUnit();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();

            try {
                let rangeDate = {};
                if (searchParams) {
                    rangeDate = {
                        unitIds: [searchParams.unit],
                        fromDate: searchParams.fromDate,
                        toDate: searchParams.toDate
                    };
                } else {
                    rangeDate = {
                        unitIds: [unitId],
                        fromDate: dayjs().startOf('month').format(TIME_FORMAT.DATE),
                        toDate: dayjs().format(TIME_FORMAT.DATE)
                    };

                    filterForm.setFieldsValue({
                        unit: unitId,
                        date: {
                            fromDate: dayjs().startOf('month'),
                            toDate: dayjs()
                        }
                    });
                }

                if (rangeDate) {
                    const res = await UnitService.searchUnitHistoryInfo(rangeDate);
                    const { data, succeeded } = res;

                    if (succeeded && data) {
                        setData(data.map((item: any, index) => ({ ...item, key: index })));
                    }
                }
            } catch (error) {
                showNotification(false, 'Error fetching unit history info');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [filterForm, searchParams, unitId, turnOnLoading, turnOffLoading, showNotification]);

    // Handle reset filter
    const onResetFilter = () => {
        setSearchParams({
            fromDate: dayjs().startOf('month').format(TIME_FORMAT.DATE),
            toDate: dayjs().format(TIME_FORMAT.DATE),
            unit: unitId
        });

        filterForm.setFieldsValue({
            unit: unitId,
            date: {
                fromDate: dayjs().startOf('month'),
                toDate: dayjs()
            }
        });
    };

    // Handle filter
    const onFilter = (value: any) => {
        setSearchParams(value);
    };

    const columns: TableColumnType<ITableUnitHistoryInfo>[] = [
        {
            dataIndex: 'time',
            key: 'time',
            title: 'Date',
            width: 120,
            fixed: 'left',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'unitName',
            key: 'unitName',
            title: 'Unit',
            width: 80,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'unitTypeName',
            key: 'unitTypeName',
            title: 'Type',
            width: 80,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'managedBy',
            key: 'managedBy',
            title: 'Manager',
            width: 100,
            render: item => renderWithFallback(item)
        },
        {
            key: 'group',
            title: `Group (${ORG_UNITS.DG}/${ORG_UNITS.DC}/${ORG_UNITS.Program})`,
            width: 120,
            render: (record: ITableUnitHistoryInfo) => {
                const dgName = record?.dgName ? record.dgName.trim() : '';
                const dcName = record?.dcName ? record.dcName.trim() : '';
                const programName = record?.programName ? record.programName.trim() : '';

                // Define colors
                const colors = {
                    dgNameColor: '#004499',
                    dcNameColor: '#c31e3d',
                    programNameColor: '#9a2bd2'
                };

                // Construct the styled group
                const elements: React.ReactNode[] = [
                    dgName && (
                        <span key="dg" style={{ color: colors.dgNameColor }}>
                            {dgName}
                        </span>
                    ),
                    dcName && (
                        <span key="dc" style={{ color: colors.dcNameColor }}>
                            {dcName}
                        </span>
                    ),
                    programName && (
                        <span key="program" style={{ color: colors.programNameColor }}>
                            {programName}
                        </span>
                    )
                ];

                // Join the elements with '/' separator, making sure to filter out any `false` values
                const group = elements.filter(Boolean).reduce((prev, curr, index) => (index === 0 ? curr : [prev, '/', curr]), null) || '';

                // Render with fallback
                return renderWithFallback(group);
            }
        },
        {
            dataIndex: 'byPeople',
            key: 'byPeople',
            title: 'Author',
            width: 60,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'action',
            key: 'action',
            title: 'Action',
            width: 80,
            render: item => renderWithFallback(item)
        },
        {
            key: 'detail',
            title: 'Detail',
            width: 180,
            render: (record: ITableUnitHistoryInfo) => {
                const { fieldName, from, to } = record;
                const strongFieldName = <strong>{fieldName || ''}</strong>;

                return renderWithFallback(
                    <>
                        {strongFieldName} from {from || ''} to {to || ''}
                    </>
                );
            }
        }
    ];

    return (
        <DetailContent>
            <div className="unit-history-container">
                <BaseBreadcrumb dataItem={breadcrumb} />
                <ReportFilter
                    pageTitle={pageTitle}
                    loading={false}
                    data={filterData}
                    filterForm={filterForm}
                    onResetFilter={onResetFilter}
                    onFilter={onFilter}
                />
                <BaseTable dataSource={formatDataTable(data)} style={{ marginTop: 12 }} columns={columns} loading={isLoading} />
            </div>
        </DetailContent>
    );
};

export default UnitHistoryInfoPage;
