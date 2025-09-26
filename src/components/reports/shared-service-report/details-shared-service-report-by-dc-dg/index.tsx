import { useCallback, useEffect, useState } from 'react';
import { Button, DatePicker, Form, TableColumnType } from 'antd';
import dayjs from 'dayjs';
import DetailContent from '@/components/common/detail-management/detail-content';
import BaseTable from '@/components/common/table/table';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import { IDetailsByDcDg, ISharedServiceValues } from '@/types/reports/shared-service-report';
import { formatDataTable, formatNumberWithDecimalPlaces } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import { TIME_FORMAT } from '@/utils/constants';
import sharedServiceReport from '@/services/reports/shared-service-report';
import './index.scss';
import useLoading from '@/utils/hook/useLoading';

const DetailsByDcDg = () => {
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataReport, setDataReport] = useState<IDetailsByDcDg[]>([]);

    const generateDynamicColumns = (dataList: IDetailsByDcDg[]): TableColumnType<IDetailsByDcDg>[] => {
        const sharedServiceUnits = dataList[0]?.sharedServiceUnits || [];

        return sharedServiceUnits.map((unit, index) => ({
            key: unit.unitName,
            title: `${unit.unitName} (Man - Month)`,
            width: 150,
            align: 'center' as const, // 'as const' ensures 'center' is treated as a constant
            render: (record: IDetailsByDcDg) => formatNumberWithDecimalPlaces(record.sharedServiceUnits[index].billable)
        }));
    };

    const columns: TableColumnType<IDetailsByDcDg>[] = [
        {
            dataIndex: 'unitName',
            key: 'unitName',
            title: 'Shared Service Name',
            width: 150,
            align: 'center',
            render: value => renderWithFallback(value)
        },
        ...generateDynamicColumns(dataReport)
    ];

    const fetchData = useCallback(
        async (values: ISharedServiceValues) => {
            turnOnLoading();
            try {
                const { fromDate, toDate } = values;
                const response = await sharedServiceReport.getListDetailsByDcDg({
                    fromDate: fromDate.format(TIME_FORMAT.DATE),
                    toDate: toDate.format(TIME_FORMAT.DATE)
                });

                const { data, succeeded } = response;
                if (succeeded) {
                    setDataReport(formatDataTable(data));
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

    const rowClassName = (record: IDetailsByDcDg) => (record.isDG ? 'dg-row' : '');

    return (
        <DetailContent rootClassName="details-shared-service-report-by-dc-dg">
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
                    rowClassName={rowClassName}
                />
            </div>
        </DetailContent>
    );
};

export default DetailsByDcDg;
