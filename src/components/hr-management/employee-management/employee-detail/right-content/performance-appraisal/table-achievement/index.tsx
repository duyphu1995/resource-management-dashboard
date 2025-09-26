import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DialogHaveField from '@/components/common/dialog/dialog-have-field';
import DatePicker from '@/components/common/form/date-picker';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import BaseTag from '@/components/common/tag';
import achievementApi from '@/services/admin/achievement';
import { IField, ITableHaveActionAddProps } from '@/types/common';
import { IAchievement } from '@/types/hr-management/employee-management';
import {
    filterNullProperties,
    formatDataTable,
    formatMappingKey,
    formatTimeMonthDayYear,
    statusMapping,
    validate1000Characters,
    validate500Characters
} from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { Checkbox, Form, Input } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useWatch } from 'antd/es/form/Form';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

const TableAchievement = (props: ITableHaveActionAddProps<IAchievement[]>) => {
    const { dataProps, setIsReload, moduleName } = props;
    const { id } = useParams();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const nameFromUrl = useGetNameFromUrl();

    // Permission
    const { havePermission } = usePermissions('Achievement', nameFromUrl);

    const [isShowModalAddAchievement, setIsShowModalAddAchievement] = useState<boolean>(false);
    const [isShowModalDelete, setIsShowModalDelete] = useState<boolean>(false);
    const [isShowModalDuplicate, setIsShowModalDuplicate] = useState<boolean>(false);
    const [pendingAchievement, setPendingAchievement] = useState<IAchievement>();
    const [valueEdit, setValueEdit] = useState<IAchievement>();
    const [valueDelete, setValueDelete] = useState<IAchievement>();

    const titleDialog = valueEdit ? 'Edit Achievement' : 'Add New Achievement';
    const contentDelete = (
        <>
            The achievement <strong>{valueDelete?.achievementName}</strong> with received date <strong>{valueDelete?.receivedDate}</strong> will be
            deleted. Are you sure you want to delete?
        </>
    );
    const contentDuplicate = (
        <>
            The achievement <strong>{pendingAchievement?.achievementName}</strong> with received date{' '}
            <strong>{dayjs(pendingAchievement?.receivedDate).format(TIME_FORMAT.US_DATE)}</strong> will be overridden. Are you sure you want to save?
        </>
    );

    //Achievement
    const columnsAchievement: ColumnsType<any> = [
        {
            dataIndex: 'achievementName',
            key: 'achievementName',
            title: 'Achievement',
            width: '17%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'positionName',
            key: 'positionName',
            title: 'Position',
            width: '17%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'receivedDate',
            key: 'receivedDate',
            title: 'Received Date',
            width: '17%',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'approvedDate',
            key: 'approvedDate',
            title: 'Approved Date',
            width: '17%',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'statusName',
            key: 'statusName',
            title: 'Status',
            width: '10%',
            render: item => {
                const statusConfig = statusMapping[formatMappingKey(item)];
                return <BaseTag {...statusConfig} statusName={item} />;
            }
        },
        {
            dataIndex: 'notes',
            key: 'notes',
            title: 'Note',
            width: 'calc(22% - 88px)',
            render: item => renderWithFallback(item)
        },
        {
            key: 'action',
            title: 'Action',
            align: 'center',
            width: 88,
            render: (item: IAchievement) => {
                // Delete health tracking
                const handleDelete = (item: IAchievement) => {
                    setIsShowModalDelete(true);
                    setValueDelete(item);
                };
                // Edit health tracking
                const handleEdit = async (item: IAchievement) => {
                    // Set value for form
                    form.setFieldsValue({
                        achievementName: item.achievementName,
                        receivedDate: item.receivedDate ? dayjs(item.receivedDate.toString(), TIME_FORMAT.VN_DATE) : undefined,
                        approvedDate: item.approvedDate ? dayjs(item.approvedDate.toString(), TIME_FORMAT.VN_DATE) : undefined,
                        statusId: !!item.approvedDate,
                        notes: item.notes
                    });
                    setValueEdit(item);
                    setIsShowModalAddAchievement(true);
                };

                return (
                    <ButtonsIcon
                        items={[
                            ...(havePermission('Edit')
                                ? [
                                      {
                                          icon: icons.tableAction.edit,
                                          onClick: () => handleEdit(item),
                                          tooltip: 'Edit'
                                      }
                                  ]
                                : []),
                            ...(havePermission('Delete')
                                ? [
                                      {
                                          icon: icons.tableAction.delete,
                                          onClick: () => handleDelete(item),
                                          tooltip: 'Delete'
                                      }
                                  ]
                                : [])
                        ]}
                    />
                );
            }
        }
    ];

    const handleClickApprove = (e: CheckboxChangeEvent) => {
        form.setFieldValue('approvedDate', e.target.checked ? dayjs() : null);
        form.validateFields(['approvedDate']);
    };

    const watchReceivedDate = useWatch('receivedDate', form);
    const watchApprovedDate = useWatch('approvedDate', form);

    // Custom validation for approvedDate
    const validateFromAchievement = () => ({
        validator() {
            if (watchReceivedDate && watchApprovedDate) {
                const receivedDate = dayjs(watchReceivedDate).startOf('day');
                const approvedDate = dayjs(watchApprovedDate).startOf('day');

                if (approvedDate.isAfter(receivedDate)) {
                    return Promise.reject('Approved Date should not be later than Received Date');
                }
            }
            return Promise.resolve();
        }
    });

    // Field of dialog add and edit
    const fieldAddNewAchievement: IField[] = [
        {
            name: 'achievementName',
            label: 'Achievement',
            value: <Input placeholder="Enter achievement" />,
            validation: [{ required: true, message: 'Please enter the valid value' }, validate500Characters]
        },
        {
            name: 'receivedDate',
            label: 'Received Date',
            value: <DatePicker onChange={() => form.validateFields(['approvedDate'])} />,
            validation: [{ required: true, message: 'Please enter the valid value' }]
        },
        {
            name: 'approvedDate',
            label: 'Approved Date',
            value: (
                <DatePicker
                    onChange={value => {
                        form.setFieldValue('statusId', !!value);
                    }}
                />
            ),
            validation: [validateFromAchievement]
        },
        {
            label: ' ',
            value: (
                <Form.Item name="statusId" valuePropName="checked">
                    <Checkbox onChange={handleClickApprove}>Approval</Checkbox>
                </Form.Item>
            )
        },
        {
            name: 'notes',
            label: 'Note',
            value: <Input placeholder="Enter note" />,
            validation: [validate1000Characters]
        }
    ];

    const clearData = () => {
        form.resetFields();
        setValueEdit(undefined);
        setValueDelete(undefined);
        setPendingAchievement(undefined);
    };

    // Function format data achievement
    const formatDataAchievement = (data: IAchievement) => {
        return {
            ...data,
            achievementId: valueEdit?.achievementId,
            employeeId: Number(id),
            achievementName: data.achievementName,
            receivedDate: data.receivedDate ? dayjs(data.receivedDate).format(TIME_FORMAT.DATE) : null,
            approvedDate: data.approvedDate ? dayjs(data.approvedDate).format(TIME_FORMAT.DATE) : null,
            statusId: data.statusId ? 1 : 0,
            notes: data.notes
        };
    };

    // Handle add achievement
    const handleAddAchievement = async (data: IAchievement) => {
        setIsShowModalAddAchievement(false);
        const dataFormat = filterNullProperties(formatDataAchievement(data));

        const isDuplicate = dataProps?.some(
            item =>
                item.achievementName === dataFormat.achievementName &&
                dayjs(item.receivedDate, TIME_FORMAT.VN_DATE).format(TIME_FORMAT.DATE) === dataFormat.receivedDate
        );

        if (isDuplicate) {
            setPendingAchievement(dataFormat);
            setIsShowModalDuplicate(true);
            return;
        }

        try {
            turnOnLoading();
            const res = await achievementApi.addAchievement(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Add achievement failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle Save duplicate
    const handleSaveDuplicate = async () => {
        setIsShowModalDuplicate(false);

        try {
            turnOnLoading();
            if (pendingAchievement) {
                if (valueEdit) {
                    const res = await achievementApi.updateAchievement(pendingAchievement, moduleName);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                } else {
                    const res = await achievementApi.addAchievement(pendingAchievement, moduleName);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                }
            }
        } catch (error) {
            showNotification(false, valueEdit ? 'Edit achievement failed' : 'Add achievement failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle cancel modal duplicate
    const handleCancelModalDuplicate = () => {
        setIsShowModalDuplicate(false);
        clearData();
    };

    // Handle edit achievement
    const handleEditAchievement = async (data: IAchievement) => {
        setIsShowModalAddAchievement(false);
        const dataFormat = filterNullProperties(formatDataAchievement(data));

        const isDuplicate = dataProps?.some(
            item =>
                item.achievementName === dataFormat.achievementName &&
                item.receivedDate === dataFormat.receivedDate &&
                item.achievementId !== dataFormat.achievementId
        );

        if (isDuplicate) {
            setPendingAchievement(dataFormat);
            setIsShowModalDuplicate(true);
            return;
        }

        try {
            turnOnLoading();
            const res = await achievementApi.updateAchievement(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Edit achievement failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle delete achievement
    const handleDeleteAchievement = async () => {
        setIsShowModalDelete(false);
        if (!valueDelete?.achievementId) return;

        try {
            turnOnLoading();
            const res = await achievementApi.deleteAchievement(valueDelete?.achievementId, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Delete achievement failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle submit
    const handleSubmit = (data: any) => {
        if (valueEdit) {
            handleEditAchievement(data);
        } else {
            handleAddAchievement(data);
        }
    };

    // Handle cancel submit
    const handleCancelSubmit = () => {
        setIsShowModalAddAchievement(false);
        clearData();
    };

    return (
        <>
            <TableHaveAdd
                title="Achievement"
                dataSource={formatDataTable(dataProps)}
                columns={columnsAchievement}
                handleAdd={havePermission('Add') ? () => setIsShowModalAddAchievement(true) : undefined}
                loading={isLoading}
            />
            {/* Add and edit achievement dialog */}
            <DialogHaveField
                form={form}
                name="form-table-achievement"
                title={titleDialog}
                isShow={isShowModalAddAchievement}
                onCancel={() => handleCancelSubmit()}
                data={fieldAddNewAchievement}
                handleSubmit={data => handleSubmit(data)}
            />
            {/* Dialog save duplicate */}
            <DialogCommon
                open={isShowModalDuplicate}
                onClose={() => handleCancelModalDuplicate()}
                icon={icons.dialog.warning}
                title="Save Achievement"
                content={contentDuplicate}
                buttonType="default-primary"
                buttonLeftClick={() => handleCancelModalDuplicate()}
                buttonRightClick={() => handleSaveDuplicate()}
                buttonRight="Save"
            />
            {/* Dialog delete */}
            <DialogCommon
                open={isShowModalDelete}
                onClose={() => setIsShowModalDelete(false)}
                icon={icons.dialog.delete}
                title="Delete Achievement"
                content={contentDelete}
                buttonType="default-danger"
                buttonLeftClick={() => setIsShowModalDelete(false)}
                buttonRightClick={() => handleDeleteAchievement()}
            />
        </>
    );
};

export default TableAchievement;
