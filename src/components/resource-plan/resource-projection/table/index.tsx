import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import resourceProjectionServices from '@/services/resource-plan/resource-projection';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';
import { IFormatResourceProjection, IResourceProjectionInformation } from '@/types/resource-plan/resource-projection/resource-projection';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { Button, Flex, Form, Input, Modal, TableColumnType, TableColumnsType, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import ResourceProjectionItems, { IResourceProjectionItemOverview } from './overview-items/resource-projection-item';

interface Props {
    title: string;
    unitId: string;
    currentUnit: IEmployeeUnit;
    unitTypeName?: string;
    setReloadAPIChart: (params: object) => void;
}

const ResourceProjectionTable = ({ title, unitId, unitTypeName, currentUnit, setReloadAPIChart }: Props) => {
    const [formTable] = Form.useForm();
    const [formNote] = Form.useForm();
    const navigation = useNavigate();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const currentMonth = dayjs().month() + 1;
    const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const disableEdit: string[] = ['headcount', 'billable', 'nonBillableRatio'];

    const [columns, setColumns] = useState<TableColumnType<any>[]>([]);
    const [dataTable, setDataTable] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [monthNoteSelected, setMonthNoteSelected] = useState<string | null>();

    const [data, setData] = useState<IResourceProjectionInformation | null>(null);
    const [isReloadAPI, setIsReloadAPI] = useState({});

    const { havePermission } = usePermissions('ResourceProjectionList', 'ResourceProjection');

    const resourceProjectionItems: IResourceProjectionItemOverview[] = [
        { value: data?.totalBillableAddRemove, label: 'Total Billable added/removed' },
        { value: data?.totalResignation, label: 'Total Resignation' },
        { value: data?.totalResourceRotation, label: 'Total Resource Rotation' },
        { value: data?.totalJobOffered, label: 'Total Job Offered' }
    ];

    const RESOURCE_PROJECTION_TABLE_FACTORS_COLUMNS = [
        { key: 'billableAddRemove', title: '#Billable Added/Removed' },
        { key: 'resignation', title: '#Resignation' },
        { key: 'resourceRotation', title: '#Resource Rotation (<0 means reduced. >0 means added)' },
        { key: 'jobOffered', title: '#Job Offered' },
        { key: 'headcount', title: 'HC' },
        { key: 'billable', title: '#Billable' },
        { key: 'nonBillableRatio', title: '%NBR' }
    ];

    const fetchTableResourceProjection = useCallback(async () => {
        turnOnLoading();
        const response = await resourceProjectionServices.getTableDataByUnit(unitId);
        const { data, succeeded } = response;

        if (succeeded) {
            setData(data || null);
        }

        turnOffLoading();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unitId]);

    useEffect(() => {
        if (unitId) fetchTableResourceProjection();
    }, [navigation, unitId, isReloadAPI, turnOnLoading, turnOffLoading, unitTypeName, fetchTableResourceProjection]);

    useEffect(() => {
        if (data) {
            const columns: TableColumnsType<any> = data.items.map((item, index) => ({
                key: `${item.month}`,
                title: months[item.month - 1],
                width: 50,
                className: item.month === currentMonth ? 'active-col-month' : '',
                render: (record: any) => {
                    const disableCurrentResignation = item.month === currentMonth && record.key === 'resignation';
                    const titleTooltip =
                        (record.key === 'billableAddRemove' && item.data.noteBillable) ||
                        (record.key === 'resignation' && item.data.noteResignation) ||
                        (record.key === 'resourceRotation' && item.data.noteResourceRotation) ||
                        (record.key === 'jobOffered' && item.data.noteJobOffered);

                    const minInput = record.key === 'resignation' || record.key === 'resourceRotation' || record.key === 'jobOffered' ? 0 : undefined;

                    return isEditing ? (
                        <Form.Item name={[`${item.month}`, `${record.key}`]} initialValue={record.data[index]}>
                            <Input disabled={disableEdit.includes(record.key) || disableCurrentResignation} type="number" min={minInput} />
                        </Form.Item>
                    ) : (
                        <Tooltip title={titleTooltip}>
                            <div>{record?.data && record.data[index]}</div>
                        </Tooltip>
                    );
                },
                onHeaderCell: ({ key }) => ({
                    onClick: () => {
                        if (currentUnit.children?.length) return;
                        formNote.resetFields();

                        const recordSelected = data.items.find(item => item.month === Number(key));
                        const { data: { noteBillable = '', noteJobOffered = '', noteResignation = '', noteResourceRotation = '' } = {} } =
                            recordSelected || {};

                        formNote.setFieldsValue({
                            noteBillable,
                            noteJobOffered,
                            noteResignation,
                            noteResourceRotation
                        });
                        setMonthNoteSelected(String(key));
                    }
                })
            }));

            setColumns([
                {
                    key: 'resourceFactors',
                    title: 'Resource Factors',
                    width: 200,
                    render: (_, __, index) => RESOURCE_PROJECTION_TABLE_FACTORS_COLUMNS[index]?.title
                },
                ...columns
            ]);
        }

        const dataTable = data?.items
            ? RESOURCE_PROJECTION_TABLE_FACTORS_COLUMNS.map(row => ({
                  ...row,
                  data: data?.items.map((item: any) => item.data[row.key])
              }))
            : [];
        setDataTable(dataTable);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, isEditing, currentMonth]);

    const formatData = (values: any): IFormatResourceProjection[] => {
        return Object.keys(values).map(index => {
            const item = data?.items.find(item => item.month === parseInt(index));
            return {
                year: item?.year || 0,
                month: parseInt(index),
                billableAddRemove: parseInt(values[index].billableAddRemove),
                resignation: parseInt(values[index].resignation),
                resourceRotation: parseInt(values[index].resourceRotation),
                jobOffered: parseInt(values[index].jobOffered),
                noteBillable: null,
                noteResignation: null,
                noteResourceRotation: null,
                noteJobOffered: null
            } as IFormatResourceProjection;
        });
    };

    const handleSubmitSaveAllTable = async (values: any) => {
        const dataFormat = formatData(values);
        try {
            turnOffLoading();
            const res = await resourceProjectionServices.updateResourceProjection(parseInt(unitId), dataFormat);
            const { succeeded, message } = res;

            if (succeeded) {
                setIsEditing(false);
                setReloadAPIChart({});
                setIsReloadAPI({});
            }

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'save failed');
        } finally {
            turnOffLoading();
        }
        formTable.resetFields();
    };

    const handleShowEditTableAll = () => {
        setIsEditing(true);
        formTable.resetFields();
    };

    const handleCancelEditTableAll = () => {
        setIsEditing(false);
        formTable.resetFields();
    };

    const handleBtnConfigurationClick = () => {
        navigation(pathnames.resourcePlan.resourceProjection.configuration.path);
    };

    const handleUpdateNote = async (values: any) => {
        const yearUpdate = data?.items.find(item => item.month.toString() === monthNoteSelected)?.year || 0;
        const updateNoteEntry: IFormatResourceProjection = {
            year: yearUpdate,
            month: parseInt(monthNoteSelected || ''),
            billableAddRemove: 0,
            resignation: 0,
            resourceRotation: 0,
            jobOffered: 0,
            noteBillable: values.noteBillable,
            noteResignation: values.noteResignation,
            noteResourceRotation: values.noteResourceRotation,
            noteJobOffered: values.noteJobOffered
        };

        try {
            turnOffLoading();
            const res = await resourceProjectionServices.updateResourceProjection(parseInt(unitId), [updateNoteEntry]);
            const { succeeded, message } = res;

            if (succeeded) {
                setMonthNoteSelected(null);
                fetchTableResourceProjection();
            }
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'update failed');
        } finally {
            turnOffLoading();
        }
    };

    return (
        <div>
            <Form form={formTable} onFinish={handleSubmitSaveAllTable}>
                <div className="resource-projection-top">
                    <h2 className="resource-projection-title">{title}</h2>
                    <div className="resource-projection-buttons">
                        <Flex gap={12}>
                            {isEditing ? (
                                <Flex gap={8}>
                                    <Button type="default" onClick={handleCancelEditTableAll}>
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit">
                                        Save
                                    </Button>
                                </Flex>
                            ) : (
                                havePermission('Edit') && (
                                    <Button hidden={!!currentUnit.children?.length} type="primary" onClick={handleShowEditTableAll}>
                                        Edit Unit
                                    </Button>
                                )
                            )}
                            {havePermission('Configuration') && (
                                <Button type="primary" onClick={handleBtnConfigurationClick}>
                                    Configuration
                                </Button>
                            )}
                        </Flex>
                    </div>
                </div>
                <ResourceProjectionItems items={resourceProjectionItems} />
                <div className="resource-projection-container">
                    <BaseTable
                        dataSource={dataTable}
                        style={{ marginTop: 12 }}
                        columns={columns}
                        loading={isLoading}
                        className="resource-projection-table"
                        pagination={false}
                    />
                    <Modal
                        open={!!parseInt(monthNoteSelected || '')}
                        closable={false}
                        centered
                        title={`Update Resource Projection Note Of ${months[parseInt(monthNoteSelected || '') - 1]}`}
                        footer={null}
                    >
                        <Form name="updateResourceNote" layout="vertical" form={formNote} onFinish={handleUpdateNote}>
                            <div className="update-note-field">
                                <Form.Item label="#Billable Added/Remove" name="noteBillable">
                                    <Input placeholder="Enter note" />
                                </Form.Item>
                            </div>
                            <div className="update-note-field">
                                <Form.Item label="#Resignation" name="noteResignation">
                                    <Input placeholder="Enter note" />
                                </Form.Item>
                            </div>
                            <div className="update-note-field">
                                <Form.Item label="#Resource Rotation" name="noteResourceRotation">
                                    <Input placeholder="Enter note" />
                                </Form.Item>
                            </div>
                            <div className="update-note-field">
                                <Form.Item label="#Job Offered" name="noteJobOffered">
                                    <Input placeholder="Enter note" />
                                </Form.Item>
                            </div>
                            <div className="update-dialog-footer">
                                <Button disabled={isLoading} onClick={() => setMonthNoteSelected(null)}>
                                    Cancel
                                </Button>
                                <Button htmlType="submit" loading={isLoading} type="primary">
                                    Save
                                </Button>
                            </div>
                        </Form>
                    </Modal>
                </div>
            </Form>
        </div>
    );
};

export default ResourceProjectionTable;
