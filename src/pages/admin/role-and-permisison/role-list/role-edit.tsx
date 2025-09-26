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
import { ICreateRole } from '@/types/admin';
import { IPermission } from '@/types/auth';
import { IField } from '@/types/common';
import { formatDataTable, formatTreeData, recursiveFind, validateEnterValidValue } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Empty, Flex, Form, Input, Spin, Tooltip } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ColumnType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../index.scss';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { titleTooltipRoleAndPermission } from '@/utils/constants';

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

const breadcrumbItems = [
    { title: pathnames.admin.main.name },
    {
        title: pathnames.admin.roleAndPermission.main.name,
        path: pathnames.admin.roleAndPermission.main.path
    },
    { title: pathnames.admin.roleAndPermission.edit.name }
];

const EditRolePage = () => {
    const navigation = useNavigate();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();

    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [loadingForm, setLoadingForm] = useState(false);
    const [menuOptions, setMenuOptions] = useState<IFilterOption[]>([]);
    const [subMenuOptions, setSubMenuOptions] = useState<IFilterOption[]>([]);
    const [subMenuSelected, setSubMenuSelected] = useState<IFilterOption | null>();

    const { roleGroupId = '' } = useParams();
    const location = useLocation();
    const { menuId, subMenuId } = location.state;

    const pageTitle = () => {
        return (
            <div>
                <span style={{marginRight: 5}}> {pathnames.admin.roleAndPermission.edit.name}</span>
                <Tooltip title={titleTooltipRoleAndPermission}  overlayStyle={{ maxWidth: '450px' }}>
                  <QuestionCircleOutlined style={{fontSize: 18}}/>
                </Tooltip>
            </div>
        )
    }
    const onGoBack = () => navigation(pathnames.admin.roleAndPermission.detail.path + '/' + roleGroupId);

    const buttons: ButtonProps[] = [{ type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }];

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

    const onFinish = async (value: ICreateRole) => {
        const sections = getAllAccessibleSections(menuOptions);

        try {
            setLoadingForm(true);
            const body: any = {
                roleName: value.roleName,
                items: sections
            };
            const res = await roleAndPermissionService.updateRole(body, roleGroupId);
            const { succeeded = false, message = '' } = res;

            if (succeeded) {
                navigation(pathnames.admin.roleAndPermission.main.path);
            }
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'An unexpected error occurred');
        } finally {
            setLoadingForm(false);
        }
    };

    const handleChangeMenu = (value: number) => {
        const subMenu = menuOptions.find((item: IFilterOption) => item.value === value)?.subMenus || [];
        setSubMenuOptions(formatTreeData(subMenu));
        form.resetFields(['subMenu']);
        setSubMenuSelected(null);
    };

    const handleChangeSubMenu = async (value: number) => {
        const section = recursiveFind(subMenuOptions, value);
        await setSubMenuSelected(section);
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

    const formatMenu = (permissions: IPermission[]): IFilterOption[] => {
        return permissions.map((item: IPermission) => ({
            ...item,
            label: item.name,
            value: item.id,
            subMenus: item.subMenus ? formatMenu(item.subMenus) : undefined
        }));
    };

    const fields: IField[] = [
        {
            label: 'Role Name',
            name: 'roleName',
            value: <Input placeholder="Enter role name" />,
            validation: [validateEnterValidValue]
        }
    ];

    const fields2: IField[] = [
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
                    const editedFields = record.fieldsForEditData?.map((item: any) => ({
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
                            options={editedFields}
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

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await roleAndPermissionService.getDetailUserRole(roleGroupId);
            const { data = [] as any } = res;

            const menuFormat = formatMenu(data.menus);
            const subMenu = menuFormat.find((item: IFilterOption) => item.value === menuId)?.subMenus || [];

            setMenuOptions(menuFormat);
            setSubMenuOptions(formatTreeData(subMenu));
            form.setFieldsValue({
                menu: menuId,
                subMenu: subMenuId,
                roleName: data.roleName
            });
            setSubMenuSelected(subMenu[0]);
            turnOffLoading();
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            {isLoading && <Spin spinning={isLoading} size="large" className="overlay-loading" />}
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

export default EditRolePage;
