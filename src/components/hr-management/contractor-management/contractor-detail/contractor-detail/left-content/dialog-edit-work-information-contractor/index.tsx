import DialogDefault from '@/components/common/dialog/default';
import BaseDivider from '@/components/common/divider';
import DatePicker from '@/components/common/form/date-picker';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import { removeNullUndefinedEmpty } from '@/components/hr-management/onsite-management/onsite-common';
import contractorService from '@/services/hr-management/contractor-management';
import employeeService from '@/services/hr-management/employee-management';
import { IField, IResponse } from '@/types/common';
import { IEditWorkInformationProps, ISelect } from '@/types/hr-management/employee-management';
import { formatPositionList, formatTime, validateRange0To1000 } from '@/utils/common';
import { ORG_UNITS, TIME_FORMAT } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { Button, Form, Input, InputNumber } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

const DialogEditWorkInfoContractor = (props: IEditWorkInformationProps) => {
    const {
        isShow,
        onCancel,
        isReload,
        data: {
            contractorBadgeId,
            effort,
            positionId,
            grade,
            projectId,
            projectName,
            joinDate,
            endDate,
            buildingName,
            floorName,
            roomName,
            notes
        } = {}
    } = props;

    const { contractorId = '' } = useParams();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();

    const [projectList, setProjectList] = useState<ISelect[]>([{ label: projectName, value: projectId }]);
    const [positionList, setPositionList] = useState<ISelect[]>([]);
    const [gradeList, setGradeList] = useState<ISelect[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCancelDialog = () => {
        onCancel();
        form.resetFields();
    };

    const formatContractorWorkInformation = (item: any) => {
        const { joinDate, endDate } = item;

        return {
            ...item,
            contractorId: Number(contractorId),
            effort: Number(item.effort),
            joinDate: joinDate ? formatTime(joinDate) : undefined,
            endDate: endDate ? formatTime(endDate) : undefined
        };
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const data = form.getFieldsValue();
            const dataFormat = removeNullUndefinedEmpty(formatContractorWorkInformation(data));

            const res = await contractorService.updateContractorWorkInformation(dataFormat);

            handleShowNotifyAPI(res);
        } catch (error) {
            showNotification(false, 'Edit failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShowNotifyAPI = (response: IResponse) => {
        const { succeeded, message } = response;

        if (succeeded) {
            isReload({});
            form.resetFields();
            onCancel();
        }
        showNotification(succeeded, message);
    };

    const handleFormatGradeList = (positionId: number, data: ISelect[] | undefined) => {
        if (!data) return;

        const position = data?.find((item: ISelect) => item.value === positionId);
        const { minGrade = 0, maxGrade = 0 } = position || {};

        const grades: ISelect[] = [];
        if (position) {
            for (let i = minGrade; i <= maxGrade; i++) {
                grades.push({
                    label: i,
                    value: i
                });
            }
        }
        setGradeList(grades);
    };

    useEffect(() => {
        const getAllPosition = async () => {
            const response = await contractorService.getPositions();

            const { data = [], succeeded } = response;
            if (succeeded) {
                const positionsFormat = formatPositionList(data);
                setPositionList(positionsFormat);
                handleFormatGradeList(positionId, positionsFormat);
            }
        };

        const getAllProject = async () => {
            const res = await contractorService.getAllIndexes();
            const { data = [], succeeded } = res;

            if (succeeded && 'mainProjects' in data) {
                const projectFormat = data.mainProjects.map((item: any) => {
                    const { projectName, projectId } = item;
                    return {
                        label: projectName,
                        value: projectId
                    };
                });

                setProjectList(projectFormat);
            }
        };

        getAllPosition();
        getAllProject();
    }, []);

    //Location
    const [buildingList, setBuildingList] = useState<any[]>([]);
    const [floorList, setFloorList] = useState<any[]>([]);
    const [roomList, setRoomList] = useState<ISelect[]>([]);

    const handleFormatSelect = (list: ISelect[]) => {
        if (!list) return [];
        return list.map((item: ISelect) => {
            const { id, value } = item;
            return {
                label: value,
                value: value,
                id: id
            };
        });
    };

    const getRooms = async (floorId: string | undefined = '') => {
        const response = await employeeService.getRoomsByFloor(floorId);
        const { data = [], succeeded } = response;

        if (succeeded) {
            const roomFormat = handleFormatSelect(data);
            setRoomList(roomFormat);
        }
    };

    const getFloors = async (buildingId: string | undefined = '') => {
        // If buildingId is null, set floor list is empty
        if (!buildingId) return;

        const response = await employeeService.getFloorsByBuilding(buildingId);
        const { data = [], succeeded } = response;

        if (succeeded) {
            const floorsFormat = handleFormatSelect(data);
            setFloorList(floorsFormat);
            const floorId = floorsFormat.find((item: ISelect) => item.label === floorName)?.id;

            if (floorId && form.getFieldValue('floorName')) {
                getRooms(floorId);
            }
        }
    };

    useEffect(() => {
        const getBuildings = async () => {
            const response = await employeeService.getBuildings();
            const { data = [], succeeded } = response;

            if (succeeded) {
                const buildingsFormat = handleFormatSelect(data);
                setBuildingList(buildingsFormat);

                // Check building and set floor list
                const buildingId = buildingsFormat.find((item: ISelect) => item.label === buildingName)?.id;
                if (buildingId) {
                    getFloors(buildingId);
                }
            }
        };

        getBuildings();
    }, []);

    const handleChangeSelectPosition = (id: number) => {
        handleFormatGradeList(id, positionList);
        form.setFieldValue('grade', undefined);
    };

    const handleDisableJoinDate = (currentDate: Dayjs | null) => {
        const { endDate } = form.getFieldsValue();
        return endDate && currentDate && currentDate > endDate;
    };

    const handleDisableEndDate = (currentDate: Dayjs | null) => {
        const { joinDate } = form.getFieldsValue();
        return joinDate && currentDate && currentDate < joinDate;
    };

    const fieldWorkInformationFirst: IField[] = [
        {
            label: 'Contractor ID',
            value: contractorBadgeId
        },
        {
            name: 'effort',
            label: 'Effort',
            value: <InputNumber placeholder="Enter effort" className="w-100" addonAfter="%" min={0} step={1} precision={0} />,
            validation: [validateRange0To1000()]
        },
        {
            name: 'projectId',
            label: ORG_UNITS.Project,
            value: <BaseSelect options={projectList} placeholder="Select project" />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'positionId',
            label: 'Position',
            value: <BaseSelect options={positionList} placeholder="Select level" onChange={handleChangeSelectPosition} />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'joinDate',
            label: 'Joined Date',
            value: <DatePicker allowClear disabledDate={handleDisableJoinDate} />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'endDate',
            label: 'End Date',
            value: <DatePicker allowClear disabledDate={handleDisableEndDate} />
        }
    ];
    const fieldWorkInformationLast: IField[] = [
        {
            name: 'grade',
            label: 'Grade',
            value: <BaseSelect options={gradeList} placeholder="Select grade" />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'notes',
            label: 'Note',
            value: <Input.TextArea placeholder="Enter note" className="text-area-item" />
        }
    ];

    const handleChangeBuilding = (value: string) => {
        form.setFieldsValue({
            floorName: undefined,
            roomName: undefined
        });

        const buildingId = buildingList.find(item => item.value === value)?.id;
        getFloors(buildingId);
        setFloorList([]);
        setRoomList([]);
        form.validateFields();
    };

    const handleChangeFloor = (value: string) => {
        form.setFieldValue('roomName', undefined);
        setRoomList([]);
        const roomId = floorList.find(item => item.value === value)?.id;
        if (roomId) {
            getRooms(roomId);
        }
        form.validateFields();
    };

    const filedLocation: IField[] = [
        {
            name: 'buildingName',
            value: <BaseSelect options={buildingList} placeholder="Choose lab" onChange={handleChangeBuilding} />
        },
        {
            name: 'floorName',
            value: <BaseSelect options={floorList} placeholder="Choose floor" onChange={handleChangeFloor} />
        },
        {
            name: 'roomName',
            value: <BaseSelect options={roomList} placeholder="Choose room" />
        }
    ];

    const renderContentDialog = () => (
        <Form form={form} onFinish={handleSubmit} requiredMark={RequiredMark}>
            <div className="dialog-edit__container">
                {fieldWorkInformationFirst.map((item: IField, index: number) => {
                    const { name, label, value, validation } = item;

                    return (
                        <Form.Item key={index} name={name} label={label} htmlFor="" rules={validation} className="dialog-edit__item">
                            {value}
                        </Form.Item>
                    );
                })}
                <div className="location-contractor">
                    <div className="dialog-edit__label">Location</div>
                    <div className="location__container">
                        {filedLocation.map((item: IField) => {
                            const { name, value, validation } = item;

                            return (
                                <Form.Item key={name} name={name} rules={validation} className="location-contractor__form">
                                    {value}
                                </Form.Item>
                            );
                        })}
                    </div>
                </div>
                {fieldWorkInformationLast.map((item: IField, index: number) => {
                    const { name, label, value, validation } = item;

                    return (
                        <Form.Item key={index} name={name} label={label} htmlFor="" rules={validation} className="dialog-edit__item">
                            {value}
                        </Form.Item>
                    );
                })}
            </div>
            <BaseDivider margin="24px 0 16px 0" />
            <div className="dialog-edit__footer">
                <Button type="default" onClick={handleCancelDialog} className="btn">
                    Cancel
                </Button>
                <Button type="primary" htmlType="submit" className="btn btn--submit" loading={isSubmitting}>
                    Save
                </Button>
            </div>
        </Form>
    );

    useEffect(() => {
        // Set default value for form
        form.setFieldsValue({
            effort,
            positionId,
            grade,
            projectId,
            endDate: endDate ? dayjs(endDate, TIME_FORMAT.VN_DATE) : undefined,
            joinDate: joinDate ? dayjs(joinDate, TIME_FORMAT.VN_DATE) : undefined,
            buildingName,
            floorName,
            roomName,
            notes
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <DialogDefault
            title="Edit Work Information"
            isShow={isShow}
            onCancel={handleCancelDialog}
            content={renderContentDialog()}
            className="dialog-edit"
            footer={null}
        />
    );
};

export default DialogEditWorkInfoContractor;
