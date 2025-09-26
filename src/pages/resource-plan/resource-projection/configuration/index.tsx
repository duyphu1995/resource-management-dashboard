import pathnames from '@/pathnames';
import { IField } from '@/types/common';
import {
    IConfigurationData,
    IFormatTableData,
    IOptionsResourceProjection,
    IResourceProjectionConfig
} from '@/types/resource-plan/resource-projection/resource-projection';
import { ButtonProps, Form, InputNumber, Select, Spin, TimePicker } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import './index.scss';
import DetailContent from '@/components/common/detail-management/detail-content';
import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailHeader from '@/components/common/detail-management/detail-header';
import ResourceProjectionConfigurationTable from './table';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DetailFields from '@/components/common/detail-management/detail-fields';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { formatDataTableFromOne } from '@/utils/common';
import resourceProjectionServices from '@/services/resource-plan/resource-projection';

const breadcrumb: BreadcrumbItemType[] = [
    { title: pathnames.resourcePlan.main.name },
    { title: pathnames.resourcePlan.resourceProjection.main.name, path: pathnames.resourcePlan.resourceProjection.main.path },
    { title: pathnames.resourcePlan.resourceProjection.configuration.name }
];

const yearOptions: IOptionsResourceProjection[] = [
    {
        label: dayjs().year().toString(),
        value: dayjs().year().toString()
    },
    {
        label: (dayjs().year() + 1).toString(),
        value: (dayjs().year() + 1).toString()
    }
];

const dayOfWeekOptions: IOptionsResourceProjection[] = [
    {
        label: 'Monday',
        value: '2'
    },
    {
        label: 'Tuesday',
        value: '3'
    },
    {
        label: 'Wednesday',
        value: '4'
    },
    {
        label: 'Thursday',
        value: '5'
    },
    {
        label: 'Friday',
        value: '6'
    },
    {
        label: 'Saturday',
        value: '7'
    },
    {
        label: 'Sunday',
        value: '1'
    }
];

const ConfigurationPage = () => {
    const [form] = Form.useForm();

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [yearSelect, setYearSelect] = useState<string>(String(dayjs().year()));
    const [configurationData, setConfigurationData] = useState<IConfigurationData>();

    const fieldsBasicTimeLineConfig: IField[] = [
        {
            label: 'Day of week',
            name: isEditing ? 'dayOnWeek' : undefined,
            initValue: isEditing ? String(configurationData?.configBaselineValueDto.dayOnWeek) : undefined,
            value: isEditing ? (
                <Select options={dayOfWeekOptions} style={{ width: 150 }} />
            ) : (
                dayOfWeekOptions.find(item => item.value === String(configurationData?.configBaselineValueDto.dayOnWeek))?.label
            )
        },
        {
            label: 'Time',
            name: isEditing ? 'time' : undefined,
            initValue: dayjs(
                `${configurationData?.configBaselineValueDto.hour}:${configurationData?.configBaselineValueDto.minute} ${configurationData?.configBaselineValueDto.timeType}`,
                'h:mm A'
            ),
            value: isEditing ? (
                <TimePicker use12Hours format="h:mm A" />
            ) : (
                `${configurationData?.configBaselineValueDto.hour.toString().padStart(2, '0')}:${configurationData?.configBaselineValueDto.minute.toString().padStart(2, '0')} ${configurationData?.configBaselineValueDto.timeType}`
            )
        }
    ];

    const fieldsTargetNbrAndBillableConfig: IField[] = [
        {
            label: 'Year',
            value: (
                <Select defaultValue={yearOptions[0].value} style={{ width: 150 }} onChange={value => setYearSelect(value)} options={yearOptions} />
            )
        },
        {
            label: 'Display Month(s)',
            name: isEditing ? 'displayMonths' : undefined,
            initValue: isEditing ? configurationData?.configBaselineValueDto.displayMonth : undefined,
            value: isEditing ? <InputNumber min={1} max={12} /> : configurationData?.configBaselineValueDto.displayMonth
        }
    ];

    const configurationSections = [
        { title: 'Basic Timeline Configuration', content: <DetailFields data={fieldsBasicTimeLineConfig} /> },
        {
            title: 'Target %NBR And #Billable In Year',
            content: (
                <>
                    <DetailFields data={fieldsTargetNbrAndBillableConfig} />
                    <ResourceProjectionConfigurationTable
                        form={form}
                        isEditing={isEditing}
                        dataTable={formatDataTableFromOne(configurationData?.projectionPlanDtos)}
                    />
                </>
            )
        }
    ];

    const buttons: ButtonProps[] = [
        {
            type: 'primary',
            onClick: () => setIsEditing(true),
            children: 'Edit',
            hidden: isEditing
        },
        {
            onClick: () => setIsEditing(false),
            children: 'Cancel',
            hidden: !isEditing
        },
        {
            type: 'primary',
            children: 'Save',
            htmlType: 'submit',
            hidden: !isEditing
        }
    ];

    const formatData = (values: IFormatTableData): IResourceProjectionConfig[] => {
        const formattedData: IResourceProjectionConfig[] = [];
        Object.keys(values.targetNonBillableRatio).forEach(unitId => {
            const item = configurationData?.projectionPlanDtos.find(d => d.unitId.toString() === unitId);
            if (item) {
                formattedData.push({
                    unitId: parseInt(unitId),
                    targetNonBillableRatio: values.targetNonBillableRatio[unitId],
                    targetBillableQuarter1: values.targetBillableQuarter1[unitId],
                    targetBillableQuarter2: values.targetBillableQuarter2[unitId],
                    targetBillableQuarter3: values.targetBillableQuarter3[unitId],
                    targetBillableQuarter4: values.targetBillableQuarter4[unitId],
                    year: Number(yearSelect),
                    isDG: item.isDG,
                    isTMA: item.isTMA
                });
            }
        });
        return formattedData;
    };

    const handleSubmit = async (values: any) => {
        turnOnLoading();
        try {
            const formatValues = {
                configBaselineValueDto: {
                    dayOnWeek: Number(values.dayOnWeek),
                    hour: values.time.hour() % 12,
                    minute: values.time.minute(),
                    timeType: values.time.format('A'),
                    displayMonth: values.displayMonths
                },
                projectionPlanUpdateDtos: formatData(values)
            };

            const response = await resourceProjectionServices.updateResourceProjectionConfig(formatValues);
            const { succeeded, message } = response;

            if (succeeded) {
                fetchData();
                setIsEditing(false);
            }
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Save configuration of resource projection failed');
        } finally {
            turnOffLoading();
        }
    };

    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const fetchData = useCallback(async () => {
        turnOnLoading();
        try {
            const response = await resourceProjectionServices.getConfigurationData(yearSelect);
            const { data, succeeded } = response;

            if (succeeded) {
                setConfigurationData(data);
                form.setFieldsValue({
                    dayOnWeek: String(data?.configBaselineValueDto.dayOnWeek),
                    time: dayjs(
                        `${data?.configBaselineValueDto.hour}:${data?.configBaselineValueDto.minute} ${data?.configBaselineValueDto.timeType}`,
                        'h:mm A'
                    ),
                    displayMonths: data?.configBaselineValueDto.displayMonth
                });
            }
        } catch (error) {
            showNotification(false, 'Fetch configuration of resource projection failed');
        } finally {
            turnOffLoading();
        }
    }, [turnOnLoading, turnOffLoading, showNotification, yearSelect, form]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <Spin spinning={isLoading}>
            <DetailContent>
                <BaseBreadcrumb dataItem={breadcrumb} />
                <Form form={form} className="configuration-box-container" onFinish={handleSubmit}>
                    <DetailHeader pageTitle={pathnames.resourcePlan.resourceProjection.configuration.name} buttons={buttons} />
                    {configurationSections.map((item, index) => {
                        const { title, content } = item;
                        return (
                            <DetailInfo title={title} key={index}>
                                {content}
                            </DetailInfo>
                        );
                    })}
                </Form>
            </DetailContent>
        </Spin>
    );
};

export default ConfigurationPage;
