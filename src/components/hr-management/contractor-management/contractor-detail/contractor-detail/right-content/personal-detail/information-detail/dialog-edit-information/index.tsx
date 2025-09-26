import DialogDefault from '@/components/common/dialog/default';
import BaseDivider from '@/components/common/divider';
import DatePicker from '@/components/common/form/date-picker';
import InputCommon from '@/components/common/form/input';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import { removeNullUndefinedEmpty } from '@/components/hr-management/onsite-management/onsite-common';
import contractorService from '@/services/hr-management/contractor-management';
import { IField } from '@/types/common';
import { IContractor } from '@/types/hr-management/contractor-management';
import { ISelect } from '@/types/hr-management/employee-management';
import { formatTime, handleValidateAge, handleValidateName, phoneValidatePattern, validate500Characters } from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { Button, Form, Input, Radio, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';
import useLoading from '@/utils/hook/useLoading';

export interface IEditInformationProps {
    isShow: boolean;
    onCancel: () => void;
    data?: Partial<IContractor>;
    reloadAPIEmployee?: (params: object) => void;
}

const DialogEditInformation = (props: IEditInformationProps) => {
    const { isShow, onCancel, reloadAPIEmployee, data } = props;
    const {
        lastName,
        firstName,
        genderId,
        mobilePhone,
        personalEmail,
        birthday,
        birthPlace,
        intendToEmployeeDate,
        idCardNo,
        idCardIssueDate,
        idCardIssuePlace,
        nationalityId,
        permanentAddress,
        contactAddress,
        entryLanguageScore,
        isGraduated
    } = data || {};

    const { contractorId = '' } = useParams();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();


    const [genderList, setGenderList] = useState<ISelect[]>([]);
    const [nationalityList, setNationalityList] = useState<ISelect[]>([]);

    const arrFields: IField[] = [
        {
            name: 'lastName',
            label: 'Last name',
            value: <Input placeholder="Enter last name" />,
            validation: [{ required: true, validator: (_: any, value: string) => handleValidateName(value) }]
        },
        {
            name: 'firstName',
            label: 'First name',
            value: <Input placeholder="Enter first name" />,
            validation: [{ required: true, validator: (_: any, value: string) => handleValidateName(value) }]
        },
        {
            name: 'genderId',
            label: 'Gender',
            value: <BaseSelect options={genderList} placeholder="Select gender" />,
            validation: [{ required: true, message: 'Please enter the valid value' }]
        },
        {
            name: 'mobilePhone',
            label: 'Mobile phone',
            value: <InputCommon placeholder="Enter mobile phone" typeInput="phone-number" />,
            validation: [{ pattern: phoneValidatePattern, message: 'Please enter a valid phone number' }]
        },
        {
            name: 'personalEmail',
            label: 'Personal email',
            value: <InputCommon placeholder="Enter personal email" typeInput="no-spaces" />,
            validation: [validate500Characters]
        },
        {
            name: 'birthday',
            label: 'DOB',
            value: <DatePicker allowClear />,
            validation: [{ validator: (_: any, value: string) => handleValidateAge(value) }]
        },
        {
            name: 'birthPlace',
            label: 'Place of birth',
            value: <Input placeholder="Enter place of birth" />,
            validation: [validate500Characters]
        },
        {
            name: 'intendToEmployeeDate',
            label: 'Intend to be employee',
            value: <DatePicker allowClear />
        },
        {
            name: 'idCardNo',
            label: 'ID card',
            value: <Input placeholder="Enter ID card" />,
            validation: [validate500Characters]
        },
        {
            name: 'idCardIssueDate',
            label: 'ID card issued date',
            value: <DatePicker placeholder="Enter ID card issued date" allowClear />
        },
        {
            name: 'idCardIssuePlace',
            label: 'ID card issued place',
            value: <Input placeholder="Enter ID card issued place" />,
            validation: [validate500Characters]
        },
        {
            name: 'nationalityId',
            label: 'Nationality',
            value: <BaseSelect options={nationalityList} placeholder="Select nationality" />
        },
        {
            name: 'permanentAddress',
            label: 'Permanent Address',
            value: <Input placeholder="Enter permanent address" />
        },
        {
            name: 'contactAddress',
            label: 'Contact address',
            value: <Input placeholder="Enter contact address" />,
            validation: [validate500Characters]
        },
        {
            name: 'entryLanguageScore',
            label: 'Entry language',
            value: <Input placeholder="Enter entry language score" />
        },
        {
            name: 'isGraduated',
            label: 'Graduated',
            value: (
                <div className="container">
                    {typeof form.getFieldValue('isGraduated') === 'boolean' && (
                        <Radio.Group defaultValue={form.getFieldValue('isGraduated')}>
                            <Radio value={true}>Yes</Radio>
                            <Radio value={false}>No</Radio>
                        </Radio.Group>
                    )}
                </div>
            )
        }
    ];

    const handleCancelDialog = () => {
        onCancel();
        form.resetFields();
    };

    const formatContractorInformation = (item: any) => {
        const { birthday, intendToEmployeeDate, idCardIssueDate, isGraduated, mobilePhone } = item;

        const data = {
            ...item,
            contractorId: parseInt(contractorId),
            birthday: birthday ? formatTime(birthday) : null,
            intendToEmployeeDate: intendToEmployeeDate ? formatTime(intendToEmployeeDate) : null,
            idCardIssueDate: idCardIssueDate ? formatTime(idCardIssueDate) : null,
            isGraduated: isGraduated === 'true' ? true : false,
            mobilePhone: mobilePhone ? mobilePhone.replace(/\s/g, '') : null
        };

        return data;
    };

    const handleSubmit = async () => {
        const data = form.getFieldsValue();
        const dataFormat = removeNullUndefinedEmpty(formatContractorInformation(data));
        const res = await contractorService.updateContractorPersonalInformation(dataFormat);
        const { succeeded, message } = res;

        if (succeeded) {
            reloadAPIEmployee?.({});
            form.resetFields();
            onCancel();
        }
        showNotification(succeeded, message);
    };

    const renderContent = () => {
        return (
            <Spin spinning={isLoading}>
                <Form form={form} onFinish={handleSubmit} requiredMark={RequiredMark}>
                    <div className="dialog-information__container">
                        {arrFields
                            .filter(item => !item.hidden)
                            .map((item: any, index: number) => {
                                const { name, label, value, validation } = item;

                                return (
                                    <Form.Item key={index} name={name} label={label} htmlFor="" rules={validation} className="dialog-information__item">
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
                        <Button type="primary" htmlType="submit" className="btn btn--submit">
                            Save
                        </Button>
                    </div>
                </Form>
            </Spin>
        );
    };

    const handleCancel = () => {
        onCancel();
        form.resetFields();
    };

    useEffect(() => {
        const fetchDataIndex = async () => {
            turnOnLoading();
            const res = await contractorService.getAllIndexes();
            const { data = [], succeeded } = res;
            turnOffLoading()

            if (succeeded && 'genders' in data) {
                const genderList = data.genders.map((item: any) => {
                    return {
                        label: item.genderName,
                        value: item.genderId
                    };
                });

                setGenderList(genderList);
            }

            if (succeeded && 'nationalities' in data) {
                const nationalityList = data.nationalities.map((item: any) => {
                    return {
                        label: item.nationalityName,
                        value: item.nationalityId
                    };
                });

                setNationalityList(nationalityList);
            }
        };

        form.setFieldsValue({
            lastName,
            firstName,
            genderId,
            mobilePhone: mobilePhone ? mobilePhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3').trim() : null,
            personalEmail,
            birthday: birthday ? dayjs(birthday, TIME_FORMAT.VN_DATE) : null,
            birthPlace,
            intendToEmployeeDate: intendToEmployeeDate ? dayjs(intendToEmployeeDate, TIME_FORMAT.VN_DATE) : null,
            idCardNo,
            idCardIssueDate: idCardIssueDate ? dayjs(idCardIssueDate, TIME_FORMAT.VN_DATE) : null,
            idCardIssuePlace,
            nationalityId,
            permanentAddress,
            contactAddress,
            entryLanguageScore,
            isGraduated
        });

        fetchDataIndex();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <DialogDefault
            title="Edit Information"
            isShow={isShow}
            onCancel={handleCancel}
            content={renderContent()}
            className="dialog-information"
            footer={null}
        />
    );
};

export default DialogEditInformation;
