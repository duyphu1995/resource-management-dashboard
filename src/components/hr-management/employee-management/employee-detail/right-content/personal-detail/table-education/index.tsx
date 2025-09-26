import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DialogHaveField from '@/components/common/dialog/dialog-have-field';
import DatePicker from '@/components/common/form/date-picker';
import BaseSelect from '@/components/common/form/select';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import employeeService from '@/services/hr-management/employee-management';
import { IField, ITableHaveActionAddProps } from '@/types/common';
import { IFilterOption } from '@/types/filter';
import { IEducation } from '@/types/hr-management/employee-management';
import { filterNullProperties, formatDataTable, formatYear, validate500Characters } from '@/utils/common';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { AutoComplete, Form, Input } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TableHaveAdd from '../../../../../../common/table/table-add';

const TableEducation = (props: ITableHaveActionAddProps<IEducation[]>) => {
    const { dataProps, setIsReload, moduleName } = props;
    const { id = '' } = useParams();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const nameFromUrl = useGetNameFromUrl();

    // Permission
    const { havePermission } = usePermissions('Education', nameFromUrl);

    const [isShowModalAddEducation, setIsShowModalAddEducation] = useState(false);
    const [valueEdit, setValueEdit] = useState<IEducation>();
    const [valueDelete, setValueDelete] = useState<IEducation>();
    const [universityOptions, setUniversityOptions] = useState<IFilterOption[]>([]);
    const [educationRankingOptions, setEducationRankingOptions] = useState<IFilterOption[]>([]);
    const [pendingEducation, setPendingEducation] = useState<IEducation>();
    const [isShowModalDuplicate, setIsShowModalDuplicate] = useState<boolean>(false);
    const [isShowModalDelete, setIsShowModalDelete] = useState<boolean>(false);
    const [fromYear, setFromYear] = useState<string>();

    const titleDialog = valueEdit ? 'Edit Education' : 'Add New Education';
    const contentDuplicate = (
        <>
            The Education at <strong>{pendingEducation?.universityName}</strong> of Education will be overridden. Are you sure you want to save?
        </>
    );
    const contentDelete = (
        <>
            The Education at <strong>{valueDelete?.universityName}</strong> of Education will be deleted. Are you sure you want to delete?
        </>
    );

    // Columns table educations
    const columnsEducations: ColumnsType<IEducation> = [
        {
            dataIndex: 'universityName',
            key: 'universityName',
            title: 'University',
            width: '22%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fromYear',
            key: 'fromYear',
            title: 'From',
            width: '13%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'toYear',
            key: 'toYear',
            title: 'To',
            width: '13%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'degree',
            key: 'degree',
            title: 'Degree',
            width: '19%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'majorField',
            key: 'majorField',
            title: 'Major',
            width: '19%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'rankName',
            key: 'rankName',
            title: 'Ranking',
            width: 'calc(14% - 88px)',
            render: item => renderWithFallback(item)
        },
        {
            key: 'action',
            title: 'Action',
            align: 'center',
            width: 88,
            fixed: 'right',
            render: (item: IEducation) => {
                // Delete education
                const handleDelete = (item: IEducation) => {
                    setIsShowModalDelete(true);
                    setValueDelete(item);
                };
                // Edit education
                const handleEdit = (item: IEducation) => {
                    form.setFieldsValue({
                        universityName: item.universityName,
                        fromYear: item.fromYear ? dayjs(item.fromYear.toString(), 'YYYY') : undefined,
                        toYear: item.toYear ? dayjs(item.toYear.toString(), 'YYYY') : undefined,
                        degree: item.degree,
                        majorField: item.majorField,
                        rankId: item.rankId
                    });

                    setValueEdit(item);
                    setIsShowModalAddEducation(true);
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

    // Reset toYear field when change fromYear field
    const handleChangeFromYear = (_: any, dateString: string) => {
        setFromYear(dateString);

        form.setFieldsValue({
            toYear: null
        });
    };

    // Add education field
    const filedAddNewEducation: IField[] = [
        {
            name: 'universityName',
            label: 'University/College',
            value: (
                <AutoComplete
                    options={universityOptions}
                    placeholder="Select university/college"
                    filterOption={(inputValue, option) => {
                        return option!.value.toString().toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
                    }}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    allowClear
                />
            ),
            validation: [{ required: true, message: 'Please enter the valid value' }, validate500Characters]
        },
        {
            name: 'fromYear',
            label: 'From Year',
            value: <DatePicker picker="year" format="YYYY" placeholder="yyyy" onChange={handleChangeFromYear} />
        },
        {
            name: 'toYear',
            label: 'To Year',
            value: (
                <DatePicker
                    picker="year"
                    format="YYYY"
                    placeholder="yyyy"
                    disabledDate={
                        // Disable date toYear less than fromYear
                        current => {
                            return current && current <= dayjs(fromYear, 'YYYY');
                        }
                    }
                />
            )
        },
        {
            name: 'degree',
            label: 'Degree/Diploma/Certificate',
            value: <Input placeholder="Enter degree/diploma/certificate" />,
            validation: [{ required: true, message: 'Please enter the valid value' }, validate500Characters]
        },
        {
            name: 'majorField',
            label: 'Major/Specialization',
            value: <Input placeholder="Enter major/specialization" />,
            validation: [{ required: true, message: 'Please enter the valid value' }, validate500Characters]
        },
        {
            name: 'rankId',
            label: 'Ranking',
            value: <BaseSelect options={educationRankingOptions} placeholder="Select ranking" />
        }
    ];

    const clearData = () => {
        form.resetFields();
        setValueEdit(undefined);
        setValueDelete(undefined);
        setPendingEducation(undefined);
    };

    // Function to format education data
    const formatEducationData = (data: IEducation) => {
        const { fromYear, toYear, rankId } = data;

        return {
            ...data,
            educationId: valueEdit?.educationId,
            employeeId: Number(id),
            fromYear: fromYear ? formatYear(fromYear) : null,
            toYear: toYear ? formatYear(toYear) : null,
            rankId: rankId ? Number(rankId) : null
        };
    };

    // Add education
    const handleAddEducation = async (data: IEducation) => {
        setIsShowModalAddEducation(false);
        const dataFormat = filterNullProperties(formatEducationData(data));

        const isDuplicate = dataProps?.some(
            (item: IEducation) => item.universityName === dataFormat.universityName && item.majorField === dataFormat.majorField
        );

        if (isDuplicate) {
            setPendingEducation(dataFormat);
            setIsShowModalDuplicate(true);
            return;
        }

        try {
            turnOnLoading();
            const res = await employeeService.addEducationEmployee(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
            await fetchDataOption();
        } catch (error) {
            showNotification(false, 'Add education failed');
        } finally {
            turnOffLoading();
        }

        clearData;
        setIsReload?.({});
    };

    // Save education duplicate
    const handleSaveDuplicate = async () => {
        setIsShowModalDuplicate(false);

        try {
            turnOnLoading();
            if (pendingEducation) {
                if (valueEdit) {
                    const res = await employeeService.updateEducationEmployee(pendingEducation, moduleName);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                } else {
                    const res = await employeeService.addEducationEmployee(pendingEducation, moduleName);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                }
                await fetchDataOption();
            }
        } catch (error) {
            showNotification(false, valueEdit ? 'Edit education failed' : 'Add education failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Cancel modal duplicate
    const handleCancelModalDuplicate = () => {
        setIsShowModalDuplicate(false);
        setValueEdit(undefined);
    };

    // Edit education
    const handleEditEducation = async (data: IEducation) => {
        setIsShowModalAddEducation(false);
        const dataFormat = filterNullProperties(formatEducationData(data));

        const isDuplicate = dataProps?.some(
            (item: IEducation) =>
                item.universityName === dataFormat.universityName &&
                item.majorField === dataFormat.majorField &&
                item.educationId !== valueEdit?.educationId
        );

        if (isDuplicate) {
            setPendingEducation(dataFormat);
            setIsShowModalDuplicate(true);
            return;
        }

        try {
            turnOnLoading();
            const res = await employeeService.updateEducationEmployee(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
            await fetchDataOption();
        } catch (error) {
            showNotification(false, 'Edit education failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Delete education
    const handleDeleteEducation = async () => {
        setIsShowModalDelete(false);
        if (!valueDelete?.educationId) return;

        try {
            turnOnLoading();
            const res = await employeeService.deleteEducationEmployee(valueDelete?.educationId, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
            await fetchDataOption();
        } catch (error) {
            showNotification(false, 'Delete education failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Submit form
    const handleSubmit = (data: IEducation) => {
        if (valueEdit) {
            handleEditEducation(data);
        } else {
            handleAddEducation(data);
        }
    };

    // Cancel submit form
    const handleCancelSubmit = () => {
        setIsShowModalAddEducation(false);
        setValueEdit(undefined);
    };

    const fetchDataOption = async () => {
        try {
            turnOnLoading();
            const resUniversity = await employeeService.getAllUniversity(moduleName);
            const newUniversity = (resUniversity.data || []).map((item: any) => ({ label: item.value, value: item.id }));
            setUniversityOptions(newUniversity);

            const resEducationRanking = await employeeService.getAllEducationRanking(moduleName);
            const newRanking = (resEducationRanking.data || []).map((item: any) => ({ label: item.rankName, value: item.rankId }));
            setEducationRankingOptions(newRanking);
        } catch (error) {
            showNotification(false, 'Error fetching data options');
        } finally {
            turnOffLoading();
        }
    };

    // Get data option university
    useEffect(() => {
        havePermission('Add') && fetchDataOption();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <TableHaveAdd
                title="Education"
                dataSource={formatDataTable(dataProps)}
                columns={columnsEducations}
                handleAdd={havePermission('Add') ? () => setIsShowModalAddEducation(true) : undefined}
                tableScroll={{ x: 'max-content', y: 400 }}
                loading={isLoading}
            />
            {/* Add and edit education dialog */}
            <DialogHaveField
                form={form}
                title={titleDialog}
                isShow={isShowModalAddEducation}
                onCancel={() => handleCancelSubmit()}
                data={filedAddNewEducation}
                handleSubmit={data => handleSubmit(data)}
            />
            {/* Dialog save duplicate education */}
            <DialogCommon
                open={isShowModalDuplicate}
                onClose={() => handleCancelModalDuplicate()}
                icon={icons.dialog.warning}
                title="Save Education"
                content={contentDuplicate}
                buttonType="default-primary"
                buttonLeftClick={() => handleCancelModalDuplicate()}
                buttonRightClick={() => handleSaveDuplicate()}
                buttonRight="Save"
            />
            {/* Dialog delete education */}
            <DialogCommon
                open={isShowModalDelete}
                onClose={() => setIsShowModalDelete(false)}
                icon={icons.dialog.delete}
                title="Delete Education"
                content={contentDelete}
                buttonType="default-danger"
                buttonLeftClick={() => setIsShowModalDelete(false)}
                buttonRightClick={() => handleDeleteEducation()}
            />
        </>
    );
};

export default TableEducation;
