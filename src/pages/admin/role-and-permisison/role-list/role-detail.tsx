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
import { IRoleList } from '@/types/admin';
import { IPermission } from '@/types/auth';
import { IField } from '@/types/common';
import { formatDataTable, formatTreeData, recursiveFind, validateEnterValidValue } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import { ButtonProps, Empty, Flex, Form, Input, Spin, Tooltip } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../index.scss';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { titleTooltipRoleAndPermission } from '@/utils/constants';
interface IFilterOption {
    id: number;
    label: string;
    value: number;
    sections?: any;
    subMenus?: IFilterOption[];
}

const breadcrumbItems = [
    { title: pathnames.admin.main.name },
    {
        title: pathnames.admin.roleAndPermission.main.name,
        path: pathnames.admin.roleAndPermission.main.path
    },
    { title: pathnames.admin.roleAndPermission.detail.name }
];

const DetailRolePage = () => {
    const navigation = useNavigate();
    const [form] = Form.useForm();
    const [menuOptions, setMenuOptions] = useState<IFilterOption[]>([]);
    const [subMenuOptions, setSubMenuOptions] = useState<IFilterOption[]>([]);
    const [sectionOptions, setSectionOptions] = useState<IFilterOption[]>([]);
    const [subMenuSelected, setSubMenuSelected] = useState<IFilterOption | null>();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const { roleGroupId = '' } = useParams();

    const pageTitle = () => {
        return (
            <div>
                <span style={{ marginRight: 5 }}> {pathnames.admin.roleAndPermission.detail.name}</span>
                <Tooltip title={titleTooltipRoleAndPermission} overlayStyle={{ maxWidth: '450px' }}>
                    <QuestionCircleOutlined style={{ fontSize: 18 }} />
                </Tooltip>
            </div>
        )
    }

    const onGoBack = () => navigation(pathnames.admin.roleAndPermission.main.path);

    const navigateToEditPage = () => {
        const value: any = form.getFieldsValue();
        navigation(pathnames.admin.roleAndPermission.edit.path + '/' + roleGroupId, {
            state: {
                menuId: value.menu,
                subMenuId: value.subMenu
            }
        });
    };

    const buttons: ButtonProps[] = [{ type: 'primary', children: 'Edit', onClick: navigateToEditPage }];

    const handleChangeMenu = (value: number) => {
        const subMenu = menuOptions.find((item: IFilterOption) => item.value === value)?.subMenus || [];
        setSubMenuOptions(formatTreeData(subMenu));
        form.resetFields(['subMenu']);
        setSubMenuSelected(null);
    };

    const handleChangeSubMenu = (value: number) => {
        const section = recursiveFind(subMenuOptions, value);
        const filterSection: any = section?.sections || [];

        setSubMenuSelected(section);
        setSectionOptions(filterSection);
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
            value: <Input placeholder="Enter role name" disabled />,
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

    const [columns] = useState<ColumnType<IRoleList>[]>([
        {
            key: 'section',
            title: 'Section',
            width: '13%',
            fixed: 'left',
            render: record => renderWithFallback(record.name)
        },
        {
            key: 'access',
            title: 'Access',
            width: '13%',
            render: record => (
                <BaseSelect value={record.isAccess ? 'Yes' : 'No'} disabled getPopupContainer={() => document.body} placeholder="Select menu" />
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
                        maxTagCount={1}
                        disabled
                        options={actionOptions}
                        getPopupContainer={() => document.body}
                        mode="multiple"
                        placeholder="Select menu"
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
                        maxTagCount={1}
                        disabled
                        getPopupContainer={() => document.body}
                        options={sensitiveFields}
                        mode="multiple"
                        placeholder="Select menu"
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
                        maxTagCount={1}
                        disabled
                        getPopupContainer={() => document.body}
                        mode="multiple"
                        options={restrictFields}
                        placeholder="Select menu"
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
                        maxTagCount={1}
                        getPopupContainer={() => document.body}
                        disabled
                        options={editedFields}
                        mode="multiple"
                        placeholder="Select menu"
                    />
                );
            }
        },
        {
            key: 'limitedData',
            title: 'Limited Data',
            width: '13%',
            render: record => (
                <BaseSelect value={record.isDataLimit ? 'Yes' : 'No'} disabled getPopupContainer={() => document.body} placeholder="Select menu" />
            )
        }
    ]);

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await roleAndPermissionService.getDetailUserRole(roleGroupId);
            const { data = [] as any } = res;

            const menuFormat = formatMenu(data.menus);
            const subMenu = menuFormat.find((item: IFilterOption) => item.value === menuFormat[0].value)?.subMenus || [];
            const subMenuSelected = recursiveFind(subMenu, subMenu[0].value);

            setMenuOptions(menuFormat);
            setSubMenuOptions(formatTreeData(subMenu));
            form.setFieldsValue({
                menu: menuFormat[0].value,
                subMenu: subMenu[0].value,
                roleName: data.roleName
            });
            setSubMenuSelected(subMenu[0]);
            setSectionOptions(subMenuSelected.sections);
            turnOffLoading();
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const rowClassName = () => {
        return 'table-role-and-permission';
    };

    return (
        <DetailContent>
            {isLoading && <Spin spinning={isLoading} size="large" className="overlay-loading" />}
            <Form form={form} name="positionForm" requiredMark={RequiredMark} layout="vertical" style={{ height: '100%' }}>
                <BaseBreadcrumb dataItem={breadcrumbItems} />
                <DetailHeader pageTitle={pageTitle()} buttons={Number(roleGroupId) !== 10 ? buttons : []} goBack={onGoBack} />

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
                                dataSource={formatDataTable(sectionOptions)}
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

export default DetailRolePage;
