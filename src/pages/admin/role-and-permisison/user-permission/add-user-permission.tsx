import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import EmployeeSelect from '@/components/common/employee-select';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import roleAndPermissionService from '@/services/admin/role-and-permission';
import { ICreateUserPermission, IRoleList } from '@/types/admin';
import { IPermission } from '@/types/auth';
import { IField } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import { formatDataTable, formatTreeData, recursiveFind } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { ButtonProps, Empty, Flex, Form, Tooltip } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ColumnType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.scss';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { titleTooltipRoleAndPermissionAdditional } from '@/utils/constants';

const breadcrumbItems = [
    { title: pathnames.admin.main.name },
    {
        title: pathnames.admin.roleAndPermission.main.name,
        path: pathnames.admin.roleAndPermission.main.path
    },
    { title: pathnames.admin.roleAndPermission.addUserPermission.name }
];

const accessOptions: DefaultOptionType[] = [
    {
        label: 'Yes',
        value: 'true'
    },
    {
        label: 'No',
        value: 'false'
    }
];

interface IFilterOption {
    id?: number;
    label: string;
    value: number;
    subMenus?: IFilterOption[];
}

const AddUserPermission = () => {
    const navigation = useNavigate();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const [loadingForm, setLoadingForm] = useState(false);
    const [warningData, setWarningData] = useState<any | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [userInformation, setUserInformation] = useState<any>();
    const [roleOptions, setRoleOptions] = useState<IFilterOption[]>([]);
    const [menuOptions, setMenuOptions] = useState<IFilterOption[]>([]);
    const [subMenuOptions, setSubMenuOptions] = useState<IFilterOption[]>([]);
    const [subMenuSelected, setSubMenuSelected] = useState<any | null>();
    const [menuOptionsAdditional, setMenuOptionsAdditional] = useState<IFilterOption[]>([]);
    const [subMenuOptionsAdditional, setSubMenuOptionsAdditional] = useState<IFilterOption[]>([]);
    const [subMenuSelectedAdditional, setSubMenuSelectedAdditional] = useState<any | null>();

    const warningDialogTitle = `Can’t create`;
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const formatMenu = (permissions: IPermission[]): IFilterOption[] => {
        return permissions.map((item: IPermission) => ({
            ...item,
            label: item.name,
            value: item.id,
            subMenus: item.subMenus ? formatMenu(item.subMenus) : undefined
        }));
    };

    const handleChangeRole = async (value: string) => {
        turnOnLoading();

        const res = await roleAndPermissionService.getUerPermissionByRole(value);
        const { data = [] as any } = res;

        const menuFormat = formatMenu(data.userPermissionData);
        const menuAdditionalFormat = formatMenu(data.additionalPermissionData);

        setMenuOptions(menuFormat);
        setMenuOptionsAdditional(menuAdditionalFormat);

        form.resetFields(['menu', 'subMenu', 'menuAdditional', 'subMenuAdditional']);

        setSubMenuSelected(null);
        setSubMenuSelectedAdditional(null);

        turnOffLoading();
    };

    const handleChangeMenu = (value: number) => {
        const subMenu = menuOptions.find((item: IFilterOption) => item.value === value)?.subMenus || [];
        setSubMenuOptions(formatTreeData(subMenu));
        form.resetFields(['subMenu']);
        setSubMenuSelected(null);
    };

    const handleChangeSubMenu = async (value: number) => {
        const subMenuSelected = recursiveFind(subMenuOptions, value);
        await setSubMenuSelected(subMenuSelected);
    };

    const handleChangeMenuAdditional = (value: number) => {
        const subMenu = menuOptionsAdditional.find((item: IFilterOption) => item.value === value)?.subMenus || [];
        setSubMenuOptionsAdditional(formatTreeData(subMenu));
        form.resetFields(['subMenuAdditional']);
        setSubMenuSelectedAdditional(null);
    };

    const handleChangeSubMenuAdditional = async (value: number) => {
        const subMenuSelected = recursiveFind(subMenuOptionsAdditional, value);
        await setSubMenuSelectedAdditional(subMenuSelected);
    };

    useEffect(() => {
        const fetchFilterData = async () => {
            turnOnLoading();

            const resRoleList = await roleAndPermissionService.getAllRoleList();
            const { data: dataRoleList = [] } = resRoleList;
            const format: any = dataRoleList.map((item: IRoleList) => ({
                label: item.roleName,
                value: item.roleGroupId
            }));
            setRoleOptions(format);
            turnOffLoading();
        };
        fetchFilterData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const warningDialogContent = <div style={{ width: 384 }}>{warningData}</div>;

    const pageTitle = pathnames.admin.roleAndPermission.addUserPermission.name;

    const onGoBack = () => navigation(pathnames.admin.roleAndPermission.main.path);

    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ];



    const getAllAccessibleSections = (data: any, isAdditional: boolean): any[] => {
        const processSubMenus = (menuId: number, subMenus: any[], parentSubMenuId?: number): any[] => {
            return subMenus.flatMap((subMenu: any) => {
                if (subMenu.subMenus?.length > 0) {
                    return processSubMenus(menuId, subMenu.subMenus, subMenu.id);
                } else {
                    return subMenu.sections.map((item: any) => ({
                        menuId,
                        subMenuId: parentSubMenuId || subMenu.id,
                        sectionId: item.id,
                        isAccess: item.isAccess,
                        operations: item.userOperations,
                        fieldsForSensitiveData: item.userFieldsForSensitiveData,
                        fieldsForRestrictData: item.userFieldsForRestrictData,
                        fieldsForEditData: item.userFieldsForEditData,
                        isDataLimit: item.isDataLimit,
                        isAdditional,
                        isUIDisabled: isAdditional ? item.isUIDisabled : undefined
                    }));
                }
            });
        };
        return data.flatMap((menu: any) => processSubMenus(menu.id, menu.subMenus));
    };


    const onFinish = async (value: ICreateUserPermission) => {
        try {
            setLoadingForm(true);
            const sections = getAllAccessibleSections(menuOptions, false);
            const sectionsAdditional = getAllAccessibleSections(menuOptionsAdditional, true);
            const sectionsAdditionalFilter = sectionsAdditional.filter((item: any) => !item.isUIDisabled);

            const body: any = {
                employeeId: userInformation.employeeId,
                roleGroupId: value.role,
                items: [...sections, ...sectionsAdditionalFilter]
            };
            const res = await roleAndPermissionService.addUserPermission(body);
            const { succeeded = false, message = '' } = res;

            if (succeeded) {
                onGoBack();
            }
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'An unexpected error occurred');
        } finally {
            setLoadingForm(false);
        }
    };

    const onShowWarningDialog = (message: string) => {
        setWarningData(message);
        setShowWarningDialog(true);
    };
    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
        form.resetFields();
        setUserInformation(null);
    };

    const handleChangeField = (fieldName: string, value: any, sectionId: number) => {
        const menuId: number = form.getFieldValue('menu');
        const subMenuId: number = form.getFieldValue('subMenu');

        setMenuOptions(prevData =>
            prevData.map(menu =>
                menu.id === menuId
                    ? {
                        ...menu,
                        subMenus: updateSubMenus(menu?.subMenus || [])
                    }
                    : menu
            )
        );

        function updateSubMenus(subMenus: any[]): any[] {
            return subMenus.map((submenu: any) => {
                if (submenu.subMenus?.length > 0) {
                    return {
                        ...submenu,
                        subMenus: updateSubMenus(submenu.subMenus)
                    };
                } else {
                    return submenu.id === subMenuId
                        ? {
                            ...submenu,
                            sections: submenu.sections.map((section: any) =>
                                section.id === sectionId
                                    ? { ...section, [fieldName]: value }
                                    : section
                            )
                        }
                        : submenu;
                }
            });
        }
    };

    const handleChangeFieldAdditional = (fieldName: string, value: any, sectionId: number) => {
        const menuId: number = form.getFieldValue('menuAdditional');
        const subMenuId: number = form.getFieldValue('subMenuAdditional');

        setMenuOptionsAdditional(prevData =>
            prevData.map(menu =>
                menu.id === menuId
                    ? {
                        ...menu,
                        subMenus: updateSubMenus(menu?.subMenus || [])
                    }
                    : menu
            )
        );

        function updateSubMenus(subMenus: any[]): any[] {
            return subMenus.map((submenu: any) => {
                if (submenu.subMenus?.length > 0) {
                    return {
                        ...submenu,
                        subMenus: updateSubMenus(submenu.subMenus)
                    };
                } else {
                    return submenu.id === subMenuId
                        ? {
                            ...submenu,
                            sections: submenu.sections.map((section: any) =>
                                section.id === sectionId
                                    ? { ...section, [fieldName]: value }
                                    : section
                            )
                        }
                        : submenu;
                }
            });
        }
    };

    // set value project options for form
    useEffect(() => {
        if (userInformation) {
            const fetchDataProject = async () => {
                const res = await roleAndPermissionService.checkExistUserPermission(userInformation.employeeId);
                const { message = '', data } = res;
                if (data) {
                    const { userPermissionData } = data as any;
                    handleChangeRole(userPermissionData.roleGroupId);
                    form.setFieldsValue({
                        role: userPermissionData?.roleGroupId
                    });
                } else {
                    onShowWarningDialog(message);
                }
            };
            fetchDataProject();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInformation]);

    const handleChangeEmployee = async (employee: IEmployee | null) => {
        if (employee) {
            form.setFieldsValue({
                fullName: employee?.fullName
            });
            setUserInformation(employee);
        }
    };

    const fields = useMemo(
        () => [
            {
                label: 'Full Name',
                name: 'fullName',
                value: (
                    <EmployeeSelect
                        width={'100%'}
                        getAPI={roleAndPermissionService.getEmployeeInformation}
                        onSelectedEmployee={handleChangeEmployee}
                    />
                ),
                validation: [{ required: true, message: 'Please select valid value' }]
            },
            {
                label: 'Badge ID',
                name: 'badgeID',
                value: userInformation?.badgeId
            },
            {
                label: 'Work Email',
                name: 'workEmail',
                value: userInformation?.workEmail
            }
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [userInformation]
    );

    const fields2: IField[] = [
        {
            label: 'Project',
            name: 'project',
            value: userInformation?.projectName
        },
        {
            label: 'Position',
            name: 'position',
            value: userInformation?.positionName
        },
        {
            label: 'Company',
            name: 'company',
            value: userInformation?.companyName
        }
    ];

    const fields3: IField[] = [
        {
            label: 'Role',
            name: 'role',
            value: <BaseSelect options={roleOptions} placeholder="Select role" onChange={handleChangeRole} />,
            validation: [{ required: true, message: 'Please select valid value' }]
        }
    ];

    const fields4: IField[] = [
        {
            label: 'Menu',
            name: 'menu',
            value: <BaseSelect allowClear={false} options={menuOptions} placeholder="Select menu" onChange={handleChangeMenu} />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: 'Submenu',
            name: 'subMenu',
            value: <TreeSelect allowClear={false} treeData={subMenuOptions} placeholder="Select submenu" onChange={handleChangeSubMenu} />,
            validation: [{ required: true, message: 'Please select valid value' }]
        }
    ];

    const fields5: IField[] = [
        {
            label: 'Menu',
            name: 'menuAdditional',
            value: <BaseSelect options={menuOptionsAdditional} placeholder="Select menu" onChange={handleChangeMenuAdditional} />
        },
        {
            label: 'Submenu',
            name: 'subMenuAdditional',
            value: <TreeSelect treeData={subMenuOptionsAdditional} placeholder="Select submenu" onChange={handleChangeSubMenuAdditional} />
        }
    ];

    const columns = useMemo<ColumnType<any>[]>(
        () => [
            {
                key: 'section',
                title: 'Section',
                width: '13%',
                fixed: 'left',
                render: (record: any) => renderWithFallback(record.name)
            },
            {
                key: 'access',
                title: 'Access',
                width: '13%',
                render: record => {
                    const isSpecialId = [74, 75, 76].includes(record.id);
                    return (
                        <BaseSelect
                            key="access"
                            getPopupContainer={() => document.body}
                            value={record.isAccess ? 'Yes' : 'No'}
                            options={accessOptions}
                            allowClear={false}
                            disabled={isSpecialId}
                            onChange={value => handleChangeField('isAccess', value === 'true', record.id)}
                        />
                    );
                }
            },
            {
                key: 'action',
                title: 'Action',
                width: '13%',
                render: record => {
                    const actionOptions = record?.operations?.map((item: any) => ({
                        label: item,
                        value: item
                    }));
                    return (
                        <BaseSelect
                            key="action"
                            value={record.userOperations}
                            getPopupContainer={() => document.body}
                            maxTagCount={1}
                            mode="multiple"
                            options={actionOptions}
                            placeholder="Select menu"
                            onChange={value => handleChangeField('userOperations', value, record.id)}
                        />
                    );
                }
            },
            {
                key: 'sensitiveField',
                title: 'Sensitive Field',
                width: '13%',
                render: record => {
                    const sensitiveFields = record?.fieldsForSensitiveData?.map((item: any) => ({
                        label: item,
                        value: item
                    }));
                    return (
                        <BaseSelect
                            key="sensitiveField"
                            value={record.userFieldsForSensitiveData}
                            getPopupContainer={() => document.body}
                            maxTagCount={1}
                            mode="multiple"
                            options={sensitiveFields}
                            placeholder="Select menu"
                            onChange={value => handleChangeField('userFieldsForSensitiveData', value, record.id)}
                        />
                    );
                }
            },
            {
                key: 'restrictField',
                title: 'Restrict Field',
                width: '13%',
                render: record => {
                    const restrictFields = record.fieldsForRestrictData?.map((item: any) => ({
                        label: item,
                        value: item
                    }));
                    return (
                        <BaseSelect
                            key="restrictField"
                            value={record.userFieldsForRestrictData}
                            getPopupContainer={() => document.body}
                            maxTagCount={1}
                            mode="multiple"
                            options={restrictFields}
                            placeholder="Select menu"
                            onChange={value => handleChangeField('userFieldsForRestrictData', value, record.id)}
                        />
                    );
                }
            },
            {
                key: 'editedField',
                title: 'Edited Field',
                width: '13%',
                render: record => {
                    const restrictFields = record.fieldsForEditData?.map((item: any) => ({
                        label: item,
                        value: item
                    }));
                    return (
                        <BaseSelect
                            key="editedField"
                            value={record.userFieldsForEditData}
                            getPopupContainer={() => document.body}
                            maxTagCount={1}
                            mode="multiple"
                            options={restrictFields}
                            placeholder="Select menu"
                            onChange={value => handleChangeField('userFieldsForEditData', value, record.id)}
                        />
                    );
                }
            },
            {
                key: 'limitedData',
                title: 'Limited Data',
                width: '13%',
                render: record => (
                    <BaseSelect
                        key="limitedData"
                        value={record.isDataLimit ? 'Yes' : 'No'}
                        getPopupContainer={() => document.body}
                        defaultValue={accessOptions[1].value}
                        options={accessOptions}
                        allowClear={false}
                        onChange={value => handleChangeField('isDataLimit', value === 'true', record.id)}
                        disabled={!subMenuSelected?.isEnableDataLimitField}
                    />
                )
            }
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [accessOptions, subMenuSelected]
    );

    const columns2 = useMemo<ColumnType<any>[]>(
        () => [
            {
                key: 'section',
                title: 'Section',
                width: '13%',
                fixed: 'left',
                render: (record: any) => renderWithFallback(record.name)
            },
            {
                key: 'access',
                title: 'Access',
                width: '13%',
                render: record => (
                    <BaseSelect
                        key="access"
                        value={record.isAccess ? 'Yes' : 'No'}
                        getPopupContainer={() => document.body}
                        options={accessOptions}
                        allowClear={false}
                        onChange={value => handleChangeFieldAdditional('isAccess', value === 'true', record.id)}
                        disabled={record.isUIDisabled}
                    />
                )
            },
            {
                key: 'action',
                title: 'Action',
                width: '13%',
                render: record => {
                    const actionOptions = record?.operations?.map((item: any) => ({
                        label: item,
                        value: item
                    }));
                    return (
                        <BaseSelect
                            key="action"
                            value={record.userOperations}
                            getPopupContainer={() => document.body}
                            maxTagCount={1}
                            mode="multiple"
                            options={actionOptions}
                            placeholder="Select menu"
                            onChange={value => handleChangeFieldAdditional('userOperations', value, record.id)}
                            disabled={record.isUIDisabled}
                        />
                    );
                }
            },
            {
                key: 'sensitiveField',
                title: 'Sensitive Field',
                width: '13%',
                render: record => {
                    const sensitiveFields = record?.fieldsForSensitiveData?.map((item: any) => ({
                        label: item,
                        value: item
                    }));
                    return (
                        <BaseSelect
                            key="sensitiveField"
                            value={record.userFieldsForSensitiveData}
                            getPopupContainer={() => document.body}
                            maxTagCount={1}
                            mode="multiple"
                            options={sensitiveFields}
                            placeholder="Select menu"
                            onChange={value => handleChangeFieldAdditional('userFieldsForSensitiveData', value, record.id)}
                            disabled={record.isUIDisabled}
                        />
                    );
                }
            },
            {
                key: 'restrictField',
                title: 'Restrict Field',
                width: '13%',
                render: record => {
                    const restrictFields = record.fieldsForRestrictData?.map((item: any) => ({
                        label: item,
                        value: item
                    }));
                    return (
                        <BaseSelect
                            key="restrictField"
                            value={record.userFieldsForRestrictData}
                            getPopupContainer={() => document.body}
                            maxTagCount={1}
                            mode="multiple"
                            options={restrictFields}
                            placeholder="Select menu"
                            onChange={value => handleChangeFieldAdditional('userFieldsForRestrictData', value, record.id)}
                            disabled={record.isUIDisabled}
                        />
                    );
                }
            },
            {
                key: 'editedField',
                title: 'Edited Field',
                width: '13%',
                render: record => {
                    const restrictFields = record.fieldsForEditData?.map((item: any) => ({
                        label: item,
                        value: item
                    }));
                    return (
                        <BaseSelect
                            key="editedField"
                            value={record.userFieldsForEditData}
                            getPopupContainer={() => document.body}
                            maxTagCount={1}
                            mode="multiple"
                            options={restrictFields}
                            placeholder="Select menu"
                            onChange={value => handleChangeFieldAdditional('userFieldsForEditData', value, record.id)}
                            disabled={record.isUIDisabled}
                        />
                    );
                }
            },
            {
                key: 'limitedData',
                title: 'Limited Data',
                width: '13%',
                render: record => (
                    <BaseSelect
                        key="limitedData"
                        value={record.isDataLimit ? 'Yes' : 'No'}
                        getPopupContainer={() => document.body}
                        defaultValue={accessOptions[1].value}
                        options={accessOptions}
                        allowClear={false}
                        onChange={value => handleChangeFieldAdditional('isDataLimit', value === 'true', record.id)}
                        disabled={subMenuSelectedAdditional?.isEnableDataLimitField || record.isUIDisabled}
                    />
                )
            }
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [accessOptions, subMenuSelectedAdditional]
    );

    const rowClassName = () => {
        return 'table-role-and-permission';
    };

    const sectionOptionsShow = () => {
        const menuId: number = form.getFieldValue('menu');
        const subMenuId: number = form.getFieldValue('subMenu');
        let subMenu = menuOptions?.find((item: IFilterOption) => item.value === menuId)?.subMenus || [];
        subMenu = formatTreeData(subMenu);
        const subMenuSelected = recursiveFind(subMenu, subMenuId);
        const filterSection = subMenuSelected?.sections || [];
        return filterSection;
    };

    const sectionOptionsAdditionalShow = () => {
        const menuId: number = form.getFieldValue('menuAdditional');
        const subMenuId: number = form.getFieldValue('subMenuAdditional');
        let subMenu = menuOptionsAdditional?.find((item: IFilterOption) => item.value === menuId)?.subMenus || [];
        subMenu = formatTreeData(subMenu);
        const subMenuSelected = recursiveFind(subMenu, subMenuId);
        const filterSection = subMenuSelected?.sections.filter((item: any) => !item.isUIDisabled) || [];
        return filterSection;
    };

    const pageTitleTooltip = () => {
        return (
            <div>
                <span style={{ marginRight: 5 }}> {"Additional Permission"}</span>
                <Tooltip title={titleTooltipRoleAndPermissionAdditional} overlayStyle={{ maxWidth: '450px' }}>
                    <QuestionCircleOutlined style={{ fontSize: 18 }} />
                </Tooltip>
            </div>
        )
    }

    return (
        <DetailContent>
            <Form form={form} name="positionForm" requiredMark={RequiredMark} layout="vertical" onFinish={onFinish} style={{ height: '100%' }}>
                <BaseBreadcrumb dataItem={breadcrumbItems} />
                <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={onGoBack} />

                <div className="table-container-permission">
                    <DetailHeader pageTitle="User Information" buttons={[]} />
                    <Flex vertical gap={24}>
                        <DetailFields data={fields} />
                        <DetailFields data={fields2} />
                    </Flex>
                </div>
                <div className="table-container-permission">
                    <DetailHeader pageTitle="User Permission" buttons={[]} />
                    <Flex vertical gap={24}>
                        <DetailFields data={fields3} />
                        <DetailFields data={fields4} />
                    </Flex>

                    <div className="table-container-permission">
                        {subMenuSelected ? (
                            <>
                                <DetailHeader pageTitle={subMenuSelected.label} buttons={[]} />
                                <BaseTable
                                    rowClassName={rowClassName}
                                    bordered
                                    pagination={false}
                                    columns={columns}
                                    dataSource={formatDataTable(sectionOptionsShow())}
                                    style={{ marginTop: 24 }}
                                    loading={isLoading}
                                />
                            </>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <h1>
                                        <div>No Data</div>
                                    </h1>
                                }
                            />
                        )}
                    </div>
                </div>

                <div className="table-container-permission">
                    <DetailHeader pageTitle={pageTitleTooltip()} buttons={[]} />
                    <Flex vertical gap={24}>
                        <DetailFields data={fields5} />
                    </Flex>

                    <div className="table-container-permission">
                        {subMenuSelectedAdditional ? (
                            <>
                                <DetailHeader pageTitle={subMenuSelectedAdditional.label} buttons={[]} />
                                <BaseTable
                                    rowClassName={rowClassName}
                                    bordered
                                    pagination={false}
                                    columns={columns2}
                                    dataSource={formatDataTable(sectionOptionsAdditionalShow())}
                                    style={{ marginTop: 24 }}
                                    loading={isLoading}
                                />
                            </>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <h1>
                                        <div>No Data</div>
                                    </h1>
                                }
                            />
                        )}
                    </div>
                </div>

                <DialogCommon
                    title={warningDialogTitle}
                    icon={icons.dialog.warning}
                    content={warningDialogContent}
                    open={showWarningDialog}
                    onClose={onCloseWarningDialog}
                    buttonType="default-primary"
                    hiddenButtonLeft={true}
                    buttonRight="Close"
                    buttonRightClick={onCloseWarningDialog}
                />
            </Form>
        </DetailContent>
    );
};

export default AddUserPermission;
