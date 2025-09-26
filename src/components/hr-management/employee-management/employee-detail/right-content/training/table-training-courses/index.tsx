import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DialogHaveField from '@/components/common/dialog/dialog-have-field';
import DatePicker from '@/components/common/form/date-picker';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import employeeService from '@/services/hr-management/employee-management';
import { IField, ITableHaveActionAddProps } from '@/types/common';
import { ITrainingCourses } from '@/types/hr-management/employee-management';
import { filterNullProperties, formatDataTable, formatYear, validate500Characters } from '@/utils/common';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { Form, Input } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

const TableTrainingCourses = (props: ITableHaveActionAddProps<ITrainingCourses[]>) => {
    const { dataProps, setIsReload, moduleName } = props;

    const [form] = Form.useForm();
    const { id = '' } = useParams();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const nameFromUrl = useGetNameFromUrl();

    // Permission
    const { havePermission } = usePermissions('TrainingCourses', nameFromUrl);

    const [isShowModalAddTrainingCourses, setIsShowModalAddTrainingCourses] = useState<boolean>(false);
    const [valueEdit, setValueEdit] = useState<ITrainingCourses>();
    const [isShowModalDelete, setIsShowModalDelete] = useState<boolean>(false);
    const [valueDelete, setValueDelete] = useState<ITrainingCourses>();
    const [isShowModalDuplicate, setIsShowModalDuplicate] = useState<boolean>(false);
    const [pendingTrainingCourses, setPendingTrainingCourses] = useState<ITrainingCourses>();

    const titleDialog = valueEdit ? 'Edit Training Course' : 'Add New Training Course';
    const contentDelete = (
        <p>
            The Course <strong>{valueDelete?.courseName}</strong> in <strong>{valueDelete?.year}</strong> at location{' '}
            <strong>{valueDelete?.locationName}</strong> will be deleted. <br /> Are you sure you want to delete it?
        </p>
    );
    const contentDuplicate = (
        <p>
            The Course <strong>{pendingTrainingCourses?.courseName}</strong> will be overridden. <br /> Are you sure you want to save?
        </p>
    );

    //Training courses
    const columnsTrainingCourses: ColumnsType<ITrainingCourses> = [
        {
            dataIndex: 'year',
            key: 'year',
            title: 'Year',
            width: '5%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'courseName',
            key: 'courseName',
            title: 'Course Name',
            width: 'calc(35% - 88px)',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'locationName',
            key: 'location',
            title: 'Location',
            width: '30%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'organizedBy',
            key: 'organizedBy',
            title: 'Organized By',
            width: '30%',
            render: item => renderWithFallback(item)
        },

        {
            key: 'action',
            title: 'Action',
            align: 'center',
            width: 88,
            render: (item: ITrainingCourses) => {
                // Handle delete
                const handleDelete = (item: ITrainingCourses) => {
                    setIsShowModalDelete(true);
                    setValueDelete(item);
                };
                // Handle edit
                const handleEdit = (item: ITrainingCourses) => {
                    // Set value for form
                    form.setFieldsValue({
                        courseName: item.courseName,
                        year: item.year ? dayjs(item.year.toString(), 'YYYY') : undefined,
                        locationName: item.locationName,
                        organizedBy: item.organizedBy
                    });

                    setValueEdit(item);
                    setIsShowModalAddTrainingCourses(true);
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

    // Field of dialog add and edit
    const fieldAddNewTrainingCourses: IField[] = [
        {
            name: 'courseName',
            label: 'Course Name',
            value: <Input placeholder="Enter course name" />,
            validation: [{ required: true, message: 'Please enter the valid value' }, validate500Characters]
        },
        {
            name: 'year',
            label: 'Year',
            value: <DatePicker picker="year" format="YYYY" placeholder="Select year" />
        },
        {
            name: 'locationName',
            label: 'Location',
            value: <Input placeholder="Enter location" />,
            validation: [validate500Characters]
        },
        {
            name: 'organizedBy',
            label: 'Organized By',
            value: <Input placeholder="Enter organized by" />,
            validation: [validate500Characters]
        }
    ];

    const clearData = () => {
        form.resetFields();
        setValueEdit(undefined);
        setValueDelete(undefined);
        setPendingTrainingCourses(undefined);
    };

    // Function to format data
    const formatTrainingCourseData = (data: ITrainingCourses) => {
        const { year } = data;

        return {
            ...data,
            trainingCourseId: valueEdit?.trainingCourseId,
            employeeId: Number(id),
            year: year ? formatYear(year) : null
        };
    };

    // Handle add training courses
    const handleAddTrainingCourses = async (data: ITrainingCourses) => {
        setIsShowModalAddTrainingCourses(false);
        const dataFormat = filterNullProperties(formatTrainingCourseData(data));

        const isDuplicate = dataProps?.some((item: ITrainingCourses) => {
            return item.courseName === dataFormat.courseName;
        });

        if (isDuplicate) {
            setPendingTrainingCourses(dataFormat);
            setIsShowModalDuplicate(true);
            return;
        }

        try {
            turnOnLoading();
            const res = await employeeService.addTrainingCourseEmployee(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Add training course failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle save duplicate
    const handleSaveDuplicate = async () => {
        setIsShowModalDuplicate(false);

        try {
            turnOnLoading();
            if (pendingTrainingCourses) {
                if (valueEdit) {
                    const res = await employeeService.updateTrainingCourseEmployee(pendingTrainingCourses, moduleName);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                } else {
                    const res = await employeeService.addTrainingCourseEmployee(pendingTrainingCourses, moduleName);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                }
            }
        } catch (error) {
            showNotification(false, valueEdit ? 'Edit training course failed' : 'Add training course failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle cancel modal duplicate
    const handleCancelModalDuplicate = () => {
        setIsShowModalDuplicate(false);
        setValueEdit(undefined);
    };

    // Handle edit training courses
    const handleEditTrainingCourses = async (data: ITrainingCourses) => {
        setIsShowModalAddTrainingCourses(false);
        const dataFormat = filterNullProperties(formatTrainingCourseData(data));

        const isDuplicate = dataProps?.some((item: ITrainingCourses) => {
            return item.courseName === dataFormat.courseName && item.trainingCourseId !== valueEdit?.trainingCourseId;
        });

        if (isDuplicate) {
            setPendingTrainingCourses(dataFormat);
            setIsShowModalDuplicate(true);
            return;
        }

        try {
            turnOnLoading();
            const res = await employeeService.updateTrainingCourseEmployee(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Edit training course failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle delete training courses
    const handleDeleteTrainingCourses = async () => {
        setIsShowModalDelete(false);
        if (!valueDelete?.trainingCourseId) return;

        try {
            turnOnLoading();
            const { succeeded, message } = await employeeService.deleteTrainingCourseEmployee(valueDelete?.trainingCourseId, moduleName);
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Delete training course failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle submit
    const handleSubmit = (data: ITrainingCourses) => {
        if (valueEdit) {
            handleEditTrainingCourses(data);
        } else {
            handleAddTrainingCourses(data);
        }
    };

    // Handle cancel submit
    const handleCancelSubmit = () => {
        setIsShowModalAddTrainingCourses(false);
        setValueEdit(undefined);
    };

    return (
        <>
            <TableHaveAdd
                title="Training Courses"
                dataSource={formatDataTable(dataProps)}
                columns={columnsTrainingCourses}
                handleAdd={havePermission('Add') ? () => setIsShowModalAddTrainingCourses(true) : undefined}
                loading={isLoading}
            />
            {/* Add and edit project dialog */}
            <DialogHaveField
                form={form}
                title={titleDialog}
                isShow={isShowModalAddTrainingCourses}
                onCancel={() => handleCancelSubmit()}
                data={fieldAddNewTrainingCourses}
                handleSubmit={data => handleSubmit(data)}
            />
            {/* Dialog save duplicate */}
            <DialogCommon
                open={isShowModalDuplicate}
                onClose={() => handleCancelModalDuplicate()}
                icon={icons.dialog.warning}
                title="Save Training Course"
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
                title="Delete Training Course"
                content={contentDelete}
                buttonType="default-danger"
                buttonLeftClick={() => setIsShowModalDelete(false)}
                buttonRightClick={() => handleDeleteTrainingCourses()}
            />
        </>
    );
};

export default TableTrainingCourses;
