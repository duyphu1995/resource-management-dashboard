import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import BaseSelect from '@/components/common/form/select';
import ReportFilter from '@/components/common/report-filter';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import monthlyDeliveryStatisticReportService from '@/services/reports/monthly-delivery-statistic-report';
import { IFilterData } from '@/types/filter';
import { dateMappings, downloadFile, formatDataTableFromOne } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { createSorter } from '@/utils/table';
import { ButtonProps, Form, TableColumnType } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ResignationList = () => {
    const { id } = useParams();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const queryParams = new URLSearchParams(window.location.search);
    const month = queryParams.get('month');
    const year = queryParams.get('year');
    const positionId = queryParams.get('position');

    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.reports.main.name },
        { title: pathnames.reports.monthlyDeliveryStatisticReport.main.name },
        { title: pathnames.reports.monthlyDeliveryStatisticReport.resignationList.name }
    ];

    const pageTitle = `REPORT LIST FOR RESIGNATION OF ${month && dateMappings[parseInt(month, 10)]?.toLocaleUpperCase()} ${year}`;

    const [dataTable, setDataTable] = useState<any[]>([]);
    const [isExportLoading, setIsExportLoading] = useState(false);

    const [filterForm] = Form.useForm();
    const [filterData, setFilterData] = useState<IFilterData[]>([]);
    const [isLoadingFilter, setIsLoadingFilter] = useState(false);
    const [searchParams, setSearchParams] = useState<any>({
        dgId: id === 'null' ? undefined : id,
        positionId: positionId ?? undefined
    });

    // Handle reset filter
    const onResetFilter = () => {
        setIsLoadingFilter(true);
        const dataFilterForm = filterForm.setFieldsValue({ dgId: id === 'null' ? undefined : id, positionId });
        setSearchParams(dataFilterForm);
        setIsLoadingFilter(false);
    };

    // Handle filter
    const onFilter = () => {
        const dataFilterForm = filterForm.getFieldsValue();
        removeAllOption(dataFilterForm);
        setSearchParams(dataFilterForm);
    };

    // Remove 'all' option from filter parameters
    const removeAllOption = (filterData: any) => {
        if (filterData.dgId === 'all') delete filterData.dgId;
        if (filterData.positionId === 'all') delete filterData.positionId;
    };

    const onExport = async () => {
        try {
            setIsExportLoading(true);
            const res = await monthlyDeliveryStatisticReportService.export({ ...searchParams, month, year });

            downloadFile(res, 'Resignation List Report.xlsx');
            showNotification(true, 'Export report successfully');
        } catch {
            showNotification(false, 'Export report failed');
        } finally {
            setIsExportLoading(false);
        }
    };

    const moreButtons: ButtonProps[] = [{ children: 'Export', type: 'primary', loading: isExportLoading, onClick: onExport }];

    const columnsTable: TableColumnType<any>[] = [
        {
            dataIndex: 'key',
            key: 'key',
            title: 'No.',
            width: 71,
            fixed: 'left',
            sorter: createSorter('key', 'number')
        },
        {
            dataIndex: 'badgeId',
            key: 'badgeId',
            title: 'Badge ID',
            width: 109,
            fixed: 'left',
            sorter: createSorter('badgeId'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fullName',
            title: 'Full Name',
            width: 300,
            fixed: 'left',
            sorter: createSorter('fullName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'joinDate',
            title: 'Joined date',
            width: 150,
            sorter: createSorter('joinDate', 'date'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'projectName',
            title: ORG_UNITS.Project,
            width: 200,
            sorter: createSorter('projectName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcName',
            title: ORG_UNITS.DC,
            width: 200,
            sorter: createSorter('dcName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dgName',
            title: ORG_UNITS.DG,
            width: 130,
            sorter: createSorter('dgName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'positionName',
            title: 'Position',
            width: 200,
            sorter: createSorter('positionName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'grade',
            title: 'Grade',
            width: 100,
            sorter: createSorter('grade'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'applyDate',
            title: 'Submitted date',
            width: 150,
            sorter: createSorter('applyDate', 'date'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'resignDate',
            title: 'Resigned date',
            width: 150,
            sorter: createSorter('resignDate', 'date'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'reason',
            title: 'Reason',
            width: 150,
            sorter: createSorter('reason'),
            render: item => renderWithFallback(item)
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingFilter(true);
            const res = await monthlyDeliveryStatisticReportService.getAllIndex();
            const { data } = res;

            const dgOptions = [
                { label: 'All', value: 'all' },
                ...(data?.dgIndexDto ?? []).map(item => ({
                    label: item.name,
                    value: item.id.toString()
                }))
            ];

            const positionOptions = [
                { label: 'All', value: 'all' },
                ...(data?.positionIndexDto ?? []).map(item => ({
                    label: item.name,
                    value: item.id.toString()
                }))
            ];

            const newFilterData: IFilterData[] = [
                {
                    key: 'dgId',
                    label: `${ORG_UNITS.DG}/Group`,
                    forColumns: [],
                    show: true,
                    control: <BaseSelect placeholder={`Select ${ORG_UNITS.DG}/Group`} size="small" options={dgOptions} />
                },
                {
                    key: 'positionId',
                    label: 'Position',
                    forColumns: [],
                    show: true,
                    control: <BaseSelect placeholder="Select position" size="small" options={positionOptions} />
                }
            ];

            setFilterData(newFilterData);
            setIsLoadingFilter(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await monthlyDeliveryStatisticReportService.getResignationList({ ...searchParams, month, year });
            const { data, succeeded } = res;

            if (succeeded && data) {
                setDataTable(data);
            }
            turnOffLoading();
        };

        fetchData();
    }, [searchParams, month, year, turnOnLoading, turnOffLoading]);

    useEffect(() => {
        filterForm.setFieldsValue({
            dgId: id === 'null' ? undefined : id,
            positionId: positionId ?? undefined
        });
    }, []);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumb} />
            <ReportFilter
                pageTitle={pageTitle}
                loading={isLoadingFilter}
                data={filterData}
                filterForm={filterForm}
                onResetFilter={onResetFilter}
                onFilter={onFilter}
                moreButtons={moreButtons}
            />

            <BaseTable dataSource={formatDataTableFromOne(dataTable)} style={{ marginTop: 12 }} columns={columnsTable} loading={isLoading} />
        </DetailContent>
    );
};

export default ResignationList;
