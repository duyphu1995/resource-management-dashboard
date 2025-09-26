import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DialogHaveField from '@/components/common/dialog/dialog-have-field';
import DatePicker from '@/components/common/form/date-picker';
import BaseSelect from '@/components/common/form/select';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import contractorService from '@/services/hr-management/contractor-management';
import { IField, ITableHaveActionAddProps } from '@/types/common';
import { IFilterOption } from '@/types/filter';
import { IContractor } from '@/types/hr-management/contractor-management';
import { IEducation } from '@/types/hr-management/employee-management';
import { filterNullProperties, formatDataTable, formatYear, validate500Characters } from '@/utils/common';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { AutoComplete, Form, Input } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const TableEducationContractor = (props: ITableHaveActionAddProps<IContractor>) => {
    const { dataProps, setIsReload, educations } = props;

    const [form] = Form.useForm();
    const { havePermission } = usePermissions('Education', 'ContractorManagement');

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
            fixed: 'left',
            width: 148,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fromYear',
            key: 'fromYear',
            title: 'From',
            width: 82,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'toYear',
            key: 'toYear',
            title: 'To',
            width: 82,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'degree',
            key: 'degree',
            title: 'Degree',
            width: 128,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'majorField',
            key: 'majorField',
            title: 'Major',
            width: 128,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'rankName',
            key: 'rankName',
            title: 'Ranking',
            width: 128,
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
                            {
                                icon: icons.tableAction.edit,
                                onClick: () => handleEdit(item),
                                disabled: dataProps?.isContractorDisabled,
                                tooltip: 'Edit'
                            },
                            {
                                icon: icons.tableAction.delete,
                                onClick: () => handleDelete(item),
                                disabled: dataProps?.isContractorDisabled,
                                tooltip: 'Delete'
                            }
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

    // Function to format education data
    const formatEducationData = (data: IEducation) => {
        const { fromYear, toYear } = data;
        return {
            ...data,
            employeeId: educations?.[0]?.employeeId,
            fromYear: fromYear ? formatYear(fromYear) : null,
            toYear: toYear ? formatYear(toYear) : null,
            rankId: data.rankId ? Number(data.rankId) : null
        };
    };

    // Add education
    const handleAddEducation = async (data: IEducation) => {
        setIsShowModalAddEducation(false);
        const dataFormat = filterNullProperties(formatEducationData(data));

        const isDuplicate = educations?.some(
            (item: IEducation) => item.universityName === dataFormat.universityName && item.majorField === dataFormat.majorField
        );
        if (isDuplicate) {
            setPendingEducation(dataFormat);
            setIsShowModalDuplicate(true);
            return;
        }

        await contractorService.addEducationContractor(dataFormat);
        fetchDataOption();
        setValueEdit(undefined);
        setIsReload?.({});
    };

    // Save education duplicate
    const handleSaveDuplicate = async () => {
        if (pendingEducation) {
            if (valueEdit) {
                valueEdit?.educationId && (await contractorService.updateEducationContractor(valueEdit?.educationId, pendingEducation));
            } else {
                await contractorService.addEducationContractor(pendingEducation);
            }

            fetchDataOption();
            setIsShowModalDuplicate(false);
            setValueEdit(undefined);
            setIsReload?.({});
        }
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

        const isDuplicate = educations?.some(
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

        valueEdit?.educationId && (await contractorService.updateEducationContractor(valueEdit?.educationId, dataFormat));
        fetchDataOption();
        setValueEdit(undefined);
        setIsReload?.({});
    };

    // Delete education
    const handleDeleteEducation = async () => {
        await contractorService.deleteEducationContractor(valueDelete?.educationId || 0);
        fetchDataOption();
        setIsShowModalDelete(false);
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
        const resUniversity = await contractorService.getUniversityContractor();
        const newUniversity = (resUniversity.data || []).map((item: any) => ({ label: item.value, value: item.id }));
        const resEducationRanking = await contractorService.getEducationRankingContractor();
        const newRanking = (resEducationRanking.data || []).map((item: any) => ({ label: item.rankName, value: item.rankId }));

        setUniversityOptions(newUniversity);
        setEducationRankingOptions(newRanking);
    };

    // Get data option university
    useEffect(() => {
        fetchDataOption();
    }, []);

    return (
        <>
            <TableHaveAdd
                title="Education"
                dataSource={formatDataTable(educations)}
                columns={columnsEducations}
                handleAdd={havePermission('Add') ? () => setIsShowModalAddEducation(true) : undefined}
                disabled={dataProps?.isContractorDisabled}
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

export default TableEducationContractor;
