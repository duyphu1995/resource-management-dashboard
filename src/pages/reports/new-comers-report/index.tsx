import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DatePicker from '@/components/common/form/date-picker';
import ReportFilter from '@/components/common/report-filter';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import newComersReportServices from '@/services/reports/new-comers-report';
import { IFilterData } from '@/types/filter';
import { INewComersReportsInformation } from '@/types/reports/new-comers-report';
import { ORG_UNITS, TIME_FORMAT } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Form, TableColumnType } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import './index.scss';
import usePermissions from '@/utils/hook/usePermissions';
import { formatDataTable } from '@/utils/common';

const NewComersReportPage = () => {
    const [filterForm] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const currentDay = dayjs(dayjs(), TIME_FORMAT.DATE);
    const date = dayjs();
    const currentYear = date?.year();
    const yearDisabled = (currentDate: dayjs.Dayjs) => (currentYear ? currentDate.year() > currentYear : false);

    // Add export Report button
    const [loadingReport, setLoadingReport] = useState<boolean>(false);
    const [data, setData] = useState<INewComersReportsInformation[]>([]);
    const [joinDate, setJoinDate] = useState<string>(currentDay.format(TIME_FORMAT.DATE));
    const { havePermission } = usePermissions('NewComersReportList', 'NewComersReport');

    const pageTitle = pathnames.reports.newComersReport.main.name;
    const breadcrumb: BreadcrumbItemType[] = [{ title: pathnames.reports.main.name }, { title: pageTitle }];

    const buttons: ButtonProps[] = havePermission('Export') && [
        { children: 'Export', onClick: () => handleGenerateReport(), loading: loadingReport, type: 'primary' }
    ];

    const handleGenerateReport = async () => {
        try {
            setLoadingReport(true);
            const res = await newComersReportServices.exportExcel(joinDate);
            if (res) {
                const url = window.URL.createObjectURL(new Blob([res]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'NewComersReport.xlsx');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            const message = 'Failed to download report';
            showNotification(false, message);
        } finally {
            setLoadingReport(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const response = await newComersReportServices.getTableData(joinDate);
                const { data, succeeded } = response;

                if (succeeded && data) {
                    setData(formatDataTable(data));
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [joinDate, turnOnLoading, turnOffLoading, showNotification]);

    const onResetFilter = () => {
        filterForm.setFieldValue('year', date);
        setJoinDate(currentDay.format(TIME_FORMAT.DATE));
    };

    const onFilter = (value: any) => {
        const inputDate = value.joinDate as dayjs.Dayjs;
        const dateFormatted = inputDate.format(TIME_FORMAT.DATE);
        setJoinDate(dateFormatted);
    };

    const filterData: IFilterData[] = [
        {
            key: 'joinDate',
            label: 'Joined Date',
            forColumns: [],
            show: true,
            initialValue: currentDay,
            control: (
                <DatePicker
                    allowClear={false}
                    disabledDate={yearDisabled}
                    value={filterForm.getFieldValue('year')}
                    minDate={dayjs(dayjs()).subtract(7, 'days')}
                    maxDate={dayjs(dayjs())}
                />
            )
        }
    ];

    const columns: TableColumnType<any>[] = [
        {
            key: 'badgeId',
            title: 'Badge Id',
            width: 80,
            fixed: 'left',
            render: (record: any) => renderWithFallback(record.badgeId)
        },
        {
            key: 'fullName',
            title: 'Full name',
            width: 200,
            fixed: 'left',
            render: (record: any) => renderWithFallback(record.fullName)
        },
        {
            key: 'workEmail',
            title: 'Email',
            width: 130,
            render: (record: any) => renderWithFallback(record.workEmail)
        },
        {
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 133,
            render: (record: any) => renderWithFallback(record.projectName)
        },
        {
            key: 'dcName',
            title: ORG_UNITS.DC,
            width: 100,
            render: (record: any) => renderWithFallback(record.dcName)
        },
        {
            key: 'dgName',
            title: ORG_UNITS.DG,
            width: 130,
            render: (record: any) => renderWithFallback(record.dgName)
        },
        {
            key: 'positionName',
            title: 'Position',
            width: 133,
            render: (record: any) => renderWithFallback(record.positionName)
        },
        {
            key: 'managerEmail',
            title: `Manager's Email`,
            width: 133,
            render: (record: any) => renderWithFallback(record.managerEmail)
        }
    ];

    return (
        <DetailContent>
            <div className="new-comers-report-container">
                <BaseBreadcrumb dataItem={breadcrumb} />
                <ReportFilter
                    loading={false}
                    pageTitle={pageTitle}
                    moreButtons={buttons}
                    data={filterData}
                    filterForm={filterForm}
                    onResetFilter={onResetFilter}
                    onFilter={onFilter}
                />
                <BaseTable
                    dataSource={data}
                    style={{ marginTop: 12 }}
                    columns={columns}
                    loading={isLoading}
                    pagination={false}
                    scroll={{ x: 'max-content', y: 449 }}
                />
            </div>
        </DetailContent>
    );
};

export default NewComersReportPage;
