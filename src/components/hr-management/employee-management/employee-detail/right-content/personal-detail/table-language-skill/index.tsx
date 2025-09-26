import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DialogHaveField from '@/components/common/dialog/dialog-have-field';
import BaseSelect from '@/components/common/form/select';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import employeeService from '@/services/hr-management/employee-management';
import { IField, ITableHaveActionAddProps } from '@/types/common';
import { IFilterOption } from '@/types/filter';
import { ILanguageSkills } from '@/types/hr-management/employee-management';
import { filterNullProperties, formatDataTable } from '@/utils/common';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { Form } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TableHaveAdd from '../../../../../../common/table/table-add';

const TableLanguageSkill = (props: ITableHaveActionAddProps<ILanguageSkills[]>) => {
    const { dataProps, setIsReload, moduleName } = props;
    const { id = '' } = useParams();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const nameFromUrl = useGetNameFromUrl();

    // Permission
    const { havePermission } = usePermissions('LanguageSkill', nameFromUrl);

    const [isShowModalAddLanguageSkill, setIsShowModalAddLanguageSkill] = useState<boolean>(false);
    const [valueEdit, setValueEdit] = useState<ILanguageSkills>();
    const [languageOption, setLanguageOption] = useState<IFilterOption[]>([]);
    const [languageRankingOption, setLanguageRankingOption] = useState<IFilterOption[]>([]);
    const [pendingLanguageSkill, setPendingLanguageSkill] = useState<ILanguageSkills>();
    const [isShowModalDuplicate, setIsShowModalDuplicate] = useState<boolean>(false);
    const [isShowModalDelete, setIsShowModalDelete] = useState<boolean>(false);
    const [valueDelete, setValueDelete] = useState<ILanguageSkills>();
    const [isRankDisabled, setIsRankDisabled] = useState(true);
    const [dataTitleDuplicate, setDataTitleDuplicate] = useState<ILanguageSkills>();

    const getLabelById = (options: IFilterOption[], id?: number) => options.find(item => item.value === id)?.label || '';

    const titleDialog = valueEdit ? 'Edit Language Skill' : 'Add New Language Skill';
    const contentDuplicate = (
        <>
            The Language <strong>{getLabelById(languageOption, dataTitleDuplicate?.languageId)}</strong> at level{' '}
            <strong>{getLabelById(languageRankingOption, dataTitleDuplicate?.rankId)}</strong> will be overridden. Are you sure you want to save?
        </>
    );
    const contentDelete = (
        <>
            Are you sure you want to delete the Language <strong>{valueDelete?.languageName}</strong> at level{' '}
            <strong>{valueDelete?.rankName}</strong>?
        </>
    );

    //Table Language skill
    const columnsLanguageSkill: ColumnsType<ILanguageSkills> = [
        {
            dataIndex: 'languageName',
            key: 'languageName',
            title: 'Language',
            width: 'calc(50% - 44px)',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'rankName',
            key: 'rankName',
            title: 'Level',
            width: 'calc(50% - 44px)',
            render: item => renderWithFallback(item)
        },
        {
            key: 'action',
            title: 'Action',
            align: 'center',
            width: 88,
            render: (item: ILanguageSkills) => {
                // Delete language skill
                const handleDelete = (item: ILanguageSkills) => {
                    setIsShowModalDelete(true);
                    setValueDelete(item);
                };
                // Edit language skill
                const handleEdit = (item: ILanguageSkills) => {
                    // Set value for form
                    form.setFieldsValue({
                        languageId: item.languageId,
                        rankId: item.rankId
                    });

                    setValueEdit(item);
                    setIsShowModalAddLanguageSkill(true);
                    setIsRankDisabled(false);
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

    // Reset rankId field when change language field
    const handleChangeLanguage = () => {
        form.setFieldsValue({
            rankId: null
        });

        setIsRankDisabled(!form.getFieldValue('languageId'));
    };

    // Add language skill field
    const filedAddNewLanguageSkill: IField[] = [
        {
            name: 'languageId',
            label: 'Language',
            value: <BaseSelect options={languageOption} placeholder="Select language" onChange={handleChangeLanguage} />,
            validation: [{ required: true, message: 'Please enter the valid value' }],
            colSpan: 12
        },
        {
            name: 'rankId',
            label: 'Level',
            value: <BaseSelect options={languageRankingOption} placeholder="Select level" disabled={isRankDisabled} />,
            validation: [{ required: true, message: 'Please enter the valid value' }],
            colSpan: 12
        }
    ];

    const clearData = () => {
        form.resetFields();
        setValueEdit(undefined);
        setValueDelete(undefined);
        setPendingLanguageSkill(undefined);
        setDataTitleDuplicate(undefined);
    };

    // Function to format education data
    const formatLanguageSkillData = (data: ILanguageSkills) => {
        return {
            ...data,
            communicationId: valueEdit?.communicationId,
            employeeId: Number(id)
        };
    };

    // Add language skill
    const handleAddLanguageSkill = async (data: ILanguageSkills) => {
        setIsShowModalAddLanguageSkill(false);
        const dataFormat = filterNullProperties(formatLanguageSkillData(data));

        // Check duplicate language skill
        const isDuplicate = dataProps?.some((item: ILanguageSkills) => {
            return item.languageId === data.languageId;
        });

        if (isDuplicate) {
            setPendingLanguageSkill(dataFormat);
            setDataTitleDuplicate({ ...dataFormat, rankId: dataProps?.find(item => item.languageId === data.languageId)?.rankId });
            setIsShowModalDuplicate(true);
            return;
        }

        try {
            turnOnLoading();
            const res = await employeeService.addLanguageSkillsEmployee(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Add language failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Save duplicate language skill
    const handleSaveDuplicate = async () => {
        setIsShowModalDuplicate(false);
        try {
            turnOnLoading();
            if (pendingLanguageSkill) {
                if (valueEdit) {
                    const res = await employeeService.updateLanguageSkillsEmployee(pendingLanguageSkill, moduleName);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                } else {
                    const res = await employeeService.addLanguageSkillsEmployee(pendingLanguageSkill, moduleName);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                }
            }
        } catch (error) {
            showNotification(false, valueEdit ? 'Edit language failed' : 'Add language failed');
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

    // Edit language skill
    const handleEditLanguageSkill = async (data: ILanguageSkills) => {
        setIsShowModalAddLanguageSkill(false);
        const dataFormat = filterNullProperties(formatLanguageSkillData(data));

        const isDuplicate = dataProps?.some((item: ILanguageSkills) => {
            return item.languageId === data.languageId && item.communicationId !== valueEdit?.communicationId;
        });

        if (isDuplicate) {
            setPendingLanguageSkill(dataFormat);
            setDataTitleDuplicate({ ...dataFormat, rankId: dataProps?.find(item => item.languageId === data.languageId)?.rankId });
            setIsShowModalDuplicate(true);
            return;
        }

        try {
            turnOnLoading();
            const res = await employeeService.updateLanguageSkillsEmployee(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Edit language failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Delete language skill
    const handleDeleteLanguageSkill = async () => {
        setIsShowModalDelete(false);
        if (!valueDelete?.communicationId) return;

        try {
            turnOnLoading();
            const res = await employeeService.deleteLanguageSkillsEmployee(valueDelete.communicationId, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Delete language failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Submit form
    const handleSubmit = (data: ILanguageSkills) => {
        if (valueEdit) {
            handleEditLanguageSkill(data);
        } else {
            handleAddLanguageSkill(data);
        }
    };

    // Cancel submit form
    const handleCancelSubmit = () => {
        setIsShowModalAddLanguageSkill(false);
        setValueEdit(undefined);
    };

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();

            try {
                const [languageOptions, languageRankingOptions] = await Promise.all([fetchLanguageOptions(), fetchLanguageRankingOptions()]);

                setLanguageOption(languageOptions);
                setLanguageRankingOption(languageRankingOptions);
            } catch (error) {
                showNotification(false, 'Failed to fetch language option');
            } finally {
                turnOffLoading();
            }
        };

        havePermission('Add') && fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showNotification, turnOffLoading, turnOnLoading]);

    const fetchLanguageOptions = async () => {
        try {
            const resLanguage = await employeeService.getAllLanguageSkillsEmployee(moduleName);
            return (resLanguage.data || []).map(item => ({
                label: item.languageName,
                value: item.languageId
            }));
        } catch (error) {
            throw new Error('Failed to fetch language options');
        }
    };

    const fetchLanguageRankingOptions = async () => {
        try {
            const resLanguageRanking = await employeeService.getAllLanguageRanking();
            return (resLanguageRanking.data || []).map(item => ({
                label: item.rankName,
                value: item.rankId
            }));
        } catch (error) {
            throw new Error('Failed to fetch language ranking options');
        }
    };

    return (
        <>
            <TableHaveAdd
                title="Language Skill"
                dataSource={formatDataTable(dataProps)}
                columns={columnsLanguageSkill}
                handleAdd={havePermission('Add') ? () => setIsShowModalAddLanguageSkill(true) : undefined}
                tableScroll={{ x: 'max-content', y: 452 }}
                loading={isLoading}
            />
            {/* Add and edit education dialog */}
            <DialogHaveField
                form={form}
                title={titleDialog}
                isShow={isShowModalAddLanguageSkill}
                onCancel={() => handleCancelSubmit()}
                data={filedAddNewLanguageSkill}
                handleSubmit={data => handleSubmit(data)}
                classRootName="w-634"
                formItemClassName="total-columns-2"
            />
            {/* Dialog save duplicate language skill */}
            <DialogCommon
                open={isShowModalDuplicate}
                onClose={() => handleCancelModalDuplicate()}
                icon={icons.dialog.warning}
                title="Save Language Skill"
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
                buttonRightClick={() => handleDeleteLanguageSkill()}
            />
        </>
    );
};

export default TableLanguageSkill;
