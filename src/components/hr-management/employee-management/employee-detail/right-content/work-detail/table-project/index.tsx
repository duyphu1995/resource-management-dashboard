import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DialogHaveField from '@/components/common/dialog/dialog-have-field';
import DatePicker from '@/components/common/form/date-picker';
import BaseSelect from '@/components/common/form/select';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import BaseTag from '@/components/common/tag';
import employeeService from '@/services/hr-management/employee-management';
import { IField, ITableHaveActionAddProps } from '@/types/common';
import { IProject } from '@/types/hr-management/employee-management';
import { filterNullProperties, formatDataTable, formatMappingKey, formatTimeMonthDayYear, statusMapping, validateRange0To1000 } from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { Checkbox, Form, InputNumber } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

dayjs.extend(isSameOrBefore);

type ButtonType = {
    icon: string;
    tooltip: string;
    onClick: () => void;
};

const TableProject = (props: ITableHaveActionAddProps<IProject[]>) => {
    const { dataProps: projects = [], setIsReload, statusName, moduleName } = props;

    const [form] = Form.useForm();
    const { id = '' } = useParams();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const nameFromUrl = useGetNameFromUrl();

    // Permission
    const { havePermission } = usePermissions('Projects', nameFromUrl);

    // State of dialog add and edit
    const [isShowModalAddProject, setIsShowModalAddProject] = useState<boolean>(false);
    const [projectOptions, setProjectOptions] = useState<DefaultOptionType[]>([]);
    const [valueEdit, setValueEdit] = useState<IProject>();
    const [pendingProject, setPendingProject] = useState<IProject>();
    const [isShowModalDuplicate, setIsShowModalDuplicate] = useState<boolean>(false);
    const [isShowModalLeave, setIsShowModalLeave] = useState<boolean>(false);
    const [isShowModalEffort, setIsShowModalEffort] = useState<boolean>(false);
    const [valueLeave, setValueLeave] = useState<IProject>();
    const [valueSubmit, setIsValueSubmit] = useState<IProject>();
    const [isTotalEffortProject, setIsTotalEffortProject] = useState<number>(0);

    // Title of dialog add and edit
    const titleDialog = valueEdit ? 'Edit Project' : 'Add New Project';
    const projectName = projects?.find(item => item.projectId === pendingProject?.unitId)?.projectName;
    const contentDuplicate = (
        <>
            Employee working on project <strong>{projectName}</strong>, can't not add duplication
        </>
    );

    const getStatusChecks = useCallback(() => {
        const status = statusName?.toLocaleLowerCase();
        return {
            fullTime: status?.includes('fulltime'),
            partTime: status?.includes('parttime')
        };
    }, [statusName]);

    const { fullTime, partTime } = getStatusChecks();

    const effortContent = (fullTime && '100%') || (partTime && '50%');
    const contentLeave = isShowModalLeave ? (
        <>
            Are you sure you want to leave the project <strong>{valueLeave?.projectName}</strong>?
        </>
    ) : (
        <>
            Total allocated effort of this member is less than contract effort (<strong>{effortContent}</strong>) so main project will be filled for
            remaining effort. Would you like to continue?
        </>
    );

    // Column of table project
    const columnsProjects: ColumnsType<IProject> = [
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: 'Projects Name',
            fixed: 'left',
            width: '12.5%',
            render: (item: string, record: IProject) => {
                const projectLabel = record?.isMainProject ? '(Main project)' : '';
                return renderWithFallback(`${item} ${projectLabel}`);
            }
        },
        {
            dataIndex: 'groupName',
            key: 'groupName',
            title: 'Group',
            width: '12.5%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'effort',
            key: 'effort',
            title: 'Effort',
            width: 'calc(12.5% - 88px)',
            render: item => renderWithFallback(item + '%')
        },
        {
            dataIndex: 'startDate',
            key: 'startDate',
            title: 'Joined Date',
            width: '12.5%',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'endDate',
            key: 'endDate',
            title: 'Leaved Date',
            width: '12.5%',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'employeeProjectStatus',
            key: 'employeeProjectStatus',
            title: 'Status',
            align: 'center',
            width: '12.5%',
            render: item => {
                const statusConfig = statusMapping[formatMappingKey(item)];
                return <BaseTag {...statusConfig} statusName={item} />;
            }
        },
        {
            dataIndex: 'positionName',
            key: 'positionName',
            title: 'Position',
            width: '12.5%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'notes',
            key: 'notes',
            title: 'Note',
            width: '12.5%',
            render: item => renderWithFallback(item)
        },
        {
            title: 'Action',
            align: 'center',
            fixed: 'right',
            width: 88,
            render: (item: IProject) => {
                const handleEdit = (item: IProject) => {
                    form.setFieldsValue({
                        unitId: item.projectId,
                        startDate: dayjs(item.startDate, TIME_FORMAT.VN_DATE),
                        effort: item.effort,
                        isMainProject: item.isMainProject
                    });

                    setValueEdit(item);
                    setIsShowModalAddProject(true);
                };

                const handleLeave = (item: IProject) => {
                    setIsShowModalLeave(true);
                    setValueLeave(item);
                };

                const arrButton: (ButtonType | undefined)[] = [undefined, undefined];
                if (item.employeeProjectStatus === 'Working' && havePermission('Edit')) {
                    arrButton[0] = {
                        icon: icons.tableAction.edit,
                        tooltip: 'Edit',
                        onClick: () => handleEdit(item)
                    };
                }
                if (!item.isMainProject && !item.employeeProjectStatus.toLowerCase().includes('leave') && havePermission('Delete')) {
                    arrButton[1] = {
                        icon: icons.tableAction.leave,
                        tooltip: 'Leave',
                        onClick: () => handleLeave(item)
                    };
                }

                return <ButtonsIcon items={arrButton} />;
            }
        }
    ];

    const watchProject = Form.useWatch('unitId', form);

    // Field add and edit project
    const fieldAddNewProject: IField[] = [
        {
            name: 'unitId',
            label: 'Project Name',
            value: <BaseSelect options={projectOptions} disabled={!!valueEdit} placeholder="Select project name" />,
            validation: [{ required: true, message: 'Please enter the valid value' }]
        },
        {
            name: 'startDate',
            label: 'Joined Date',
            value: <DatePicker disabled />,
            validation: [{ required: true, message: 'Please enter the valid value' }]
        },
        {
            name: 'effort',
            label: 'Effort',
            value: (
                <InputNumber placeholder="Enter effort" className="w-100" disabled={!watchProject} addonAfter="%" min={0} step={1} precision={0} />
            ),
            validation: [validateRange0To1000()]
        },
        {
            label: ' ',
            value: (
                <Form.Item name="isMainProject" valuePropName="checked">
                    <Checkbox disabled={valueEdit?.isMainProject}>Main Project</Checkbox>
                </Form.Item>
            )
        }
    ];

    const clearData = () => {
        form.resetFields();
        setValueEdit(undefined);
        setValueLeave(undefined);
        setPendingProject(undefined);
    };

    const formatProject = (values: IProject) => {
        const { startDate, effort } = values;
        return {
            ...values,
            employeeUnitId: valueEdit?.employeeUnitId,
            employeeId: Number(id),
            startDate: startDate && dayjs(startDate).format(TIME_FORMAT.DATE),
            effort: effort && effort
        };
    };

    // Handle add project
    const handleAddProject = async (data: any) => {
        setIsShowModalAddProject(false);
        const dataFormat = filterNullProperties(formatProject(data));

        // Check duplicate project
        const isDuplicate = projects?.some((item: IProject) => item.projectId === dataFormat.unitId && item.employeeProjectStatus === 'Working');

        if (isDuplicate) {
            setPendingProject(dataFormat);
            setIsShowModalDuplicate(true);
            return;
        }

        try {
            turnOnLoading();
            const res = await employeeService.addEmployeeProject(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Add project failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle edit project
    const handleEditProject = async (data: any) => {
        setIsShowModalAddProject(false);
        const dataFormat = filterNullProperties(formatProject(data));

        // Check duplicate project
        const isDuplicate = projects?.some(
            (item: IProject) =>
                item.projectId === dataFormat.unitId && item.employeeProjectStatus === 'Working' && item.employeeUnitId !== valueEdit?.employeeUnitId
        );

        if (isDuplicate) {
            setPendingProject(dataFormat);
            setIsShowModalDuplicate(true);
            return;
        }

        try {
            turnOnLoading();
            const res = await employeeService.updateEmployeeProject(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Edit project failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle submit
    const handleSubmit = (data: IProject) => {
        if (valueEdit) {
            handleEditProject(data);
        } else {
            handleAddProject(data);
        }
    };

    // Handle cancel modal
    const handleCancel = () => {
        setIsShowModalAddProject(false);
        setIsShowModalDuplicate(false);
        setIsShowModalLeave(false);
        setIsShowModalEffort(false);
        clearData();
    };

    // Handle leave project
    const handleLeaveProject = async () => {
        setIsShowModalLeave(false);
        if (!valueLeave) return;

        try {
            turnOnLoading();
            const res = await employeeService.leaveEmployeeProject(valueLeave?.employeeUnitId, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Leave project failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    const handleWaringProject = async () => {
        if (!valueSubmit) return;

        setIsShowModalEffort(false);
        const dataFormat = filterNullProperties(formatProject(valueSubmit));

        try {
            turnOnLoading();
            await employeeService.updateEmployeeProject(dataFormat, moduleName);
        } catch (error) {
            showNotification(false, 'Edit project failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    const handleClickAddProject = () => {
        setIsShowModalAddProject(true);
        form.setFieldValue('startDate', dayjs());
    };

    const watchEffort = Form.useWatch('effort', form);

    useEffect(() => {
        const dataFilter = projects?.filter(item => item.employeeUnitId !== valueEdit?.employeeUnitId);
        const totalEffort = dataFilter?.reduce((acc: number, item: IProject) => acc + item.effort, 0);

        setIsTotalEffortProject(Number(totalEffort) + Number(watchEffort));
    }, [valueEdit, projects, watchEffort]);

    useEffect(() => {
        const getProject = async () => {
            try {
                turnOnLoading();
                const res = await employeeService.getAllProjects();
                const data = res.data || [];
                const newProjectOption = data.map((item: any) => {
                    return {
                        label: item.projectName,
                        value: item.projectId
                    };
                });

                setProjectOptions(newProjectOption);
            } catch (error) {
                showNotification(false, 'Get options project failed');
            } finally {
                turnOffLoading();
            }
        };

        havePermission('Add') && getProject();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showNotification, turnOnLoading, turnOffLoading]);

    return (
        <>
            <TableHaveAdd
                title="Projects"
                dataSource={formatDataTable(projects)}
                columns={columnsProjects}
                handleAdd={havePermission('Add') ? handleClickAddProject : undefined}
                tableScroll={{ x: 'max-content', y: 400 }}
                loading={isLoading}
            />
            {/* Add and edit project dialog */}
            <DialogHaveField
                form={form}
                title={titleDialog}
                isShow={isShowModalAddProject}
                onCancel={() => handleCancel()}
                data={fieldAddNewProject}
                handleSubmit={data => {
                    setIsShowModalAddProject(false);
                    if (isTotalEffortProject < 100 || isTotalEffortProject < 50) {
                        setIsShowModalEffort(true);
                        setIsValueSubmit(data);
                    } else {
                        handleSubmit(data);
                    }
                }}
            />

            {/* Dialog save duplicate */}
            <DialogCommon
                open={isShowModalDuplicate}
                onClose={() => handleCancel()}
                icon={icons.dialog.warning}
                title="Can’t Create"
                content={contentDuplicate}
                buttonType="default-primary"
                hiddenButtonLeft
                buttonRightClick={() => setIsShowModalDuplicate(false)}
                buttonRight="Close"
            />

            {/* Dialog leave || warning effort < 100 */}
            <DialogCommon
                open={isShowModalLeave || isShowModalEffort}
                onClose={() => handleCancel()}
                icon={icons.dialog.warning}
                title={isShowModalLeave ? 'Leave Project' : 'Warning'}
                content={contentLeave}
                buttonType="default-primary"
                buttonLeftClick={() => handleCancel()}
                buttonRightClick={() => (isShowModalLeave ? handleLeaveProject() : handleWaringProject())}
                buttonRight={isShowModalLeave ? 'Leave' : 'OK'}
            />
        </>
    );
};

export default TableProject;
