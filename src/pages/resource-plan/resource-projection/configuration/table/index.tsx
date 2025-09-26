import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import { IConfigurationTableProps, IResourceProjectionConfiguration } from '@/types/resource-plan/resource-projection/resource-projection';
import { Form, InputNumber, TableColumnsType } from 'antd';
import './index.scss';
import { useEffect } from 'react';

const ResourceProjectionConfigurationTable = ({ form, dataTable, isEditing }: IConfigurationTableProps) => {
    const renderFormItem = (name: string, unitId: number, initialValue: any, rules: any[]) => (
        <Form.Item name={[name, unitId]} initialValue={initialValue} rules={rules}>
            <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
    );

    useEffect(() => {
        const newValues = {
            targetNonBillableRatio: {},
            targetBillableQuarter1: {},
            targetBillableQuarter2: {},
            targetBillableQuarter3: {},
            targetBillableQuarter4: {}
        };
        dataTable.forEach(unit => {
            newValues[`targetNonBillableRatio`] = {
                ...newValues[`targetNonBillableRatio`],
                [unit.unitId]: unit.targetNonBillableRatio
            };
            newValues[`targetBillableQuarter1`] = {
                ...newValues[`targetBillableQuarter1`],
                [unit.unitId]: unit.targetBillableQuarter1
            };
            newValues[`targetBillableQuarter2`] = {
                ...newValues[`targetBillableQuarter2`],
                [unit.unitId]: unit.targetBillableQuarter2
            };
            newValues[`targetBillableQuarter3`] = {
                ...newValues[`targetBillableQuarter3`],
                [unit.unitId]: unit.targetBillableQuarter3
            };
            newValues[`targetBillableQuarter4`] = {
                ...newValues[`targetBillableQuarter4`],
                [unit.unitId]: unit.targetBillableQuarter4
            };
        });

        form.setFieldsValue(newValues);
    }, [dataTable, form]);

    const columns: TableColumnsType<IResourceProjectionConfiguration> = [
        {
            key: 'unit',
            title: 'Unit',
            width: 40,
            render: record => renderWithFallback(record?.unit),
            onHeaderCell: () => ({ className: 'config-table-header-column' })
        },
        {
            key: 'targetNonBillableRatio',
            title: 'Target %NBR (%)',
            width: 50,
            align: 'center',
            render: record =>
                isEditing
                    ? renderFormItem('targetNonBillableRatio', record.unitId, record.targetNonBillableRatio, [
                          { required: true, message: 'Please input target %NBR' },
                          {
                              pattern: /^(100(\.0+)?%?|([1-9]?\d)(\.\d+)?%?)$/,
                              message: 'Please enter a value less than or equal to 100'
                          }
                      ])
                    : renderWithFallback(record?.targetNonBillableRatio + '%'),
            onHeaderCell: () => ({ className: 'config-table-header-column' })
        },
        {
            title: 'Target #Billable',
            children: [1, 2, 3, 4].map(quarter => ({
                key: `targetBillableQuarter${quarter}`,
                title: `Quarter ${quarter}`,
                width: 80,
                render: record =>
                    isEditing
                        ? renderFormItem(`targetBillableQuarter${quarter}`, record.unitId, record[`targetBillableQuarter${quarter}`], [
                              { required: true, message: 'Please input target %NBR' },
                              {
                                  validator: (_: any, value: string) =>
                                      value && value.length > 6 ? Promise.reject('Please enter no more than 5 characters') : Promise.resolve()
                              }
                          ])
                        : renderWithFallback(record[`targetBillableQuarter${quarter}`])
            })),
            className: 'config-target-billable-column'
        }
    ];

    const modifiedHeaderRow = () => ({ className: 'config-row-index' });

    const rowClassNameHighlight = (record: IResourceProjectionConfiguration, index: number) => {
        if (record?.isDG) return 'group-department-row';
        if (index === 0) return 'highest-root-unit';
        return 'table-row-light';
    };

    return (
        <div className="resource-projection-configuration-table">
            <BaseTable
                dataSource={dataTable}
                columns={columns}
                rowClassName={rowClassNameHighlight}
                onHeaderRow={modifiedHeaderRow}
                pagination={false}
                bordered
            />
        </div>
    );
};

export default ResourceProjectionConfigurationTable;
