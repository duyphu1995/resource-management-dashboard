import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import roleAndPermissionService from '@/services/admin/role-and-permission';
import employeeService from '@/services/hr-management/employee-management';
import { IRoleList } from '@/types/admin';
import { IPermission } from '@/types/auth';
import { IField } from '@/types/common';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';
import { formatDataTable, formatTreeData, recursiveFind, remapUnits } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Empty, Flex, Form, Tooltip } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ColumnType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.scss';
import { titleTooltipRoleAndPermission } from '@/utils/constants';
import { QuestionCircleOutlined } from '@ant-design/icons';

const breadcrumbItems = [
    { title: pathnames.admin.main.name },
    {
        title: pathnames.admin.roleAndPermission.main.name,
        path: pathnames.admin.roleAndPermission.main.path
    },
    { title: pathnames.admin.roleAndPermission.addUserPermissionByUnit.name }
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
    id: number;
    label: string;
    value: number;
    sections: any[];
    isEnableDataLimitField?: boolean;
    subMenus?: IFilterOption[];
}

const AddNewUserRole = () => {
    const navigation = useNavigate();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const [loadingForm, setLoadingForm] = useState(false);

    const [units, setUnits] = useState<IEmployeeUnit[]>([]);
    const [roleOptions, setRoleOptions] = useState<IFilterOption[]>([]);
    const [menuOptions, setMenuOptions] = useState<IFilterOption[]>([]);
    const [subMenuOptions, setSubMenuOptions] = useState<IFilterOption[]>([]);
    const [subMenuSelected, setSubMenuSelected] = useState<IFilterOption | null>();

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

        setMenuOptions(menuFormat);

        form.resetFields(['menu', 'subMenu']);
        setSubMenuSelected(null);

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

    // Fetch filter data
    useEffect(() => {
        const fetchFilterData = async () => {
            turnOnLoading();
            const res = await employeeService.getAllIndexes('RoleAndPermission');
            const { data } = res;
            const unitData = remapUnits(data?.units || []);
            setUnits(unitData);

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

    const pageTitle = () => {
        return (
            <div>
                <span style={{ marginRight: 5 }}> {pathnames.admin.roleAndPermission.addUserPermissionByUnit.name}</span>
                <Tooltip title={titleTooltipRoleAndPermission} overlayStyle={{ maxWidth: '450px' }}>
                    <QuestionCircleOutlined style={{ fontSize: 18 }} />
                </Tooltip>
            </div>
        );
    };

    const onGoBack = () => navigation(pathnames.admin.roleAndPermission.main.path);

    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ];

    const getAllAccessibleSections = (data: any): any[] => {
        const processSubMenus = (subMenus: any[]): any[] => {
            return subMenus.flatMap((subMenu: any) => {
                if (subMenu.subMenus?.length > 0) {
                    return processSubMenus(subMenu.subMenus);
                } else {
                    return subMenu.sections.map((item: any) => ({
                        sectionId: item.id,
                        isAccess: item.isAccess,
                        operations: item.userOperations,
                        fieldsForSensitiveData: item.userFieldsForSensitiveData,
                        fieldsForRestrictData: item.userFieldsForRestrictData,
                        fieldsForEditData: item.userFieldsForEditData,
                        isDataLimit: item.isDataLimit
                    }));
                }
            });
        };
        return data.flatMap((menu: any) => processSubMenus(menu.subMenus));
    };

    const onFinish = async (value: any) => {
        try {
            const sections = getAllAccessibleSections(menuOptions);
            setLoadingForm(true);
            const body: any = {
                roleGroupId: value.role,
                items: sections
            };
            const res = await roleAndPermissionService.addUserPermissionByUnit(body, value?.unit);
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

    const fields: IField[] = [
        {
            label: 'Unit',
            name: 'unit',
            value: <TreeSelect size="middle" treeData={units} placeholder="Select unit" searchPlaceholder="Search unit" />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: 'Role',
            name: 'role',
            value: <BaseSelect options={roleOptions} placeholder="Select role" onChange={handleChangeRole} />,
            validation: [{ required: true, message: 'Please select valid value' }]
        }
    ];

    const fields2: IField[] = [
        {
            label: 'Menu',
            name: 'menu',
            value: <BaseSelect options={menuOptions} placeholder="Select menu" onChange={handleChangeMenu} />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: 'Submenu',
            name: 'subMenu',
            value: <TreeSelect treeData={subMenuOptions} placeholder="Select submenu" onChange={handleChangeSubMenu} />,
            validation: [{ required: true, message: 'Please select valid value' }]
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
                            defaultValue={accessOptions[0].value}
                            getPopupContainer={() => document.body}
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

    return (
        <DetailContent>
            <Form form={form} name="positionForm" requiredMark={RequiredMark} layout="vertical" onFinish={onFinish} style={{ height: '100%' }}>
                <BaseBreadcrumb dataItem={breadcrumbItems} />
                <DetailHeader pageTitle={pageTitle()} buttons={buttons} goBack={onGoBack} />

                <DetailInfo>
                    <Flex vertical gap={24}>
                        <DetailFields data={fields} />
                        <DetailFields data={fields2} />
                    </Flex>
                </DetailInfo>

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
            </Form>
        </DetailContent>
    );
};

export default AddNewUserRole;
