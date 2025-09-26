import BaseSelect from '@/components/common/form/select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import headcountReportServices from '@/services/reports/headcount';
import { ISharedServiceDetailsTable } from '@/types/reports/headcount-report';
import { formatDataTable, remapUnits } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { Form, TableColumnType } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useCallback, useEffect, useState } from 'react';

export const SharedServiceDetailsReport = ({ reloadSharedServiceDetails }: { reloadSharedServiceDetails: object }) => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [unitIdSelected, setUnitIdSelected] = useState<string>('0');
    const [reportData, setReportData] = useState<ISharedServiceDetailsTable[]>([]);
    const [businessUnitOptions, setBusinessUnitOptions] = useState<DefaultOptionType[]>([]);

    const columns: TableColumnType<ISharedServiceDetailsTable>[] = [
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: 'BU',
            width: 150,
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: 'DC',
            width: 150,
            render: (value, record) => (record.isGroupHeader ? '' : renderWithFallback(value))
        },
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: 'Working Place',
            width: 150,
            render: (value, record) => (record.isGroupHeader ? '' : renderWithFallback(value))
        },
        {
            dataIndex: 'effort',
            key: 'effort',
            title: 'HC',
            width: 150,
            align: 'center',
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'billable',
            key: 'billable',
            title: 'Billable',
            width: 150,
            align: 'center',
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'nonBillable',
            key: 'nonBillable',
            title: 'Backup',
            width: 130,
            align: 'center',
            render: value => renderWithFallback(value)
        }
    ];

    useEffect(() => {
        const fetchBusinessUnitOptions = async () => {
            turnOnLoading();
            try {
                const response = await headcountReportServices.getUnitsSelectedSharedServicesSummary();
                const { data, succeeded } = response;

                if (succeeded) {
                    setBusinessUnitOptions([{ label: 'All', value: '0' }, ...remapUnits(data)]);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch business unit options.');
            } finally {
                turnOffLoading();
            }
        };

        fetchBusinessUnitOptions();
    }, [showNotification, turnOnLoading, turnOffLoading, reloadSharedServiceDetails]);

    const fetchData = useCallback(
        async (values?: string) => {
            const isExistsUnitId = businessUnitOptions.find(unit => unit.value === values);
            if (!isExistsUnitId) {
                setUnitIdSelected('0');
            }

            turnOnLoading();
            try {
                const response = await headcountReportServices.getSharedServiceDetails({ unitId: isExistsUnitId ? values : '0' });
                const { data, succeeded } = response;

                if (succeeded) {
                    const sortedData = [...(data || [])].sort((a, b) => b.week - a.week);

                    const groupedData: ISharedServiceDetailsTable[] = [];
                    let currentWeek: number | null = null;
                    let totalEffort = 0;
                    let totalBillable = 0;
                    let totalNonBillable = 0;

                    sortedData.forEach(record => {
                        if (record.week !== currentWeek) {
                            if (currentWeek !== null) {
                                const index = groupedData.findIndex(item => item.week === currentWeek);
                                groupedData.splice(index, 0, {
                                    isGroupHeader: true,
                                    dgName: `W${currentWeek} Summary`,
                                    effort: totalEffort,
                                    billable: totalBillable,
                                    nonBillable: totalNonBillable,
                                    week: currentWeek
                                });
                            }

                            currentWeek = record.week;
                            totalEffort = 0;
                            totalBillable = 0;
                            totalNonBillable = 0;
                        }

                        totalEffort += record.effort || 0;
                        totalBillable += record.billable || 0;
                        totalNonBillable += record.nonBillable || 0;
                        groupedData.push(record);
                    });

                    if (currentWeek !== null) {
                        const index = groupedData.findIndex(item => item.week === currentWeek);
                        groupedData.splice(index, 0, {
                            isGroupHeader: true,
                            dgName: `W${currentWeek} Summary`,
                            effort: totalEffort,
                            billable: totalBillable,
                            nonBillable: totalNonBillable,
                            week: currentWeek
                        });
                    }

                    setReportData(formatDataTable(groupedData));
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch shared service details report.');
            } finally {
                turnOffLoading();
            }
        },
        [showNotification, turnOnLoading, turnOffLoading, businessUnitOptions]
    );

    useEffect(() => {
        if (businessUnitOptions.length > 0) {
            fetchData();
        }
    }, [fetchData, businessUnitOptions]);

    const rowClassName = (record: ISharedServiceDetailsTable) => {
        if (record.isSharedService) return 'column-shared-service';
        if (record.isGroupHeader) return 'column-group-header';
        return '';
    };

    const handleChangeUnitId = (value: string) => {
        setUnitIdSelected(value);
        fetchData(value);
    };

    return (
        <div className="shared-service-details">
            <div className="shared-service-details__business-unit">
                <Form.Item label="Select Business Unit:">
                    <BaseSelect
                        options={businessUnitOptions}
                        defaultValue="0"
                        filterSort={() => 0}
                        onChange={handleChangeUnitId}
                        allowClear={false}
                        value={unitIdSelected}
                    />
                </Form.Item>
            </div>
            <BaseTable dataSource={reportData} columns={columns} rowClassName={rowClassName} loading={isLoading} pagination={false} bordered />
        </div>
    );
};
