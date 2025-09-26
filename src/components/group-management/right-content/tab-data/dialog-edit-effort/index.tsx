import DialogDefault from '@/components/common/dialog/default';
import BaseDivider from '@/components/common/divider';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import BaseTable from '@/components/common/table/table';
import chartService from '@/services/group-management/org-chart';
import employeeService from '@/services/hr-management/employee-management';
import { IEmployeeEditEffort, IFormattedUnitIdAndEffort } from '@/types/group-management/group-management';
import { validateRange0To1000 } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { Button, Flex, Form, FormInstance, InputNumber } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ColumnsType } from 'antd/es/table';
import Title from 'antd/es/typography/Title';
import { useEffect, useState } from 'react';
import { IFormatTableDialogEdit } from '..';

interface IDialogEditEffort {
    setIsReload: (params: object) => void;
    valueEdit: IEmployeeEditEffort[];
    setValueEdit: (params: IEmployeeEditEffort[]) => void;
    employeeId: number;
    showEditModal: boolean;
    setShowEditModal: (params: boolean) => void;
    count: number;
    setCount: (params: number) => void;
    formDialog: FormInstance;
    titleEditList: string;
}

const DialogEditEffort = (props: IDialogEditEffort) => {
    const { setIsReload, valueEdit, employeeId, showEditModal, setShowEditModal, formDialog, titleEditList, setValueEdit, count, setCount } = props;

    const { showNotification } = useNotify();

    //#region Edit each record
    const [projectOptions, setProjectOptions] = useState<DefaultOptionType[]>([]);

    const formatDataDialogEdit = (values: IFormatTableDialogEdit): IFormattedUnitIdAndEffort[] => {
        const formateData: IFormattedUnitIdAndEffort[] = [];

        Object.keys(values.unitId).forEach((keyId, index) => {
            const formattedEntry: IFormattedUnitIdAndEffort = {
                unitId: Number(values.unitId[keyId]),
                effort: Number(values.effort[keyId]),
                employeeUnitId: valueEdit[index]?.employeeUnitId
            };

            formateData.push(formattedEntry);
        });

        return formateData;
    };

    const handleSubmitDialogEditEffort = async (values: IFormatTableDialogEdit) => {
        if (!employeeId) return;
        const dataFormat = formatDataDialogEdit(values);

        try {
            const res = await chartService.updateEffortEmployeeList(employeeId, dataFormat);
            const { succeeded, message } = res;

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Update effort failed');
        }

        setShowEditModal(false);
        setIsReload({});
    };

    const handleCancelDialogEditEffort = () => {
        setShowEditModal(false);
        formDialog.resetFields();
    };

    const handleDeleteEffort = (value: IEmployeeEditEffort) => {
        const newData = valueEdit.filter(item => item.key !== value.key);
        setValueEdit(newData);

        // Clear data if delete row
        formDialog.resetFields([
            ['unitId', `${value.key}`],
            ['effort', `${value.key}`]
        ]);
    };

    const handleAddRowTable = () => {
        const newData: IEmployeeEditEffort = {
            key: count,
            unitId: '',
            projectName: ORG_UNITS.Project,
            effort: 0,
            employeeUnitId: undefined
        };
        setValueEdit([...valueEdit, newData]);
        setCount(count + 1);
    };

    const validateUnitId = ({ getFieldValue }: { getFieldValue: any }) => ({
        validator(_: any, value: any) {
            const unitIds = getFieldValue('unitId') || [];

            if (!value) return Promise.reject(new Error('Please enter the valid value!'));

            const duplicate = unitIds.filter((unitId: any) => unitId === value).length > 1;
            if (duplicate) {
                return Promise.reject(new Error('That unit is exist. Try another!'));
            }

            return Promise.resolve();
        }
    });

    const columnEditEffort: ColumnsType<IEmployeeEditEffort> = [
        {
            title: 'Name',
            width: 150,
            render: (_, record) => (
                <Form.Item name={['unitId', `${record.key}`]} rules={[validateUnitId]}>
                    {record.employeeUnitId ? (
                        <div>
                            {projectOptions.find(item => item.value === record.unitId)?.label}{' '}
                            <span>{record.isMainProject ? '(Main project)' : ''}</span>
                        </div>
                    ) : (
                        <BaseSelect options={projectOptions} placeholder="Select a project" getPopupContainer={() => document.body} />
                    )}
                </Form.Item>
            )
        },
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: 'Type',
            width: 80,
            render: () => 'Project'
        },
        {
            key: 'effort',
            title: 'Effort',
            width: 153,
            render: (_, record) => (
                <Form.Item name={['effort', `${record.key}`]} rules={[validateRange0To1000()]}>
                    <InputNumber placeholder="Enter effort" className="w-100" addonAfter="%" step={1} precision={0} />
                </Form.Item>
            )
        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 100,
            render: (record: any) => (
                <ButtonsIcon
                    items={[
                        !record.isMainProject
                            ? {
                                  icon: icons.tableAction.delete,
                                  onClick: () => handleDeleteEffort(record),
                                  tooltip: 'Delete',
                                  placement: 'right'
                              }
                            : undefined
                    ]}
                />
            )
        }
    ];

    const renderContentDialogEditEffort = () => {
        return (
            <Form form={formDialog} name="tab-data-form-edit-effort" onFinish={handleSubmitDialogEditEffort} requiredMark={RequiredMark}>
                <Flex justify="space-between" align="center" style={{ paddingBottom: 16 }}>
                    <Title level={5} style={{ margin: 0 }}>
                        {titleEditList} Is Allocated To These Projects
                    </Title>
                    <Button type="primary" onClick={handleAddRowTable}>
                        Add More Project
                    </Button>
                </Flex>
                <BaseTable dataSource={valueEdit} columns={columnEditEffort} scroll={{ x: 1000, y: 400 }} pagination={false} />
                <BaseDivider margin="24px 0 16px 0" />
                <div className="dialog-edit__footer">
                    <Button type="default" onClick={handleCancelDialogEditEffort} className="btn">
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" className="btn btn--submit">
                        Save
                    </Button>
                </div>
            </Form>
        );
    };
    //#endregion

    useEffect(() => {
        const getOptionsProject = async () => {
            try {
                const res = await employeeService.getAllProjects();
                const { succeeded, data = [] } = res;

                if (succeeded && data) {
                    const projectOptions = data.map((item: any) => {
                        return {
                            label: item.projectName,
                            value: item.projectId
                        };
                    });
                    setProjectOptions(projectOptions);
                }
            } catch (error) {
                return setProjectOptions([]);
            }
        };

        getOptionsProject();
    }, []);

    return (
        <DialogDefault
            title=""
            isShow={showEditModal}
            onCancel={handleCancelDialogEditEffort}
            content={renderContentDialogEditEffort()}
            className="dialog-information "
            footer={null}
        />
    );
};

export default DialogEditEffort;
