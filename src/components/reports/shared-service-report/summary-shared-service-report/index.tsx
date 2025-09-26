import { useCallback, useEffect, useState } from 'react';
import { Button, DatePicker, Form, TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import DetailContent from '@/components/common/detail-management/detail-content';
import BaseTable from '@/components/common/table/table';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import { ISummarySharedServiceReport, ISharedServiceValues } from '@/types/reports/shared-service-report';
import { formatDataTable, formatNumberWithDecimalPlaces } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import { TIME_FORMAT } from '@/utils/constants';
import sharedServiceReport from '@/services/reports/shared-service-report';
import useLoading from '@/utils/hook/useLoading';
import './index.scss';

const SummarySharedServiceReport = () => {
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataReport, setDataReport] = useState<ISummarySharedServiceReport[]>([]);

    const generateDynamicColumns = (dataList: ISummarySharedServiceReport[]) => {
        const sharedServices = dataList[0]?.sharedServices || [];

        return (
            sharedServices.map(({ week, year }, index) => {
                const titleContent = (
                    <p className="title-column">
                        W{week} - {year} <br /> (Man-Week)
                    </p>
                );

                const childColumns = [
                    {
                        key: 'effortWeek',
                        title: 'Effort',
                        width: 100,
                        align: 'center' as const,
                        render: (value: ISummarySharedServiceReport) => formatNumberWithDecimalPlaces(value?.sharedServices[index]?.effort)
                    },
                    {
                        key: 'billableWeek',
                        title: 'Billable',
                        width: 100,
                        align: 'center' as const,
                        render: (value: ISummarySharedServiceReport) => formatNumberWithDecimalPlaces(value?.sharedServices[index]?.billable)
                    }
                ];

                return {
                    key: `week${index}`,
                    title: titleContent,
                    width: 200,
                    children: childColumns
                };
            }) || []
        );
    };

    const columns: TableColumnsType<ISummarySharedServiceReport> = [
        {
            key: 'sharedServiceName',
            dataIndex: 'sharedServiceName',
            title: 'Shared Service Name',
            width: 200,
            fixed: 'left',
            render: value => renderWithFallback(value)
        },
        ...generateDynamicColumns(dataReport),
        {
            key: 'sharedServiceSummary',
            title: (
                <p className="title-column">
                    Summary <br /> (Man-Month)
                </p>
            ),
            width: 200,
            children: [
                {
                    key: 'effortSummary',
                    title: 'Effort',
                    width: 100,
                    align: 'center',
                    render: value => formatNumberWithDecimalPlaces(value?.sharedServiceSummary?.effort)
                },
                {
                    key: 'billableSummary',
                    title: 'Billable',
                    width: 100,
                    align: 'center',
                    render: value => formatNumberWithDecimalPlaces(value?.sharedServiceSummary?.billable)
                }
            ]
        }
    ];

    const fetchData = useCallback(
        async (values: ISharedServiceValues) => {
            turnOnLoading();

            try {
                const { fromDate, toDate } = values;
                const response = await sharedServiceReport.getListSummarySharedService({
                    fromDate: fromDate.format(TIME_FORMAT.DATE),
                    toDate: toDate.format(TIME_FORMAT.DATE)
                });

                const { data, succeeded } = response;
                if (succeeded) {
                    setDataReport(formatDataTable(data || []));
                }
            } catch (error) {
                showNotification(false, 'Fetched data failed');
            } finally {
                turnOffLoading();
            }
        },
        [showNotification, turnOnLoading, turnOffLoading]
    );

    useEffect(() => {
        fetchData(form.getFieldsValue());
    }, [fetchData, form]);

    return (
        <DetailContent rootClassName="summary-shared-service-report">
            <Form form={form} onFinish={fetchData} className="shared-service-report__filter">
                <Form.Item label="From" name="fromDate" initialValue={dayjs().startOf('year')}>
                    <DatePicker format={TIME_FORMAT.US_DATE} allowClear={false} />
                </Form.Item>
                <Form.Item label="To" name="toDate" initialValue={dayjs()}>
                    <DatePicker format={TIME_FORMAT.US_DATE} allowClear={false} />
                </Form.Item>
                <Button htmlType="submit" type="primary">
                    Search
                </Button>
            </Form>
            <div className="shared-service-report__table">
                <BaseTable
                    dataSource={formatDataTable(dataReport)}
                    columns={columns}
                    loading={isLoading}
                    pagination={false}
                    scroll={{ x: 'max-content', y: 649 }}
                    bordered
                />
            </div>
        </DetailContent>
    );
};

export default SummarySharedServiceReport;
