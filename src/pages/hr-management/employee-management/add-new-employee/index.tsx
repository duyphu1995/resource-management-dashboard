import BaseBreadcrumb from '@/components/common/breadcrumb';
import DatePicker from '@/components/common/form/date-picker';
import FormItem from '@/components/common/form/form-item';
import InputCommon from '@/components/common/form/input';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import pathnames from '@/pathnames';
import positionService from '@/services/admin/position';
import { default as employeeApi, default as employeeService } from '@/services/hr-management/employee-management';
import { IAdminPosition } from '@/types/admin';
import { IDataBreadcrumb, IField } from '@/types/common';
import { IAddNewEmployeeForm, IEmployeeIndexes } from '@/types/hr-management/employee-management';
import {
    handleDisableFutureDate,
    handleValidateAge,
    handleValidateName,
    phoneValidatePattern,
    validate500Characters,
    validateWorkEmail
} from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { Button, Checkbox, Col, Form, Input, Layout, Row, Select, Space, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

type EmployeeManagementState = {
    positions: {
        data: IAdminPosition[];
        error: unknown;
    };
    grades: number[];
};

const initialState: EmployeeManagementState = {
    positions: {
        data: [],
        error: null
    },

    grades: []
};

const badgeValidatePattern = /^[A-Z]{0,3}[0-9]{4,8}$/;

const dataItemBreadcrumb: IDataBreadcrumb[] = [
    { title: pathnames.hrManagement.main.name },
    { title: pathnames.hrManagement.employeeManagement.main.name, path: pathnames.hrManagement.employeeManagement.main.path },
    { title: pathnames.hrManagement.employeeManagement.add.name }
];

const AddNewEmployee = () => {
    const { showNotification } = useNotify();
    const navigation = useNavigate();
    const [form] = Form.useForm();

    const [isOverlayLoading, setIsOverlayLoading] = useState(false);
    const [statePositions, setStatePositions] = useState<EmployeeManagementState>(initialState);
    const [initData, setInitData] = useState<IEmployeeIndexes>();
    const { positions, grades } = statePositions;

    const onFinish = async (values: IAddNewEmployeeForm) => {
        try {
            setIsOverlayLoading(true);
            const checkBadgeId = await employeeApi.checkBadgeId(values.badgeId);
            const checkWorkEmail = await employeeApi.checkWorkEmail(values.workEmail);

            let badgeIdError = '';
            let workEmailError = '';

            if (checkBadgeId.data) {
                badgeIdError = 'That badge ID is taken. Try another';
            }

            if (checkWorkEmail.data) {
                workEmailError = 'That work email is taken. Try another';
            }

            form.setFields([
                { name: 'badgeId', errors: badgeIdError ? [badgeIdError] : [] },
                { name: 'workEmail', errors: workEmailError ? [workEmailError] : [] }
            ]);

            if (!badgeIdError && !workEmailError) {
                const firstName = values.firstName.trim().replace(/\s+/g, ' ');
                const lastName = values.lastName.trim().replace(/\s+/g, ' ');

                const res = await employeeApi.addNewEmployee({
                    ...values,
                    firstName,
                    lastName,
                    birthday: dayjs(values.birthday).format(TIME_FORMAT.DATE),
                    joinDate: dayjs(values.joinDate).format(TIME_FORMAT.DATE)
                });
                const { succeeded, message } = res;

                succeeded && navigation(pathnames.hrManagement.employeeManagement.main.path);
                showNotification(succeeded, message);
            }
        } catch (error) {
            showNotification(false, 'Unable to add new employee. Please try again.');
        } finally {
            setIsOverlayLoading(false);
        }
    };

    // Handle change position => change grade list
    const handleChangeEmployeePosition = (value: number) => {
        setStatePositions({ ...statePositions, grades: [] });
        form.setFieldValue('grade', null);
        const position = statePositions.positions.data.find((item: IAdminPosition) => item.positionId === value);
        if (position) {
            const grades: number[] = [];
            for (let i = position.minGrade; i <= position.maxGrade; i++) {
                grades.push(i);
            }
            // Update the state with the new list of grades
            setStatePositions((prev: EmployeeManagementState) => ({
                ...prev,
                grades: grades
            }));
        }
    };

    const renderFormItemSection = (fieldList: IField[]) =>
        fieldList.map((item: IField, index: number) => {
            const { label, value, name, validation, valuePropName } = item;
            return (
                <Col span={6} key={`${name}-${index}`}>
                    <FormItem label={label} htmlFor="" name={name} rules={validation} valuePropName={valuePropName} validateTrigger={['onSubmit']}>
                        {value}
                    </FormItem>
                </Col>
            );
        });

    const handleBack = () => {
        navigation(pathnames.hrManagement.employeeManagement.main.path);
    };

    const fetchPositions = async () => {
        try {
            setStatePositions((prev: EmployeeManagementState) => ({
                ...prev,
                positions: {
                    ...prev.positions
                }
            }));
            const { data } = await positionService.getAll('EmployeeManagement');
            setStatePositions((prev: EmployeeManagementState) => ({
                ...prev,
                positions: {
                    ...prev.positions,
                    data: data ? data : []
                }
            }));
        } catch (error) {
            setStatePositions((prev: EmployeeManagementState) => ({
                ...prev,
                positions: {
                    ...prev.positions,
                    error
                }
            }));
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await employeeService.getAllIndexes();
            const newData = response.data;

            setInitData(newData);
        };

        fetchData();
        fetchPositions();
    }, []);

    const personalDetailFormItems: IField[] = [
        {
            name: 'lastName',
            label: 'Last Name',
            value: <InputCommon placeholder="Enter last name" typeInput="capitalize-lettersOnly" />,
            validation: [{ required: true, validator: (_: any, value: string) => handleValidateName(value) }]
        },
        {
            name: 'firstName',
            label: 'First Name',
            value: <InputCommon placeholder="Enter first name" typeInput="capitalize-lettersOnly" />,
            validation: [{ required: true, validator: (_: any, value: string) => handleValidateName(value) }]
        },
        {
            name: 'birthday',
            label: 'DOB',
            value: <DatePicker />,
            validation: [{ validator: (_: any, value: string) => handleValidateAge(value) }]
        },
        {
            name: 'genderId',
            label: 'Gender',
            value: (
                <BaseSelect placeholder="Select gender">
                    {initData?.genders.map(gender => (
                        <Option key={gender.genderId} value={gender.genderId} label={gender.genderName}>
                            {gender.genderName}
                        </Option>
                    ))}
                </BaseSelect>
            ),
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'maritalStatusId',
            label: 'Marital Status',
            value: (
                <BaseSelect placeholder="Choose marital status">
                    {initData?.maritalStatuses.map(status => (
                        <Option key={status.maritalStatusId} value={status.maritalStatusId} label={status.maritalStatusName}>
                            {status.maritalStatusName}
                        </Option>
                    ))}
                </BaseSelect>
            )
        },
        {
            name: 'nationalityId',
            label: 'Nationality',
            value: (
                <BaseSelect placeholder="Choose nationality">
                    {initData?.nationalities.map(nationality => (
                        <Option key={nationality.nationalityId} value={nationality.nationalityId} label={nationality.nationalityName}>
                            {nationality.nationalityName}
                        </Option>
                    ))}
                </BaseSelect>
            )
        },
        {
            name: 'contactAddress',
            label: 'Contact Address',
            value: <Input placeholder="Enter contact address" />,
            validation: [validate500Characters]
        },
        {
            name: 'mobilePhone',
            label: 'Mobile Phone',
            value: <InputCommon placeholder="Enter mobile phone" typeInput="phone-number" />,
            validation: [{ pattern: phoneValidatePattern, message: 'Please enter a valid phone number' }]
        }
    ];

    const workDetailFormItems: IField[] = [
        {
            name: 'badgeId',
            label: 'Badge ID',
            value: <InputCommon placeholder="Enter badge ID" typeInput="no-spaces" />,
            validation: [
                { required: true, message: 'Please enter valid value' },
                { pattern: badgeValidatePattern, message: 'A badge ID must contain number' },
                { max: 8, message: 'Please enter no more than 8 characters' }
            ]
        },
        {
            name: 'workEmail',
            label: 'Work Email',
            value: <InputCommon placeholder="Enter work email" typeInput="no-spaces" />,
            validation: [{ required: true, validator: (_: any, value: string) => validateWorkEmail(value) }]
        },
        {
            name: 'positionId',
            label: 'Position',
            value: (
                <BaseSelect placeholder="Select position" onChange={handleChangeEmployeePosition}>
                    {positions.data.map(position => (
                        <Option key={position.positionId} value={position.positionId} label={position.positionName}>
                            {position.positionName}
                        </Option>
                    ))}
                </BaseSelect>
            ),
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'grade',
            label: 'Grade',
            value: (
                <BaseSelect placeholder="Select grade">
                    {grades.map(index => (
                        <Option value={index} key={index}>
                            {index}
                        </Option>
                    ))}
                </BaseSelect>
            ),
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'joinDate',
            label: 'Joined Date',
            value: <DatePicker disabledDate={handleDisableFutureDate} allowClear />,
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            name: 'projectId',
            label: 'Main Project',
            value: (
                <BaseSelect placeholder="Enter main project">
                    {initData?.mainProjects.map(project => (
                        <Option key={project.projectId} value={project.projectId} label={project.projectName}>
                            {project.projectName}
                        </Option>
                    ))}
                </BaseSelect>
            ),
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            name: 'personalEmail',
            label: 'Personal Email',
            value: <Input type="email" placeholder="Enter personal email" />,
            validation: [{ type: 'email', message: 'Please enter valid value' }]
        },
        {
            name: 'homePhone',
            label: 'Home Phone',
            value: <InputCommon placeholder="Enter home phone" typeInput="phone-number" />,
            validation: [{ pattern: phoneValidatePattern, message: 'Please enter a valid phone number' }]
        },
        {
            label: ' ',
            value: (
                <Form.Item name="isDegree" valuePropName="checked">
                    <Checkbox defaultChecked={false}>Degree</Checkbox>
                </Form.Item>
            ),
            valuePropName: 'checked'
        }
    ];

    return (
        <Layout className="layout-add-new-employee">
            <Content className="content-container">
                <BaseBreadcrumb dataItem={dataItemBreadcrumb} />
                <Spin tip="Adding new employee..." spinning={isOverlayLoading}>
                    <Form form={form} name="add_new_employee" layout="vertical" onFinish={onFinish} requiredMark={RequiredMark}>
                        <div className="box-content-title">
                            <Title level={3}>
                                <img
                                    className="icon-leading-title"
                                    src="/media/icons/chevron-left.svg"
                                    alt="chevron-left-icon"
                                    onClick={handleBack}
                                />
                                {pathnames.hrManagement.employeeManagement.add.name}
                            </Title>
                            <Space size="middle">
                                <Button
                                    className="button-size-default button-default"
                                    onClick={() => {
                                        form.resetFields();
                                        handleBack();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button htmlType="submit" type="primary">
                                    Save
                                </Button>
                            </Space>
                        </div>
                        <div className="box-form-group form-personal-info">
                            <Row>
                                <Col span={24}>
                                    <Title level={4} className="box-form-title">
                                        Personal Details
                                    </Title>
                                </Col>
                            </Row>
                            <Row gutter={[24, 24]}>{renderFormItemSection(personalDetailFormItems)}</Row>
                        </div>
                        <div className="box-form-group form-work-detail">
                            <Row>
                                <Col span={24}>
                                    <Title level={4} className="box-form-title">
                                        Work Details
                                    </Title>
                                </Col>
                            </Row>
                            <Row gutter={[24, 24]}>{renderFormItemSection(workDetailFormItems)}</Row>
                        </div>
                    </Form>
                </Spin>
            </Content>
        </Layout>
    );
};

export default AddNewEmployee;
