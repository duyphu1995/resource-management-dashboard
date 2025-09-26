import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import BaseSelect from '@/components/common/form/select';
import pathnames from '@/pathnames';
import sharedServiceBillablePlanServices from '@/services/resource-plan/shared-service-billable-plan';
import { IField } from '@/types/common';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';
import {
    IAddNewSharedServiceBillablePlan,
    IAddNewSharedServiceSelect,
    IDCs
} from '@/types/resource-plan/shared-service-billable-plan/shared-service-billable-plan';
import { remapUnits } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { Button, Flex, Form, Input, InputNumber, Spin } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './index.scss';

const breadcrumb: BreadcrumbItemType[] = [
    { title: pathnames.resourcePlan.main.name },
    {
        title: pathnames.resourcePlan.sharedServiceBillablePlan.main.name,
        path: pathnames.resourcePlan.sharedServiceBillablePlan.main.path
    },
    { title: pathnames.resourcePlan.sharedServiceBillablePlan.add.name }
];

const AddSharedServiceBillablePlanPage = () => {
    const navigation = useNavigate();
    const { sharedServiceId } = useParams();
    const [formAddNewShared] = Form.useForm();
    const { showNotification } = useNotify();

    const [isOverlayLoading, setIsOverlayLoading] = useState(false);
    const [dcSelectData, setDcSelectData] = useState<IDCs[]>([]);
    const [projectSelectData, setProjectSelectData] = useState<IEmployeeUnit[]>();

    const goBack = () => navigation(pathnames.resourcePlan.sharedServiceBillablePlan.main.path);

    const weekData: any[] = [];

    const handleCancelAddNewSharedService = () => {
        formAddNewShared.resetFields();
        goBack();
    };

    for (let i = 1; i <= 52; i++) {
        weekData.push({
            weekNumber: `Week ${i.toString().padStart(2, '0')}`
        });
    }

    const mappingUnits: any = (units: any = []) => {
        return units.map((unit: any) => ({
            label: unit.unitName,
            value: unit.unitId,
            children: unit?.children ? remapUnits(unit?.children) : undefined
        }));
    };

    const handleChangeUnit = (value: string) => {
        fetchProjects(Number(value));
        formAddNewShared.setFieldsValue({ projectId: undefined });
    };

    const handleChangeProject = (value: string) => {
        const optionSelected = projectSelectData?.find((item: IEmployeeUnit) => Number(item.unitId) === Number(value));
        const parentItem = dcSelectData.find((dc: IDCs) => dc.unitId === Number(optionSelected?.parentId));
        if (parentItem) {
            formAddNewShared.setFieldsValue({ dcId: parentItem.unitId });
        }
    };

    const fetchProjects = useCallback(async (unitId?: number) => {
        try {
            const response = await sharedServiceBillablePlanServices.getAllProject(unitId || undefined);
            const { succeeded, data = [] } = response;

            if (succeeded) {
                setProjectSelectData(data);
            }
        } catch (error) {
            throw new Error('Error fetching projects data');
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await sharedServiceBillablePlanServices.getAllIndexes();
                const { succeeded, data: { dCs = [] } = {} } = response;

                if (succeeded) {
                    setDcSelectData(dCs);
                }
            } catch (error) {
                throw new Error('Error fetching data');
            }
        };

        fetchData();
        fetchProjects();
    }, [fetchProjects]);

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
            label: ORG_UNITS.DC,
            name: 'dcId',
            value: <BaseSelect options={mappingUnits(dcSelectData)} placeholder={`Select ${ORG_UNITS.DC}`} onChange={handleChangeUnit} />,
            validation: [{ required: true, message: 'Please select valid value' }],
            required: true
        },
        {
            label: ORG_UNITS.Project,
            name: 'projectId',
            value: <BaseSelect options={mappingUnits(projectSelectData)} placeholder="Select Project" onChange={handleChangeProject} />,
            validation: [{ required: true, message: 'Please select valid value' }],
            required: true
        },
        {
            label: 'Customer',
            name: 'customer',
            value: <Input placeholder="Enter customer" />
        },
        {
            label: 'Contract Type',
            name: 'contractType',
            value: <BaseSelect options={contractTypeOptions} placeholder="Select contract type" />,
            initValue: contractTypeOptions[0].value,
            validation: [{ required: true, message: 'Please select valid value' }],
            required: true
        },
        {
            label: 'Contracted Billable',
            name: 'contractedBillable',
            value: <InputNumber className="w-100" min={0} placeholder="Enter contracted billable" />
        }
    ];

    const formatData = (values: any): IAddNewSharedServiceBillablePlan => {
        const weekData: any = {};
        for (let i = 1; i <= 52; i++) {
            const weekKey = `Week ${i.toString().padStart(2, '0')}`;
            weekData[`week${i}`] = Number(values[weekKey]) || 0;
        }
        const { projectId, dcId, customer, contractType, contractedBillable } = values;
        const formatObject = {
            ...weekData,
            year: dayjs().year(),
            mainProjectId: Number(sharedServiceId),
            projectId: Number(projectId),
            dcId: Number(dcId),
            customer: customer,
            contractType: contractType,
            contractedBillable: Number(contractedBillable)
        };
        return formatObject;
    };

    const handleSubmitAddNewSharedService = async (values: any) => {
        const dataFormat = formatData(values);
        try {
            setIsOverlayLoading(true);
            const res = await sharedServiceBillablePlanServices.addNewSharedServiceBillablePlan(dataFormat);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Add shared service billable failed');
        } finally {
            setIsOverlayLoading(false);
        }
        formAddNewShared.resetFields();
    };

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumb} />
            <Spin tip="Adding new shared service billable plan ..." spinning={isOverlayLoading}>
                <Form form={formAddNewShared} onFinish={handleSubmitAddNewSharedService}>
                    <div className="add-shared-service-top">
                        <DetailHeader pageTitle={pathnames.resourcePlan.sharedServiceBillablePlan.add.name} goBack={goBack} />
                        <Flex gap={12}>
                            <Button type="default" onClick={handleCancelAddNewSharedService}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Save
                            </Button>
                        </Flex>
                    </div>
                    <div className="add-shared-service-container">
                        <DetailInfo title="">
                            <div className="shared-service-unit">
                                {fieldAddNewShared.map((item: IField, index: number) => {
                                    const { label, name, value, validation, required, initValue } = item;
                                    return (
                                        <div key={index}>
                                            <h3>
                                                {label} {required && <span className="required">*</span>}
                                            </h3>
                                            <Form.Item
                                                initialValue={initValue}
                                                key={name}
                                                name={name}
                                                rules={validation}
                                                className="location-contractor__form"
                                            >
                                                {value}
                                            </Form.Item>
                                        </div>
                                    );
                                })}
                            </div>
                        </DetailInfo>
                    </div>
                    <div className="add-shared-service-details">
                        <DetailInfo title="">
                            <div className="add-shared-service-data">
                                {weekData.map((week: any, index: number) => (
                                    <div className="add-shared-service-unit" key={index}>
                                        <>
                                            <h4>{week.weekNumber}</h4>
                                            <Form.Item
                                                name={[`${week.weekNumber}`]}
                                                rules={[{ pattern: new RegExp(/^[0-9]/), message: 'Value must be number' }]}
                                                validateFirst
                                            >
                                                <Input key={index} className="edit-unit-data" />
                                            </Form.Item>
                                        </>
                                    </div>
                                ))}
                            </div>
                        </DetailInfo>
                    </div>
                </Form>
            </Spin>
        </DetailContent>
    );
};

export default AddSharedServiceBillablePlanPage;
