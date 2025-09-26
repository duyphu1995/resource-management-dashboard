import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DialogHaveField from '@/components/common/dialog/dialog-have-field';
import DatePicker from '@/components/common/form/date-picker';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import BaseTag from '@/components/common/tag';
import employeeService from '@/services/hr-management/employee-management';
import { IField, ITableHaveActionAddProps } from '@/types/common';
import { IPromotion } from '@/types/hr-management/employee-management';
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
import { useWatch } from 'antd/es/form/Form';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TablePromoteBeforePA = (props: ITableHaveActionAddProps<IPromotion[]>) => {
    const { dataProps, setIsReload, moduleName } = props;
    const { id } = useParams();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const nameFromUrl = useGetNameFromUrl();

    // Permission
    const { havePermission } = usePermissions('PromoteBeforePA', nameFromUrl);

    const [isShowModalAddPromote, setIsShowModalAddPromote] = useState<boolean>(false);
    const [pendingPromoteBeforePA, setPendingPromoteBeforePA] = useState<IPromotion>();
    const [isShowModalDuplicate, setIsShowModalDuplicate] = useState<boolean>(false);
    const [isShowModalDelete, setIsShowModalDelete] = useState<boolean>(false);
    const [valueEdit, setValueEdit] = useState<IPromotion>();
    const [valueDelete, setValueDelete] = useState<IPromotion>();
    const [dataTitleDuplicate, setDataTitleDuplicate] = useState<IPromotion>();

    const contentDuplicate = (
        <>
            The Promote before PA from <strong>{dataTitleDuplicate?.oldPositionName}</strong> to{' '}
            <strong>{dataTitleDuplicate?.newPositionName}</strong> with affected date{' '}
            <strong>{dayjs(dataTitleDuplicate?.effectedDate, TIME_FORMAT.VN_DATE).format(TIME_FORMAT.US_DATE)}</strong> will be overridden. Are you
            sure you want to save?
        </>
    );

    const contentDelete = (
        <>
            The Promote before PA from <strong>{valueDelete?.oldPositionName}</strong> to <strong>{valueDelete?.newPositionName}</strong> with
            affected date <strong>{valueDelete?.effectedDate}</strong> will be deleted. Are you sure you want to delete?
        </>
    );

    //Achievement
    const columnsPromoteBeforePA: ColumnsType<any> = [
        {
            dataIndex: 'oldPositionName',
            key: 'oldPositionName',
            title: 'Old Promote',
            width: '17%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'newPositionName',
            key: 'newPositionName',
            title: 'New Promote',
            width: '17%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'effectedDate',
            key: 'effectedDate',
            title: 'Affected Date',
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
            render: (item: IPromotion) => {
                // Delete health tracking
                const handleDelete = (item: IPromotion) => {
                    setIsShowModalDelete(true);
                    setValueDelete(item);
                };
                // Edit health tracking
                const handleEdit = async (item: IPromotion) => {
                    // Set value for form
                    form.setFieldsValue({
                        oldPositionName: item.oldPositionName,
                        newPositionName: item.newPositionName,
                        effectedDate: item.effectedDate ? dayjs(item.effectedDate.toString(), TIME_FORMAT.VN_DATE) : undefined,
                        approvedDate: item.approvedDate ? dayjs(item.approvedDate.toString(), TIME_FORMAT.VN_DATE) : undefined,
                        statusId: item.statusId === 1,
                        notes: item.notes
                    });

                    setValueEdit(item);
                    setIsShowModalAddPromote(true);
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

    const watchEffectedDate = useWatch('effectedDate', form);
    const watchApprovedDate = useWatch('approvedDate', form);

    const handleChangeApprovalCheckbox = (e: any) => {
        const checked = e.target.checked;
        const currentDay = dayjs().startOf('day');
        form.setFieldValue('approvedDate', checked ? currentDay : undefined);
        form.validateFields(['approvedDate']);
    };

    useEffect(() => {
        if (watchEffectedDate && watchApprovedDate) {
            const effectiveDate = dayjs(watchEffectedDate).startOf('day');
            const approvedDate = dayjs(watchApprovedDate).startOf('day');

            if (effectiveDate.isSameOrAfter(approvedDate)) {
                form.validateFields(['effectedDate', 'approvedDate']);
            }
        }
    }, [watchEffectedDate, watchApprovedDate, form]);

    // Field of dialog add and edit
    const fieldAddNewPromote: IField[] = [
        {
            name: 'oldPositionName',
            label: 'Old Promotion',
            value: <Input placeholder="Enter old promotion" />,
            validation: [{ required: true, message: 'Please enter valid value' }, validate500Characters]
        },
        {
            name: 'newPositionName',
            label: 'New Promotion',
            value: <Input placeholder="Enter new promotion" />,
            validation: [{ required: true, message: 'Please enter valid value' }, validate500Characters]
        },
        {
            name: 'effectedDate',
            label: 'Affected date',
            value: <DatePicker />,
            validation: [
                { required: true, message: 'Please enter valid value' },
                {
                    validator: (_, value) => {
                        const approvedDate = form.getFieldValue('approvedDate');
                        if (!value || !approvedDate || value.isSame(approvedDate) || value.isAfter(approvedDate)) {
                            return Promise.resolve();
                        }
                        return Promise.reject(new Error('Affected Date should be the same or greater than the Approval Date'));
                    }
                }
            ]
        },
        {
            name: 'statusId',
            label: ' ',
            valuePropName: 'checked',
            value: <Checkbox onChange={handleChangeApprovalCheckbox}>Approval</Checkbox>
        },
        {
            name: 'approvedDate',
            label: 'Approved Date',
            value: <DatePicker onChange={value => form.setFieldValue('statusId', !!value)} />,
            validation: [
                { required: true, message: 'Please enter valid value' },
                {
                    validator: (_, value) => {
                        const effectedDate = form.getFieldValue('effectedDate');
                        if (!value || !effectedDate || value.isSame(effectedDate) || value.isBefore(effectedDate)) {
                            return Promise.resolve();
                        }
                        return Promise.reject(new Error('Approval Date should be the same or smaller than the Affected Date'));
                    }
                }
            ]
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
        setPendingPromoteBeforePA(undefined);
        setDataTitleDuplicate(undefined);
    };

    // Function format data promotion
    const formatDataPromotion = (data: IPromotion) => {
        return {
            ...data,
            promotionInfoId: valueEdit?.promotionInfoId,
            employeeId: Number(id),
            oldPositionName: data.oldPositionName,
            newPositionName: data.newPositionName,
            effectedDate: dayjs(data.effectedDate).format(TIME_FORMAT.DATE),
            approvedDate: dayjs(data.approvedDate).format(TIME_FORMAT.DATE),
            statusId: data.statusId ? 1 : 0,
            notes: data.notes
        };
    };

    // Handle add new promote
    const handleAddNewPromote = async (data: IPromotion) => {
        setIsShowModalAddPromote(false);

        const dataFormat = filterNullProperties(formatDataPromotion(data));
        const isDuplicate = dataProps?.some(
            (item: IPromotion) => item.oldPositionName === dataFormat.oldPositionName && item.newPositionName === dataFormat.newPositionName
        );

        if (isDuplicate) {
            setPendingPromoteBeforePA(dataFormat);
            setDataTitleDuplicate({
                ...dataFormat,
                effectedDate: dataProps?.find(item => item.oldPositionName === data.oldPositionName && item.newPositionName === data.newPositionName)
                    ?.effectedDate
            });
            setIsShowModalDuplicate(true);
            return;
        }

        try {
            turnOnLoading();
            const res = await employeeService.addPromotionEmployee(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Add promote failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    const handleSaveDuplicate = async () => {
        setIsShowModalDuplicate(false);

        try {
            turnOnLoading();
            if (pendingPromoteBeforePA) {
                if (valueEdit) {
                    const res = await employeeService.updatePromotionEmployee(pendingPromoteBeforePA, moduleName);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                } else {
                    const res = await employeeService.addPromotionEmployee(pendingPromoteBeforePA, moduleName);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                }
            }
        } catch (error) {
            showNotification(false, valueEdit ? 'Edit promote failed' : 'Add promote failed');
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

    // Handle edit promote
    const handleEditPromote = async (data: IPromotion) => {
        setIsShowModalAddPromote(false);
        const dataFormat = filterNullProperties(formatDataPromotion(data));

        const isDuplicate = dataProps?.some(
            (item: IPromotion) =>
                item.oldPositionName === dataFormat.oldPositionName &&
                item.newPositionName === dataFormat.newPositionName &&
                item.promotionInfoId !== valueEdit?.promotionInfoId
        );

        if (isDuplicate) {
            setPendingPromoteBeforePA(dataFormat);
            setDataTitleDuplicate({
                ...dataFormat,
                effectedDate: dataProps?.find(item => item.oldPositionName === data.oldPositionName && item.newPositionName === data.newPositionName)
                    ?.effectedDate
            });
            setIsShowModalDuplicate(true);
            return;
        }

        try {
            turnOnLoading();
            const res = await employeeService.updatePromotionEmployee(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Edit promote failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle delete promote before PA
    const handleDeletePromotion = async () => {
        setIsShowModalDelete(false);
        if (!valueDelete?.promotionInfoId) return;

        try {
            turnOnLoading();
            const res = await employeeService.deletePromotionEmployee(valueDelete?.promotionInfoId, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Delete promote failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle submit
    const handleSubmit = (data: any) => {
        if (valueEdit) {
            handleEditPromote(data);
        } else {
            handleAddNewPromote(data);
        }
    };

    // Handle cancel submit
    const handleCancelSubmit = () => {
        setIsShowModalAddPromote(false);
        clearData();
    };

    return (
        <>
            <TableHaveAdd
                title="Promote Before PA"
                dataSource={formatDataTable(dataProps)}
                columns={columnsPromoteBeforePA}
                handleAdd={havePermission('Add') ? () => setIsShowModalAddPromote(true) : undefined}
                loading={isLoading}
                tableScroll={{ y: 400 }}
            />
            {/* Add and edit project dialog */}
            <DialogHaveField
                form={form}
                title={valueEdit ? 'Edit Promote Before PA' : 'Add Promote Before PA'}
                isShow={isShowModalAddPromote}
                onCancel={() => handleCancelSubmit()}
                data={fieldAddNewPromote}
                handleSubmit={data => handleSubmit(data)}
            />
            {/* Dialog save duplicate */}
            <DialogCommon
                open={isShowModalDuplicate}
                onClose={() => handleCancelModalDuplicate()}
                icon={icons.dialog.warning}
                title="Save Promote Before PA"
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
                title="Delete Promote Before PA"
                content={contentDelete}
                buttonType="default-danger"
                buttonLeftClick={() => setIsShowModalDelete(false)}
                buttonRightClick={() => handleDeletePromotion()}
            />
        </>
    );
};

export default TablePromoteBeforePA;
