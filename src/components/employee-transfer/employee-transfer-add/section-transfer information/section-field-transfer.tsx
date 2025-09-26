import DetailFields from '@/components/common/detail-management/detail-fields';
import { EmployeeSelect } from '@/components/common/employee-select';
import DatePicker from '@/components/common/form/date-picker';
import BaseSelect from '@/components/common/form/select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import employeeService from '@/services/hr-management/employee-management';
import employeeTransferService from '@/services/transfer-employee';
import { IField } from '@/types/common';
import { IEmployeeInfo } from '@/types/transfer-employee';
import usePermissions from '@/utils/hook/usePermissions';
import { Input } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

interface ISectionFieldTransferProps {
    employeeInfo: IEmployeeInfo | null;
    setEmployeeInfo: (employeeInfo: IEmployeeInfo | null) => void;
}

const SectionFieldTransfer = (props: ISectionFieldTransferProps) => {
    const { employeeInfo, setEmployeeInfo } = props;

    const { fieldsForRestrictData } = usePermissions('AddNewTransfer', 'EmployeeTransfer');

    const [listAllIndex, setListAllIndex] = useState<any>({});
    const [projectOptions, setProjectOptions] = useState<DefaultOptionType[]>([]);

    const handleChangeEmployee = async (employee: IEmployeeInfo | null) => {
        if (employee) {
            setEmployeeInfo(employee);
        } else {
            setEmployeeInfo(null);
        }
    };

    const searchParams = new URLSearchParams(location.search);
    const fullName = searchParams.get('fullName');

    const newTransferCols: IField[] = [
        {
            name: 'employeeId',
            label: 'Full Name',
            value: fullName ? (
                renderWithFallback(fullName)
            ) : (
                <EmployeeSelect width={'100%'} getAPI={employeeTransferService.getEmployeeInformation} onSelectedEmployee={handleChangeEmployee} />
            ),
            validation: [{ required: !fullName, message: 'Please enter valid value' }]
        },
        {
            label: 'Email',
            value: renderWithFallback(employeeInfo?.workEmail)
        },
        {
            label: 'Current Project',
            value: renderWithFallback(employeeInfo?.projectName)
        },
        {
            name: 'fromLocation',
            label: 'Current Location',
            value: renderWithFallback(employeeInfo?.employeeBuildingName)
        },
        ...(!fieldsForRestrictData?.includes('TransferOnBehalfOf')
            ? [
                  {
                      name: 'transferOnBehalfOf',
                      label: 'Transfer On Behalf Of',
                      value: <Input placeholder="Enter transfer on behalf of" />,
                      colSpan: 6,
                      validation: [{ required: true, message: 'Please enter valid value' }]
                  },
                  {
                      label: '',
                      colSpan: 18
                  }
              ]
            : []),
        {
            name: 'toProjectId',
            label: 'Target Project',
            value: <BaseSelect options={projectOptions} placeholder="Select target project" />,
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            name: 'toLocation',
            label: 'Target Location',
            value: (
                <BaseSelect
                    options={listAllIndex?.buildingBasicDtos?.map((item: any) => ({ label: item.value, value: item.value })) || []}
                    placeholder="Select target location"
                />
            ),
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            name: 'transferDate',
            label: 'Transfer Date',
            value: <DatePicker disabledDate={current => current.isBefore(dayjs().startOf('day'))} placeholder="Select transfer date" />,
            validation: [{ required: true, message: 'Please enter valid value' }]
        },

        {
            name: 'transferNotes',
            label: 'Transfer Note',
            value: <Input.TextArea placeholder="Enter transfer note" className="text-area-item" />,
            colSpan: 12
        },
        {
            name: 'revokeNotes',
            label: 'Revoke Customer Access',
            value: <Input.TextArea placeholder="Enter revoke customer access" className="text-area-item" />,
            colSpan: 12,
            validation: [{ required: true, message: 'Please enter valid value' }]
        }
    ];

    useEffect(() => {
        const fetchDataList = async () => {
            const res = await employeeTransferService.getAllIndex();
            const { data, succeeded } = res;

            if (succeeded && data) {
                setListAllIndex(data);
            }
        };

        const getOptionsProject = async () => {
            try {
                const res = await employeeService.getAllProjects();
                const { succeeded, data = [] } = res;

                if (succeeded && data) {
                    const projectOptions = data.map((item: any) => {
                        return {
                            label: item.projectName,
                            value: item.projectId
                        };
                    });
                    setProjectOptions(projectOptions);
                }
            } catch (error) {
                return setProjectOptions([]);
            }
        };

        fetchDataList();
        getOptionsProject();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <DetailFields data={newTransferCols} />;
};

export default SectionFieldTransfer;
