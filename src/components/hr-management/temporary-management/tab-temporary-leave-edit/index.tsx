import DatePicker from '@/components/common/form/date-picker';
import BaseSelect from '@/components/common/form/select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TemporaryInfo from '@/components/hr-management/temporary-management/temporary-info';
import pathnames from '@/pathnames';
import temporaryLeaveService from '@/services/hr-management/temporary-management';
import { IField, ITableHaveActionAddProps } from '@/types/common';
import { IInfoSection } from '@/types/hr-management/onsite-management';
import { ITemporaryDetail, ITemporaryIndex } from '@/types/hr-management/temporary-leaves';
import { formatTime } from '@/utils/common';
import { ORG_UNITS, TIME_FORMAT } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Form, Input, Select, Spin } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { removeNullUndefinedEmpty } from '../../onsite-management/onsite-common';

const { Option } = Select;

const TabTemporaryLeaveEdit = (props: ITableHaveActionAddProps<any>) => {
    const { isReload } = props;

    const navigation = useNavigate();
    const [form] = Form.useForm();
    const { id = '' } = useParams();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataTemporaryDetail, setDataTemporaryDetail] = useState<ITemporaryDetail>();
    const [initData, setInitData] = useState<ITemporaryIndex>();

    const goBack = () => {
        navigation(pathnames.hrManagement.temporaryLeaves.detail.path + '/' + id);
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

    const handleChangeLeaveType = (data: any) => {
        const effort = initData?.statuses.find(item => item.statusId === data)?.totalEffort ?? 0;
        if (dataTemporaryDetail) {
            setDataTemporaryDetail({ ...dataTemporaryDetail, effort });
        }
    };

    const handleDisableStartDate = (currentDate: Dayjs | null) => {
        if (!currentDate) return false;

        const { endDate, actualEndDate } = form.getFieldsValue();
        const isAfterEndDate = endDate && currentDate.isAfter(endDate.subtract(1, 'day'));
        const isAfterActualEndDate = actualEndDate && currentDate.isAfter(actualEndDate.subtract(1, 'day'));

        return isAfterEndDate || isAfterActualEndDate;
    };

    const handleDisableBeforeStartDate = (currentDate: Dayjs | null) => {
        if (!currentDate) return false;

        const { startDate } = form.getFieldsValue();
        return startDate && currentDate.isBefore(startDate.add(1, 'day'));
    };

    const employeeCols: IField[] = [
        {
            label: 'Full Name',
            value: renderWithFallback(dataTemporaryDetail?.fullName)
        },
        {
            label: 'Badge ID',
            value: renderWithFallback(dataTemporaryDetail?.badgeId)
        },
        {
            name: 'leaveTypeId',
            label: 'Leaves Type',
            value: (
                <BaseSelect placeholder="Select leaves type" onChange={handleChangeLeaveType} loading>
                    {initData?.statuses.map(item => (
                        <Option key={item.statusId} value={item.statusId} label={item.statusName}>
                            {item.statusName}
                        </Option>
                    ))}
                </BaseSelect>
            ),
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: ORG_UNITS.Project,
            value: renderWithFallback(dataTemporaryDetail?.projectName)
        },
        {
            name: 'startDate',
            label: 'Start Date',
            value: <DatePicker allowClear disabledDate={handleDisableStartDate} />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'endDate',
            label: 'Expected End Date',
            value: <DatePicker allowClear disabledDate={handleDisableBeforeStartDate} />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'actualEndDate',
            label: 'Actual End Date',
            value: <DatePicker allowClear disabledDate={handleDisableBeforeStartDate} />
        },
        {
            label: 'Effort',
            value: renderWithFallback(dataTemporaryDetail?.effort + '%')
        },
        {
            name: 'notes',
            label: 'Note',
            value: <Input.TextArea placeholder="Enter comment" className="text-area-item" />
        }
    ];

    const contractSelections: IInfoSection[] = [{ title: 'Employee Information', columns: employeeCols }];

    const formatTemporaryLeaveData = (data: any) => {
        const { startDate, endDate, actualEndDate } = data;

        return {
            ...data,
            temporaryLeaveId: Number(id),
            startDate: startDate ? formatTime(startDate) : null,
            endDate: endDate ? formatTime(endDate) : null,
            actualEndDate: actualEndDate ? formatTime(actualEndDate) : null
        };
    };

    const onSubmit = async () => {
        const dataFormat = removeNullUndefinedEmpty(formatTemporaryLeaveData(form.getFieldsValue()));
        try {
            turnOnLoading();
            const res = await temporaryLeaveService.updateTemporaryLeave(Number(id), dataFormat);
            const { succeeded, message } = res;
            succeeded && goBack();
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Failed to update');
        } finally {
            turnOffLoading();
        }
    };

    useEffect(() => {
        const getAllIndexes = async () => {
            try {
                turnOnLoading();
                const res = await temporaryLeaveService.getAllIndexes();

                const newData = res.data;
                setInitData(newData);
            } catch (error) {
                showNotification(false, 'Failed to get api temporaryLeaveService.getAllIndexes');
            } finally {
                turnOffLoading();
            }
        };

        getAllIndexes();
    }, [showNotification, turnOnLoading, turnOffLoading]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                turnOnLoading();
                const response = await temporaryLeaveService.getTemporaryDetail(Number(id));
                const { data, succeeded } = response;
                if (succeeded && data) {
                    setDataTemporaryDetail(response.data);

                    const { leaveTypeId, startDate, endDate, actualEndDate, notes } = data;

                    form.setFieldsValue({
                        leaveTypeId,
                        startDate: startDate ? dayjs(startDate, TIME_FORMAT.VN_DATE) : undefined,
                        endDate: endDate ? dayjs(endDate, TIME_FORMAT.VN_DATE) : undefined,
                        actualEndDate: actualEndDate ? dayjs(actualEndDate, TIME_FORMAT.VN_DATE) : undefined,
                        notes
                    });
                }
            } catch (error) {
                showNotification(false, 'Failed to get api temporaryLeaveService.getTemporaryDetail');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [id, isReload, form, showNotification, turnOnLoading, turnOffLoading]);

    return (
        <Spin spinning={isLoading}>
            <TemporaryInfo
                pageTitle="Temporary Leaves Edit"
                buttons={buttons}
                data={contractSelections}
                form={form}
                goBack={goBack}
                onSubmitForm={onSubmit}
            />
        </Spin>
    );
};

export default TabTemporaryLeaveEdit;
