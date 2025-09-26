import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { EmployeeSelect } from '@/components/common/employee-select';
import RequiredMark from '@/components/common/form/required-mark';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import managementListService from '@/services/hr-management/management-list';
import { IField } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import { ORG_UNITS } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Form, Switch } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface IManagementListSection {
    title: string;
    columns: IField[];
}

const breadcrumbData: BreadcrumbItemType[] = [
    { title: pathnames.hrManagement.main.name },
    {
        title: pathnames.hrManagement.managementList.main.name,
        path: pathnames.hrManagement.managementList.main.path
    },
    { title: pathnames.hrManagement.managementList.add.name }
];

const ManagementListAddPage = () => {
    const [form] = Form.useForm();
    const navigation = useNavigate();
    const { showNotification } = useNotify();

    const [employeeInfo, setEmployeeInfo] = useState<IEmployee | null>(null);

    const pageTitle = pathnames.hrManagement.managementList.add.name;

    const goBack = () => navigation(pathnames.hrManagement.managementList.main.path);

    const columns: IField[] = [
        {
            name: 'employeeId',
            label: 'Full Name',
            value: <EmployeeSelect width={'100%'} getAPI={managementListService.getEmployeeInformation} onSelectedEmployee={setEmployeeInfo} />,
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            label: 'Badge ID',
            value: renderWithFallback(employeeInfo?.badgeId)
        },
        {
            label: ORG_UNITS.Project,
            value: renderWithFallback(employeeInfo?.projectName)
        },
        {
            label: 'Working Status',
            value: renderWithFallback(employeeInfo?.statusName)
        },
        {
            label: 'Company',
            value: renderWithFallback(employeeInfo?.companyName)
        },
        {
            label: 'Position',
            value: renderWithFallback(employeeInfo?.positionName)
        },
        {
            name: 'isShow',
            label: 'Show On Employee List',
            valuePropName: 'checked',
            value: <Switch />
        }
    ];

    const onFinish = async (value: any) => {
        const res = await managementListService.addNewManagement(value);
        const { succeeded, message } = res;

        succeeded && navigation(pathnames.hrManagement.managementList.main.path);
        showNotification(succeeded, message);
    };

    const buttons: ButtonProps[] = [
        {
            onClick: goBack,
            children: 'Cancel'
        },
        {
            htmlType: 'submit',
            type: 'primary',
            children: 'Save'
        }
    ];

    return (
        <DetailContent>
            <Form name="managementListForm" form={form} layout="vertical" requiredMark={RequiredMark} onFinish={onFinish}>
                <BaseBreadcrumb dataItem={breadcrumbData} />
                <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={goBack} />

                <DetailInfo title="Personal Details">
                    <DetailFields data={columns} />
                </DetailInfo>
            </Form>
        </DetailContent>
    );
};

export default ManagementListAddPage;
