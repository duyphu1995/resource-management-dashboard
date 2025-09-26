import { EmployeeSelect } from '@/components/common/employee-select';
import DatePicker from '@/components/common/form/date-picker';
import BaseSelect from '@/components/common/form/select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import { removeNullUndefinedEmpty } from '@/components/hr-management/onsite-management/onsite-common';
import TemporaryInfo from '@/components/hr-management/temporary-management/temporary-info';
import pathnames from '@/pathnames';
import temporaryLeaveService from '@/services/hr-management/temporary-management';
import { IDataBreadcrumb, IField } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import { IInfoSection } from '@/types/hr-management/onsite-management';
import { ITemporaryIndex } from '@/types/hr-management/temporary-leaves';
import { formatTime } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Form, Input, Select } from 'antd';
import { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const TemporaryLeavesAddPage = () => {
    const navigation = useNavigate();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();

    const [employeeInfo, setEmployeeInfo] = useState<IEmployee | null>();
    const [effort, setEffort] = useState<number>(0);
    const [initData, setInitData] = useState<ITemporaryIndex>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pageTitle = 'Add New Leave';

    const breadcrumbList: IDataBreadcrumb[] = [
        { title: pathnames.hrManagement.main.name },
        {
            title: pathnames.hrManagement.temporaryLeaves.main.name,
            path: pathnames.hrManagement.temporaryLeaves.main.path
        },
        { title: pageTitle }
    ];

    const goBack = () => {
        navigation(pathnames.hrManagement.temporaryLeaves.main.path);
    };

    const buttons: ButtonProps[] = [
        {
            onClick: goBack,
            children: 'Cancel'
        },
        {
            htmlType: 'submit',
            type: 'primary',
            children: 'Save',
            loading: isSubmitting
        }
    ];

    const handleChangeLeaveType = (data: any) => {
        const effort = initData?.statuses.find(item => item.statusId === data)?.totalEffort ?? 0;
        setEffort(effort);
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
            name: 'employeeId',
            label: 'Full Name',
            value: <EmployeeSelect width={'100%'} getAPI={temporaryLeaveService.getEmployeeInformation} onSelectedEmployee={setEmployeeInfo} />,
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            label: 'Badge ID',
            value: renderWithFallback(employeeInfo?.badgeId)
        },
        {
            name: 'leaveTypeId',
            label: 'Leaves Type',
            value: (
                <BaseSelect placeholder="Select career" onChange={handleChangeLeaveType}>
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
            value: renderWithFallback(employeeInfo?.projectName)
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
            value: renderWithFallback(effort + '%')
        },
        {
            name: 'notes',
            label: 'Note',
            value: <Input.TextArea placeholder="Enter note" className="text-area-item" />
        }
    ];

    const contractSelections: IInfoSection[] = [{ title: 'Employee Information', columns: employeeCols }];

    const formatTemporaryLeaveData = (data: any) => {
        const { startDate, endDate, actualEndDate } = data;

        return {
            ...data,
            startDate: startDate ? formatTime(startDate) : null,
            endDate: endDate ? formatTime(endDate) : null,
            actualEndDate: actualEndDate ? formatTime(actualEndDate) : null
        };
    };

    const onSubmit = async () => {
        setIsSubmitting(true);
        try {
            const dataFormat = removeNullUndefinedEmpty(formatTemporaryLeaveData(form.getFieldsValue()));
            const res = await temporaryLeaveService.addTemporaryLeave(dataFormat);
            const { succeeded, message } = res;

            if (succeeded) {
                navigation(pathnames.hrManagement.temporaryLeaves.main.path);
            }
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Adding new temporary leave failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const getAllIndexes = async () => {
            const res = await temporaryLeaveService.getAllIndexes();

            const newData = res.data;
            setInitData(newData);
        };

        getAllIndexes();
    }, []);

    return (
        <TemporaryInfo
            pageTitle={pageTitle}
            breadcrumbData={breadcrumbList}
            buttons={buttons}
            data={contractSelections}
            form={form}
            goBack={goBack}
            onSubmitForm={onSubmit}
        />
    );
};

export default TemporaryLeavesAddPage;
