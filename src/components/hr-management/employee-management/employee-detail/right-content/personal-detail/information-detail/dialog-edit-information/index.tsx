import DialogDefault from '@/components/common/dialog/default';
import DialogViewMoreComment from '@/components/common/dialog/dialog-view-more-comment';
import BaseDivider from '@/components/common/divider';
import DatePicker from '@/components/common/form/date-picker';
import InputCommon from '@/components/common/form/input';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import genderService from '@/services/admin/gender';
import maritalStatusService from '@/services/admin/marital-status';
import nationalityService from '@/services/admin/nationality';
import positionService from '@/services/admin/position';
import employeeService from '@/services/hr-management/employee-management';
import { IAdminGender, IAdminNationality, IAdminPosition } from '@/types/admin';
import { ICheckbox, IField } from '@/types/common';
import { IEditInformationForm, IEditInformationProps, IMaritalStatus, ISelect } from '@/types/hr-management/employee-management';
import { formatTime, handleValidateAge, handleValidateName, phoneValidatePattern, validate500Characters } from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { AutoComplete, Button, Checkbox, Form, Input } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

const DialogEditInformation = (props: IEditInformationProps) => {
    const {
        isShow,
        onCancel,
        reloadAPIEmployee,
        data: {
            dataCheckDocuments = [],
            entryLanguageName,
            entryLanguageScore,
            genderId,
            birthday,
            maritalStatusId,
            birthPlace,
            permanentAddress,
            personalEmail,
            contactAddress,
            mobilePhone,
            homePhone,
            hrComments = [],
            nationalityId,
            idCardNo,
            idCardIssuePlace,
            idCardIssueDate,
            passportNo,
            passportIssueDate,
            passportExpiryDate,
            emergencyPhone,
            hrPositionId,
            firstName,
            lastName
        } = {},
        editedFields,
        isLimit,
        moduleName
    } = props;

    const { id = '' } = useParams();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const editedFieldsWithDisabledFields = editedFields?.concat(['firstName', 'lastName']);

    // const [isShowComment, setIsShowComment] = useState(false);
    const [isDisableEntryScore, setIsDisableEntryScore] = useState(!entryLanguageName);

    const [genderList, setGenderList] = useState<ISelect[]>([]);
    const [maritalList, setMaritalList] = useState<ISelect[]>([]);
    const [nationalityList, setNationalityList] = useState<ISelect[]>([]);
    const [entryLanguageList, setEntryLanguageList] = useState<ISelect[]>([]);
    const [hrPositionList, setHrPositionList] = useState<ISelect[]>([]);
    const [isShowModalComment, setIsShowModalComment] = useState(false);

    const handleCancelDialog = () => {
        onCancel();
        form.resetFields();
    };

    const handleChangeEntryLanguage = (value: string) => {
        setIsDisableEntryScore(!value);
        form.setFieldValue('entryLanguageScore', undefined);
    };

    const formatEmployeeInformation = (items: any) => {
        const { birthday, idCardIssueDate, passportIssueDate, passportExpiryDate, firstName, lastName, hrPositionId } = items;

        return {
            ...items,
            firstName: !isLimit || editedFields?.includes('firstName') ? firstName?.trim().replace(/\s+/g, ' ') : undefined,
            lastName: !isLimit || editedFields?.includes('lastName') ? lastName?.trim().replace(/\s+/g, ' ') : undefined,
            employeeId: parseInt(id),
            birthday: birthday ? formatTime(birthday) : null,
            idCardIssueDate: idCardIssueDate ? formatTime(idCardIssueDate) : null,
            passportIssueDate: passportIssueDate ? formatTime(passportIssueDate) : null,
            passportExpiryDate: passportExpiryDate ? formatTime(passportExpiryDate) : null,
            hrPositionId: hrPositionId ? parseInt(hrPositionId) : isLimit ? undefined : 0 // If user not select set value to 0
        };
    };

    const handleSubmit = async (values: IEditInformationForm) => {
        const dataFormat = formatEmployeeInformation(values);
        const res = await employeeService.editInformation(dataFormat, moduleName);
        const { succeeded, message } = res;

        if (succeeded) {
            reloadAPIEmployee?.({});
            form.resetFields();
            onCancel();
        }
        showNotification(succeeded, message);
    };

    const watchEntryLanguage = Form.useWatch('entryLanguageName', form);

    const arrFields: IField[] = [
        {
            name: 'lastName',
            label: 'Last Name',
            value: <InputCommon placeholder="Enter last name" typeInput="capitalize-lettersOnly" disabled={isLimit} />,
            validation: [{ required: true, validator: (_: any, value: string) => handleValidateName(value) }]
        },
        {
            name: 'firstName',
            label: 'First Name',
            value: <InputCommon placeholder="Enter last name" typeInput="capitalize-lettersOnly" disabled={isLimit} />,
            validation: [{ required: true, validator: (_: any, value: string) => handleValidateName(value) }]
        },
        {
            name: 'genderId',
            label: 'Gender',
            value: <BaseSelect options={genderList} placeholder="Select gender" />,
            validation: [{ required: true, message: 'Please enter the valid value' }]
        },
        {
            name: 'birthday',
            label: 'DOB',
            value: <DatePicker allowClear />,
            validation: [{ validator: (_: any, value: string) => handleValidateAge(value) }]
        },
        {
            name: 'maritalStatusId',
            label: 'Marital Status',
            value: <BaseSelect options={maritalList} placeholder="Select marital" />
        },
        {
            name: 'birthPlace',
            label: 'Place Of Birth',
            value: <Input placeholder="Enter place of birth" />,
            validation: [validate500Characters]
        },
        {
            name: 'permanentAddress',
            label: 'Permanent Address',
            value: <Input placeholder="Enter permanent address" />,
            validation: [validate500Characters]
        },
        {
            name: 'personalEmail',
            label: 'Personal Email',
            value: <InputCommon placeholder="Enter personal email" typeInput="no-spaces" maxLength={30} />,
            validation: [validate500Characters]
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
        },
        {
            name: 'homePhone',
            label: 'Home Phone',
            value: <InputCommon placeholder="Enter home phone" typeInput="phone-number" />
        },
        {
            name: 'nationalityId',
            label: 'Nationality',
            value: <BaseSelect options={nationalityList} placeholder="Select nationality" />
        },
        {
            name: 'entryLanguageName',
            label: 'Language Certification',
            value: (
                <AutoComplete
                    options={entryLanguageList}
                    placeholder="Select language certification"
                    filterOption={(inputValue, option) => {
                        return option?.value?.toString().toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
                    }}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    allowClear
                    onChange={handleChangeEntryLanguage}
                />
            )
        },
        {
            name: 'entryLanguageScore',
            label: 'Language Certification Score',
            value: <Input placeholder="Enter language certification score" disabled={isDisableEntryScore} />,
            validation: [isDisableEntryScore ? {} : { required: true, message: 'Please enter the valid value' }, validate500Characters]
        },
        {
            name: 'otherCertification',
            label: 'Other Certification',
            value: <Input placeholder="Enter other certification" />,
            validation: [{ required: true, message: 'Please enter the valid value' }, validate500Characters],
            hidden: watchEntryLanguage !== 'other' // Hide when entryLanguageName is not 'other'
        },
        {
            name: 'idCardNo',
            label: 'ID Card',
            value: <Input placeholder="Enter ID card" />,
            validation: [validate500Characters]
        },
        {
            name: 'idCardIssuePlace',
            label: 'ID Card Issued Place',
            value: <Input placeholder="Enter ID card issued place" />,
            validation: [validate500Characters]
        },
        {
            name: 'idCardIssueDate',
            label: 'ID Card Issued Date',
            value: <DatePicker placeholder="Enter ID card issued date" allowClear />
        },
        {
            name: 'passportNo',
            label: 'Passport',
            value: <Input placeholder="Enter passport" />,
            validation: [validate500Characters]
        },
        {
            name: 'passportIssueDate',
            label: 'Passport Issued Date',
            value: <DatePicker placeholder="Enter passport issued date" allowClear />
        },
        {
            name: 'passportExpiryDate',
            label: 'Passport Expiry Date',
            value: <DatePicker placeholder="Enter passport expiry date" allowClear />
        },
        {
            name: 'emergencyPhone',
            label: 'Emergency',
            value: <Input placeholder="Enter emergency" />,
            validation: [validate500Characters]
        },
        {
            name: 'hrPositionId',
            label: 'HR Position',
            value: <BaseSelect options={hrPositionList} placeholder="Select HR position" />
        },
        {
            label: ' ',
            value: (
                <Button type="text" className="btn-comment" onClick={() => setIsShowModalComment(true)}>
                    <img src="/media/icons/comment.svg" alt="comment.svg" />
                    <span>View more comment</span>
                </Button>
            )
        }
    ];

    const renderCheckDocuments = () => {
        const visibleFields = dataCheckDocuments.filter((field: ICheckbox) => !isLimit || (isLimit && editedFields?.includes(field.key)));

        if (visibleFields.length === 0) return null;

        return (
            <div className="dialog-information__documents">
                <div className="documents__label">Check documents</div>
                <div className="documents__container">
                    {visibleFields.map((field: ICheckbox, index: number) => {
                        const { key, label, checked } = field;
                        return (
                            <Form.Item key={index} name={key} valuePropName="checked" initialValue={checked} className="documents-ckb">
                                <Checkbox className="ckb">{label}</Checkbox>
                            </Form.Item>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        return (
            <Form form={form} onFinish={handleSubmit} requiredMark={RequiredMark}>
                <div className="dialog-information__container">
                    {arrFields
                        .filter(item => !item.hidden)
                        .map((item: IField, index: number) => {
                            const { name, label, value, validation } = item;
                            if (!isLimit || (isLimit && editedFieldsWithDisabledFields?.includes(name)))
                                return (
                                    <Form.Item
                                        key={index}
                                        name={name}
                                        label={label}
                                        htmlFor=""
                                        rules={validation}
                                        className="dialog-information__item"
                                    >
                                        {value}
                                    </Form.Item>
                                );

                            return null;
                        })}
                    {renderCheckDocuments()}
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
    };

    const handleCancel = () => {
        onCancel();
        form.resetFields();
    };

    useEffect(() => {
        const getGenderList = async () => {
            const response = await genderService.getAll(moduleName);
            const { data } = response;
            if (data && data.length) {
                const genderListFormat: ISelect[] = data.map((item: IAdminGender) => ({ label: item.genderName, value: item.genderId }));
                setGenderList(genderListFormat);
            }
        };

        const getMaritalList = async () => {
            const response = await maritalStatusService.getAll();
            const { data } = response;
            if (data && data.length) {
                const maritalListFormat: ISelect[] = data.map((item: IMaritalStatus) => ({
                    label: item.maritalStatusName,
                    value: item.maritalStatusId
                }));

                setMaritalList(maritalListFormat);
            }
        };

        const getNationalityList = async () => {
            const response = await nationalityService.getAll(moduleName);
            const { data } = response;
            if (data && data.length) {
                const nationalityListFormat: ISelect[] = data.map((item: IAdminNationality) => ({
                    label: item.nationalityName,
                    value: item.nationalityId
                }));

                setNationalityList(nationalityListFormat);
            }
        };

        const getEntryLanguageList = async () => {
            const response = await employeeService.getEntryLanguage(moduleName);
            const { succeeded, data } = response;

            if (succeeded && data && data?.length > 0) {
                const nationalityListFormat: ISelect[] = data.map(item => ({
                    label: item.entryLanguageName,
                    value: item.entryLanguageName
                }));

                setEntryLanguageList(nationalityListFormat);
            }
        };

        const getHrPositionList = async () => {
            const response = await positionService.getAll('MyProfile');
            const { data } = response;
            if (data && data.length) {
                const hrPositionListFormat: ISelect[] = data.map((item: IAdminPosition) => ({
                    label: item.positionName,
                    value: item.positionId
                }));

                setHrPositionList(hrPositionListFormat);
            }
        };

        // Set value init for form
        form.setFieldsValue({
            lastName,
            firstName,
            genderId,
            birthday: birthday ? dayjs(birthday, TIME_FORMAT.VN_DATE) : null,
            maritalStatusId,
            birthPlace,
            permanentAddress,
            personalEmail,
            contactAddress,
            mobilePhone: mobilePhone ? mobilePhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3').trim() : '',
            homePhone: homePhone ? homePhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3').trim() : '',
            nationalityId,
            idCardNo,
            idCardIssuePlace,
            idCardIssueDate: idCardIssueDate && dayjs(idCardIssueDate, TIME_FORMAT.VN_DATE),
            passportNo,
            passportIssueDate: passportIssueDate && dayjs(passportIssueDate, TIME_FORMAT.VN_DATE),
            passportExpiryDate: passportExpiryDate && dayjs(passportExpiryDate, TIME_FORMAT.VN_DATE),
            emergencyPhone,
            hrPositionId,
            entryLanguageName,
            entryLanguageScore
        });

        getGenderList();
        getMaritalList();
        getNationalityList();
        getEntryLanguageList();
        getHrPositionList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <DialogDefault
                title="Edit Personal information"
                isShow={isShow}
                onCancel={handleCancel}
                content={renderContent()}
                className="dialog-information"
                footer={null}
            />
            <DialogViewMoreComment
                hrComments={hrComments}
                reloadAPIEmployee={reloadAPIEmployee}
                id={id}
                isShowModalComment={isShowModalComment}
                setIsShowModalComment={setIsShowModalComment}
                moduleName={props.moduleName}
            />
        </>
    );
};

export default DialogEditInformation;
