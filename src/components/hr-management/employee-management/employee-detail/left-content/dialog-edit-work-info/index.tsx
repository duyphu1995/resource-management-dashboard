import DialogDefault from '@/components/common/dialog/default';
import BaseDivider from '@/components/common/divider';
import DatePicker from '@/components/common/form/date-picker';
import InputCommon from '@/components/common/form/input';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import positionService from '@/services/admin/position';
import employeeService from '@/services/hr-management/employee-management';
import { IAdminPosition } from '@/types/admin';
import { ICheckbox, IField, IResponse } from '@/types/common';
import { IEditWorkInformationProps, ISelect } from '@/types/hr-management/employee-management';
import { formatTime, validateWorkEmail } from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { Button, Checkbox, Form } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

const DialogEditWorkInfo = (props: IEditWorkInformationProps) => {
    const {
        isShow,
        onCancel,
        isReload,
        data: {
            badgeId = '',
            workEmail,
            positionId,
            grade,
            statusName,
            workPhone,
            joinDate = '',
            dataNote = [],
            effort,
            beforeWorkExp,
            buildingName,
            floorName,
            roomName
        } = {},
        editedFields,
        isLimit,
        moduleName
    } = props;

    const { id = '' } = useParams();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();

    const [positionList, setPositionList] = useState<ISelect[]>([]);
    const [gradeList, setGradeList] = useState<ISelect[]>([]);
    const editedFieldsWithDisabledFields = editedFields?.concat(['badgeId', 'workEmail']);

    const handleCancelDialog = () => {
        onCancel();
        form.resetFields();
    };

    const formatEmployee = (item: any) => {
        const { joinDate } = item;
        !isLimit || (editedFields?.includes('workEmail') && delete item['workEmail']);

        return {
            ...item,
            employeeId: parseInt(id),
            joinDate: joinDate && formatTime(joinDate)
        };
    };

    const handleSubmit = async () => {
        const data = form.getFieldsValue();
        const dataFormat = formatEmployee(data);
        const response: IResponse = await employeeService.editWorkInformation(dataFormat, moduleName);

        handleShowNotifyAPI(response);
    };

    const handleShowNotifyAPI = (response: IResponse) => {
        const { succeeded, message } = response;

        showNotification(succeeded, message);
        if (succeeded) {
            isReload({});
            form.resetFields();
            onCancel();
            return;
        }
    };

    const formatPositionList = (data: IAdminPosition[]) => {
        if (!data) return [];
        return data.map((item: IAdminPosition) => {
            const { positionName, positionId, minGrade, maxGrade } = item;
            return {
                minGrade,
                maxGrade,
                label: positionName,
                value: positionId
            };
        });
    };

    const handleFormatGradeList = (positionId: number, data: ISelect[] | undefined) => {
        if (!data || !positionId) return;

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
            const response = await positionService.getAll(moduleName);
            const { data = [], succeeded } = response;
            if (succeeded) {
                const positionsFormat = formatPositionList(data);
                setPositionList(positionsFormat);
                handleFormatGradeList(positionId, positionsFormat);
            }
        };

        getAllPosition();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChangeSelectPosition = (id: number) => {
        handleFormatGradeList(id, positionList);
        form.setFieldValue('grade', undefined);
    };

    const arrFields: IField[] = [
        {
            label: 'Badge ID',
            name: 'badgeId',
            value: renderWithFallback(badgeId)
        },
        {
            name: 'workEmail',
            label: 'Work Email',
            value: <InputCommon placeholder="Enter work email" typeInput="no-spaces" disabled={isLimit} />,
            validation: [{ required: true, validator: (_: any, value: string) => validateWorkEmail(value) }]
        },
        {
            name: 'positionId',
            label: 'Position',
            value: <BaseSelect options={positionList} onChange={handleChangeSelectPosition} placeholder="Select position" />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'grade',
            label: 'Grade',
            value: <BaseSelect options={gradeList} placeholder="Select level" />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: 'Effort',
            value: renderWithFallback(effort + '%')
        },
        {
            label: 'Working Status',
            value: renderWithFallback(statusName)
        },
        {
            name: 'workPhone',
            label: 'Work Phone',
            value: <InputCommon placeholder="Enter work phone" typeInput="numbers-only" />
        },
        {
            name: 'joinDate',
            label: 'Joined Date',
            value: <DatePicker allowClear />,

            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: 'Experience Before TMA (Months)',
            value: renderWithFallback(beforeWorkExp)
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

    const arrFieldsLocation: IField[] = [
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
                {arrFields.map((item: IField, index: number) => {
                    const { name, label, value, validation } = item;
                    if (isLimit && editedFieldsWithDisabledFields?.includes(name))
                        return (
                            <Form.Item key={index} name={name} label={label} htmlFor="" rules={validation} className="dialog-edit__item">
                                {value}
                            </Form.Item>
                        );
                    else if (!isLimit)
                        return (
                            <Form.Item key={index} name={name} label={label} htmlFor="" rules={validation} className="dialog-edit__item">
                                {value}
                            </Form.Item>
                        );
                })}
                <div className="dialog-edit__item location">
                    <div className="dialog-edit__label">Location</div>
                    <div className="location__container">
                        {arrFieldsLocation.map((item: IField) => {
                            const { name, value, validation } = item;
                            if (isLimit && editedFields?.includes(name))
                                return (
                                    <Form.Item key={name} name={name} rules={validation} className="location__item">
                                        {value}
                                    </Form.Item>
                                );
                            else if (!isLimit)
                                return (
                                    <Form.Item key={name} name={name} rules={validation} className="location__item">
                                        {value}
                                    </Form.Item>
                                );
                        })}
                    </div>
                </div>
                {dataNote.map((item: ICheckbox, index: number) => {
                    const { label, checked = true, key } = item;
                    if (isLimit && editedFields?.includes(key))
                        return (
                            <Form.Item
                                name={key}
                                valuePropName="checked"
                                initialValue={checked}
                                key={`edit-${label}_${index}`}
                                className="dialog-edit__item"
                            >
                                <Checkbox className="ckb">{label}</Checkbox>
                            </Form.Item>
                        );
                    else if (!isLimit)
                        return (
                            <Form.Item
                                name={key}
                                valuePropName="checked"
                                initialValue={checked}
                                key={`edit-${label}_${index}`}
                                className="dialog-edit__item"
                            >
                                <Checkbox className="ckb">{label}</Checkbox>
                            </Form.Item>
                        );
                })}
            </div>
            <BaseDivider margin="24px 0 16px 0" />
            <div className="dialog-edit__footer">
                <Button type="default" onClick={handleCancelDialog} className="btn">
                    Cancel
                </Button>
                <Button type="primary" htmlType="submit" className="btn btn--submit">
                    Save
                </Button>
            </div>
        </Form>
    );

    useEffect(() => {
        // Set default value for form
        form.setFieldsValue({
            workEmail,
            positionId,
            grade,
            workPhone,
            joinDate: joinDate && dayjs(joinDate, TIME_FORMAT.VN_DATE),
            buildingName,
            floorName,
            roomName
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

export default DialogEditWorkInfo;
