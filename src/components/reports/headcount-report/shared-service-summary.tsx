import TreeSelect from '@/components/common/form/tree-select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import headcountReportServices from '@/services/reports/headcount';
import reportService from '@/services/reports/report';
import { ISharedServiceSummaryTable } from '@/types/reports/headcount-report';
import { IDepartmentUnit } from '@/types/reports/report';
import { formatDataTable, formatNumberWithDecimalPlaces, remapUnits } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { Button, Form, Spin, TableColumnType } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

export const SharedServiceSummaryReport = ({ setReloadSharedServiceDetails }: { setReloadSharedServiceDetails: (value: any) => void }) => {
    const [filterForm] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [reportData, setReportData] = useState<ISharedServiceSummaryTable[]>([]);
    const [businessUnitOptions, setBusinessUnitOptions] = useState<IDepartmentUnit[]>([]);

    const columns: TableColumnType<ISharedServiceSummaryTable>[] = [
        {
            dataIndex: 'unitName',
            key: 'unitName',
            title: 'Department Name',
            width: 150,
            align: 'center',
            fixed: 'left',
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'hcInDept',
            key: 'hcInDept',
            title: 'HC (Working in Dept.)',
            width: 150,
            align: 'center',
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'billableInDept',
            key: 'billableInDept',
            title: 'Billable (Working in Dept.)',
            width: 150,
            align: 'center',
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'hcOutDept',
            key: 'hcOutDept',
            title: 'HC (Working out Dept.)',
            width: 150,
            align: 'center',
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'billableOutDept',
            key: 'billableOutDept',
            title: 'Billable (Working out Dept.)',
            width: 150,
            align: 'center',
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'totalHeadCount',
            key: 'totalHeadCount',
            title: 'Total HC',
            width: 130,
            align: 'center',
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'totalBillable',
            key: 'totalBillable',
            title: 'Total Billable',
            width: 130,
            align: 'center',
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'totalNonBillable',
            key: 'totalNonBillable',
            title: 'Total Backup',
            width: 130,
            align: 'center',
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'totalNonBillableRatio',
            key: 'totalNonBillableRatio',
            title: 'NBR (%) ',
            width: 130,
            align: 'center',
            render: value => `${renderWithFallback(formatNumberWithDecimalPlaces(value))}%`
        }
    ];

    const rowClassName = (record: ISharedServiceSummaryTable) => (record.unitName === 'Department Total' ? 'shared-service-summary__total-row' : '');

    const fetchData = useCallback(async () => {
        turnOnLoading();
        try {
            const response = await headcountReportServices.getSharedServiceSummary();
            const { data } = response;

            setReportData(formatDataTable(data) || []);
        } catch (error) {
            showNotification(false, 'Failed to fetch shared service summary report.');
        } finally {
            turnOffLoading();
        }
    }, [showNotification, turnOffLoading, turnOnLoading]);

    const handleSubmitBusinessUnits = useCallback(
        async (values: { unitIds: number[] }) => {
            turnOnLoading();
            try {
                const response = await headcountReportServices.updateUnitsSelectedSharedServices(values.unitIds?.map(unitId => Number(unitId)));
                const { succeeded } = response;

                if (succeeded) {
                    fetchData();
                    setReloadSharedServiceDetails({});
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch shared service summary report.');
            } finally {
                turnOffLoading();
            }
        },
        [showNotification, turnOffLoading, turnOnLoading, fetchData, setReloadSharedServiceDetails]
    );

    useEffect(() => {
        const fetchUnitsSelected = async () => {
            turnOnLoading();
            try {
                const responseUnits = await headcountReportServices.getUnitsSelectedSharedServicesSummary();
                const { data: units, succeeded } = responseUnits;
                if (succeeded) {
                    const values = units?.map(unit => unit.unitId.toString());
                    filterForm.setFieldValue('unitIds', values);
                    fetchData();
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch units selected for shared service summary report.');
            } finally {
                turnOffLoading();
            }
        };

        const fetchBusinessUnitOptions = async () => {
            turnOnLoading();
            try {
                const response = await reportService.getAllIndexes();
                const { data, succeeded } = response;

                if (succeeded) {
                    setBusinessUnitOptions(data?.departmentUnits || []);
                    fetchUnitsSelected();
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch business unit options.');
            } finally {
                turnOffLoading();
            }
        };

        fetchBusinessUnitOptions();
    }, [fetchData, showNotification, filterForm, turnOffLoading, turnOnLoading]);

    return (
        <div className="shared-service-summary">
            <Spin spinning={isLoading}>
                <Form form={filterForm} className="shared-service-summary__business-unit" onFinish={handleSubmitBusinessUnits}>
                    <Form.Item label="Select Business Unit::" name="unitIds">
                        <TreeSelect
                            placeholder="Select business unit"
                            multiple
                            showSearch
                            treeData={remapUnits(businessUnitOptions)}
                            treeCheckable={false}
                            showSelectAll={false}
                        />
                    </Form.Item>
                    <Button htmlType="submit">Save</Button>
                </Form>
                <p className="headcount-common__time">This report is generated for week: {dayjs().week() - 1}</p>
                <BaseTable dataSource={reportData} columns={columns} pagination={false} rowClassName={rowClassName} bordered scroll={{ x: 1800 }} />
            </Spin>
        </div>
    );
};
