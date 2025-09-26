import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import roleAndPermissionService from '@/services/admin/role-and-permission';
import { IRoleList, IUserPermissionDetail } from '@/types/admin';
import { IPermission } from '@/types/auth';
import { IField } from '@/types/common';
import { formatDataTable, formatTreeData, recursiveFind } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import { ButtonProps, Empty, Flex, Form, Spin, Tooltip } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../index.scss';
import { titleTooltipRoleAndPermissionAdditional } from '@/utils/constants';
import { QuestionCircleOutlined } from '@ant-design/icons';

const breadcrumbItems = [
    { title: pathnames.admin.main.name },
    {
        title: pathnames.admin.roleAndPermission.main.name,
        path: pathnames.admin.roleAndPermission.main.path
    },
    { title: pathnames.admin.roleAndPermission.detailUserPermission.name }
];

interface IFilterOption {
    id?: number;
    label: string;
    value: number;
    sections?: any;
    subMenus?: IFilterOption[];
}

const UerPermissionDetail = () => {
    const navigation = useNavigate();
    const [form] = Form.useForm();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [menuOptions, setMenuOptions] = useState<IFilterOption[]>([]);
    const [subMenuOptions, setSubMenuOptions] = useState<IFilterOption[]>([]);
    const [sectionOptions, setSectionOptions] = useState<IFilterOption[]>([]);
    const [subMenuSelected, setSubMenuSelected] = useState<IFilterOption | null>();

    const [menuOptionsAdditional, setMenuOptionsAdditional] = useState<IFilterOption[]>([]);
    const [subMenuOptionsAdditional, setSubMenuOptionsAdditional] = useState<IFilterOption[]>([]);
    const [sectionOptionsAdditional, setSectionOptionsAdditional] = useState<IFilterOption[]>([]);
    const [subMenuSelectedAdditional, setSubMenuSelectedAdditional] = useState<IFilterOption | null>();

    const [userPermissionDetail, setUserPermissionDetail] = useState<IUserPermissionDetail>();

    const { employeeId = '' } = useParams();

    const formatMenu = (permissions: IPermission[]): IFilterOption[] => {
        return permissions.map((item: IPermission) => ({
            ...item,
            label: item.name,
            value: item.id,
            subMenus: item.subMenus ? formatMenu(item.subMenus) : undefined
        }));
    };

    const handleChangeMenu = (value: number) => {
        const subMenu = menuOptions.find((item: IFilterOption) => item.value === value)?.subMenus || [];
        setSubMenuOptions(formatTreeData(subMenu));
        form.resetFields(['subMenu']);
        setSubMenuSelected(null);
    };

    const handleChangeSubMenu = (value: number) => {
        const subMenuSelected = recursiveFind(subMenuOptions, value);
        const filterSection: any = subMenuSelected?.sections || [];
        setSectionOptions(filterSection);
        setSubMenuSelected(subMenuSelected);
    };

    const handleChangeMenuAdditional = (value: number) => {
        const subMenu = menuOptionsAdditional.find((item: IFilterOption) => item.value === value)?.subMenus || [];
        setSubMenuOptionsAdditional(formatTreeData(subMenu));
        form.resetFields(['subMenuAdditional']);
        setSubMenuSelectedAdditional(null);
    };

    const handleChangeSubMenuAdditional = (value: number) => {
        const subMenuSelected = recursiveFind(subMenuOptionsAdditional, value);
        const filterSection = subMenuSelected?.sections || [];
        const filterSectionNotDisable = filterSection.filter((item: any) => !item.isUIDisabled);

        setSectionOptionsAdditional(filterSectionNotDisable);
        setSubMenuSelectedAdditional(subMenuSelected);
    };

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();

            const res = await roleAndPermissionService.getUserPermissionDetail(employeeId);
            const { data = [] as any } = res;

            setUserPermissionDetail(data);

            const menuFormat = formatMenu(data.userPermissionData.menus);
            const subMenu = menuFormat.find((item: IFilterOption) => item.value === menuFormat[0].value)?.subMenus || [];
            const subMenuSelected = recursiveFind(subMenu, subMenu[0].value);

            setMenuOptions(menuFormat);
            setSubMenuOptions(formatTreeData(subMenu));
            setSubMenuSelected(subMenu[0]);
            setSectionOptions(subMenuSelected.sections);
            form.setFieldsValue({
                role: data.userPermissionData.roleName,
                menu: menuFormat[0].value,
                subMenu: subMenu[0].value
            });

            const menuFormatAdditional = formatMenu(data.additionalPermissionData);
            // const subMenuAdditional = menuFormatAdditional.find((item: IFilterOption) => item.value === menuFormatAdditional[0].value)?.subMenus || [];
            // const subMenuAdditionalSelected = recursiveFind(subMenuAdditional, subMenuAdditional[0].value);
            // const filterSectionNotDisable = subMenuAdditionalSelected.sections.filter((item: any)=> !item.isUIDisabled)

            setMenuOptionsAdditional(menuFormatAdditional);
            // setSubMenuOptionsAdditional(formatTreeData(subMenuAdditional));
            // setSubMenuSelectedAdditional(subMenuAdditionalSelected);
            // setSectionOptionsAdditional(filterSectionNotDisable);
            // form.setFieldsValue({
            //     menuAdditional: menuFormatAdditional[0].value,
            //     subMenuAdditional: subMenuAdditional[0].value
            // });

            turnOffLoading();
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pageTitle = pathnames.admin.roleAndPermission.detailUserPermission.name;

    const onGoBack = () => navigation(pathnames.admin.roleAndPermission.main.path);
    const navigateToEditPage = () => {
        const value: any = form.getFieldsValue();
        navigation(pathnames.admin.roleAndPermission.editUserPermission.path + '/' + employeeId, {
            state: {
                menuId: value.menu,
                subMenuId: value.subMenu,
                menuAdditionalId: value.menuAdditional,
                subMenuAdditionalId: value.subMenuAdditional
            }
        });
    };
    const buttons: ButtonProps[] = [{ type: 'primary', children: 'Edit', onClick: navigateToEditPage }];

    const fields: IField[] = [
        {
            label: 'Full Name',
            name: 'fullName',
            value: userPermissionDetail?.employeeInfo?.fullName
        },
        {
            label: 'Badge ID',
            name: 'badgeID',
            value: userPermissionDetail?.employeeInfo?.badgeId
        },
        {
            label: 'Work Email',
            name: 'workEmail',
            value: userPermissionDetail?.employeeInfo?.workEmail
        }
    ];

    const fields2: IField[] = [
        {
            label: 'Project',
            name: 'project',
            value: userPermissionDetail?.employeeInfo?.projectName
        },
        {
            label: 'Position',
            name: 'position',
            value: userPermissionDetail?.employeeInfo?.positionName
        },
        {
            label: 'Company',
            name: 'company',
            value: userPermissionDetail?.employeeInfo?.companyName
        }
    ];

    const [columns] = useState<ColumnType<IRoleList>[]>([
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
            render: (record: any) => (
                <BaseSelect value={record.isAccess ? 'Yes' : 'No'} disabled getPopupContainer={() => document.body} placeholder="Select menu" />
            )
        },
        {
            key: 'action',
            title: 'Action',
            width: '13%',
            render: (record: any) => (
                <BaseSelect
                    key="action"
                    value={record.userRoleOperations}
                    maxTagCount={1}
                    disabled
                    getPopupContainer={() => document.body}
                    mode="multiple"
                    placeholder="Select menu"
                />
            )
        },
        {
            key: 'sensitiveField',
            title: 'Sensitive Field',
            width: '13%',
            render: (record: any) => (
                <BaseSelect
                    key="sensitiveField"
                    value={record.fieldsForSensitiveData}
                    maxTagCount={1}
                    disabled
                    getPopupContainer={() => document.body}
                    mode="multiple"
                    placeholder="Select menu"
                />
            )
        },
        {
            key: 'restrictField',
            title: 'Restrict Field',
            width: '13%',
            render: (record: any) => (
                <BaseSelect
                    key="restrictField"
                    value={record.fieldsForRestrictData}
                    maxTagCount={1}
                    disabled
                    getPopupContainer={() => document.body}
                    mode="multiple"
                    placeholder="Select menu"
                />
            )
        },
        {
            key: 'editedField',
            title: 'Edited Field',
            width: '13%',
            render: (record: any) => (
                <BaseSelect
                    key="editedField"
                    value={record.fieldsForEditData}
                    maxTagCount={1}
                    getPopupContainer={() => document.body}
                    disabled
                    mode="multiple"
                    placeholder="Select menu"
                />
            )
        },
        {
            key: 'limitedData',
            title: 'Limited Data',
            width: '13%',
            render: (record: any) => (
                <BaseSelect value={record.isDataLimit ? 'Yes' : 'No'} disabled getPopupContainer={() => document.body} placeholder="Select menu" />
            )
        }
    ]);

    const fields3: IField[] = [
        {
            label: 'Role',
            name: 'role',
            value: <BaseSelect placeholder="Select role " disabled />,
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

    const rowClassName = () => {
        return 'table-role-and-permission';
    };

    const pageTitleTooltip = () => {
        return (
            <div>
                <span style={{ marginRight: 5 }}> {"Additional Permission"}</span>
                <Tooltip title={titleTooltipRoleAndPermissionAdditional}  overlayStyle={{ maxWidth: '450px' }}>
                  <QuestionCircleOutlined style={{fontSize: 18}}/>
                </Tooltip>
            </div>
        )
    }

    return (
        <DetailContent>
            {isLoading && <Spin spinning={isLoading} size="large" className="overlay-loading" />}
            <Form form={form} name="positionForm" requiredMark={RequiredMark} layout="vertical" style={{ height: '100%' }}>
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
                                    columns={columns}
                                    dataSource={formatDataTable(sectionOptionsAdditional)}
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
            </Form>
        </DetailContent>
    );
};

export default UerPermissionDetail;
