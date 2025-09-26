import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import BaseSelect from '@/components/common/form/select';
import pathnames from '@/pathnames';
import sharedServiceBillablePlanServices from '@/services/resource-plan/shared-service-billable-plan';
import { IField } from '@/types/common';
import {
    IAddNewSharedServiceSelect,
    ISharedServiceBillableUpdate
} from '@/types/resource-plan/shared-service-billable-plan/shared-service-billable-plan';
import useNotify from '@/utils/hook/useNotify';
import { Button, Flex, Form, Input, InputNumber } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.scss';

const breadcrumb: BreadcrumbItemType[] = [
    { title: pathnames.resourcePlan.main.name },
    {
        title: pathnames.resourcePlan.sharedServiceBillablePlan.main.name,
        path: pathnames.resourcePlan.sharedServiceBillablePlan.main.path
    },
    { title: pathnames.resourcePlan.sharedServiceBillablePlan.detail.name }
];

const SharedServiceBillableDetailsPage = () => {
    const navigation = useNavigate();
    const location = useLocation();
    const [formTable] = Form.useForm();
    const { showNotification } = useNotify();

    const [dataTable, setDataTable] = useState<ISharedServiceBillableUpdate | any>(location.state);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const goBack = () => navigation(pathnames.resourcePlan.sharedServiceBillablePlan.main.path);
    const weekData: any[] = [];
    const currentWeek = dayjs().week();

    for (let i = 1; i <= 52; i++) {
        weekData.push({
            weekNumber: `Week ${i}`,
            weekValue: dataTable[`week${i}`]
        });
    }

    const contractTypeOptions: IAddNewSharedServiceSelect[] = [
        {
            label: 'Project Based',
            value: 'Project Based'
        },
        {
            label: 'ODC',
            value: 'ODC'
        }
    ];

    const fieldAddNewShared: IField[] = [
        {
            label: 'Customer',
            name: 'customer',
            value: <Input placeholder="Enter customer" />,
            dataValue: dataTable.customer
        },
        {
            label: 'Contract Type',
            name: 'contractType',
            value: <BaseSelect options={contractTypeOptions} placeholder="Select contract type" />,
            dataValue: dataTable.contractType,
            validation: [{ required: true, message: 'Please select valid value' }],
            required: true
        },
        {
            label: 'Contracted Billable',
            name: 'contractedBillable',
            dataValue: dataTable.contractedBillable,
            value: <InputNumber className="w-100" min={0} placeholder="Enter contracted billable" />
        }
    ];

    const getSharedServiceBillableDetails = async () => {
        try {
            const res = await sharedServiceBillablePlanServices.getSharedServiceBillableDetails(dataTable.reportId);
            const { data = null, succeeded = false } = res;

            if (succeeded && data) {
                setDataTable(data);
            }
        } catch (error) {
            showNotification(false, 'Get shared service billable failed');
        }
    };

    const formatData = (values: any): ISharedServiceBillableUpdate => {
        const formatObject: any = {};

        for (let i = 1; i <= 52; i++) {
            formatObject[`week${i}`] = values[`Week ${i}`] ? parseFloat(values[`Week ${i}`]) : 0;
        }

        const { customer, contractType, contractedBillable } = values;

        formatObject.customer = customer;
        formatObject.contractType = contractType;
        formatObject.contractedBillable = contractedBillable;
        return formatObject;
    };

    const handleSubmitSaveAllTable = async (values: any) => {
        const dataFormat = formatData(values);
        const reportId = dataTable.reportId;
        try {
            const res = await sharedServiceBillablePlanServices.updateSharedServiceBillableDetails(reportId, dataFormat);
            const { succeeded, message } = res;

            if (succeeded) {
                setIsEditing(false);
                getSharedServiceBillableDetails();
            }
            showNotification(succeeded, message);
        } catch (error: any) {
            showNotification(false, 'Update shared service billable failed');
        }
    };

    const handleShowEditTableAll = () => {
        setIsEditing(true);
        formTable.resetFields();
    };

    const handleCancelEditTableAll = () => {
        setIsEditing(false);
        formTable.resetFields();
    };

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumb} />
            <Form form={formTable} onFinish={handleSubmitSaveAllTable}>
                <div className="shared-service-billable-top">
                    <DetailHeader pageTitle={pathnames.resourcePlan.sharedServiceBillablePlan.detail.name} goBack={goBack} />
                    {isEditing ? (
                        <Flex gap={12}>
                            <Button type="default" onClick={handleCancelEditTableAll}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Save
                            </Button>
                        </Flex>
                    ) : (
                        <Button type="primary" onClick={handleShowEditTableAll}>
                            Edit
                        </Button>
                    )}
                </div>
                <div className="shared-service-container">
                    <DetailInfo title="">
                        <div className="shared-service-unit">
                            <div className="unit-field">
                                <h2>DC</h2>
                                <p>{dataTable.dcName || '--'}</p>
                            </div>
                            <div className="unit-field">
                                <h2>Project</h2>
                                <p>{dataTable.projectName || '--'}</p>
                            </div>
                            {isEditing ? (
                                fieldAddNewShared.map((item: IField, index: number) => {
                                    const { label, name, value, validation, dataValue, required } = item;
                                    return (
                                        <div key={index}>
                                            <h3>
                                                {label} {required && <span className="required">*</span>}
                                            </h3>
                                            <Form.Item
                                                initialValue={dataValue}
                                                style={{ width: 200 }}
                                                key={name}
                                                name={name}
                                                rules={validation}
                                                className="location-contractor__form"
                                            >
                                                {value}
                                            </Form.Item>
                                        </div>
                                    );
                                })
                            ) : (
                                <>
                                    <div className="unit-field">
                                        <h2>Customer</h2>
                                        <p>{dataTable.customer || '--'}</p>
                                    </div>
                                    <div className="unit-field">
                                        <h2>Contract Type</h2>
                                        <p>{dataTable.contractType || '--'}</p>
                                    </div>
                                    <div className="unit-field">
                                        <h2>Contracted Billable</h2>
                                        <p>{dataTable.contractedBillable || '--'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </DetailInfo>
                </div>
                <div className="shared-service-details">
                    <DetailInfo title="">
                        <div className="shared-service-data">
                            {weekData.map((week: any, index: number) => (
                                <div key={index} className="shared-service-unit">
                                    <>
                                        <h4
                                            className={
                                                parseInt(week.weekNumber.slice(week.weekNumber.indexOf(' '))) === currentWeek ? 'active-week' : ''
                                            }
                                        >
                                            {week.weekNumber}
                                        </h4>
                                        {isEditing ? (
                                            <Form.Item
                                                name={[`${week.weekNumber}`]}
                                                initialValue={week.weekValue}
                                                rules={[{ required: false, pattern: new RegExp(/^[0-9]/), message: 'Value must be number' }]}
                                                validateFirst
                                            >
                                                <Input className="edit-unit-data" />
                                            </Form.Item>
                                        ) : (
                                            <p>{week.weekValue || '-'}</p>
                                        )}
                                    </>
                                </div>
                            ))}
                        </div>
                    </DetailInfo>
                </div>
            </Form>
        </DetailContent>
    );
};

export default SharedServiceBillableDetailsPage;
