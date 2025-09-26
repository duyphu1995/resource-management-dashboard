import Avatar from '@/components/common/avatar';
import DialogDefault from '@/components/common/dialog/default';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import BaseDivider from '@/components/common/divider';
import DatePicker from '@/components/common/form/date-picker';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import contractorService from '@/services/hr-management/contractor-management';
import { IField, ITableHaveActionAddProps } from '@/types/common';
import { IContractor, IConvertToEmployee } from '@/types/hr-management/contractor-management';
import { ISelect } from '@/types/hr-management/employee-management';
import { filterNullProperties, formatPositionList, formatTime, formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { Button, Checkbox, Col, Form, Input, Row } from 'antd';
import { ReactNode, useEffect, useState } from 'react';
import DialogEditInformation from './dialog-edit-information';
import './index.scss';

const ContractInformationDetail = (props: ITableHaveActionAddProps<Partial<IContractor>>) => {
    const { dataProps, setIsReload } = props;
    const {
        contractorId,
        genderName,
        birthPlace,
        birthday = '',
        permanentAddress,
        personalEmail,
        mobilePhone,
        isGraduated,
        intendToEmployeeDate,
        contactAddress,
        entryLanguageName,
        entryLanguageScore,
        isContractorDisabled,
        isSendMail,
        endDate,
        joinDate,
        contractorBadgeId,
        fullName,
        employeeImageUrl,
        employeeId
    } = dataProps || {};

    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { havePermission } = usePermissions('InformationDetails', 'ContractorManagement');

    const [isEditInformation, setIsEditInformation] = useState(false);
    const [isShowDialogConvertToEmployee, setIsShowDialogConvertToEmployee] = useState(false);
    const [isShowDialogEndContractor, setIsShowDialogEndContractor] = useState(false);
    const [isShowDialogSendEmail, setIsShowDialogSendEmail] = useState(false);
    const [positionList, setPositionList] = useState<ISelect[]>([]);
    const [gradeList, setGradeList] = useState<ISelect[]>([]);
    const [projectList, setProjectList] = useState<ISelect[]>([]);

    // Edit information
    const handleCancelEditInformation = () => {
        setIsEditInformation(false);
    };

    const renderFields = (title: string, value?: ReactNode, colSpan?: number) => {
        return (
            <Col span={colSpan || 8} className={`col-field`}>
                <div className="title">{title}</div>
                <div className="value overFlow-ellipsis">{value || '-'}</div>
            </Col>
        );
    };

    const handleChangeSelectPosition = (id: number) => {
        handleFormatGradeList(id, positionList);
        form.setFieldValue('grade', undefined);
    };

    const filedConvertToEmployee: IField[] = [
        {
            name: 'badgeId',
            label: 'Badge ID',
            value: <Input placeholder="Enter badge ID" disabled={isLoading} />,
            colSpan: 12,
            validation: [
                { required: true, message: 'Please enter valid value' },
                { max: 8, message: 'Badge ID must be no more than 8 characters' }
            ]
        },
        {
            name: 'workEmail',
            label: 'Work Email',
            value: <Input placeholder="Enter work email" disabled={isLoading} />,
            colSpan: 12,
            validation: [
                { required: true, message: 'Please enter valid value' },
                { type: 'email', message: 'Expected format: admin@example.com' }
            ]
        },
        {
            name: 'joinDate',
            label: 'Joined Date',
            value: <DatePicker placeholder="Select joined date" disabled={isLoading} />,
            colSpan: 12,
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            name: 'positionId',
            label: 'Position',
            value: <BaseSelect options={positionList} placeholder="Select position" onChange={handleChangeSelectPosition} disabled={isLoading} />,
            colSpan: 12,
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            name: 'grade',
            label: 'Grade',
            value: <BaseSelect options={gradeList} placeholder="Select grade" disabled={isLoading} />,
            colSpan: 12,
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            name: 'projectId',
            label: ORG_UNITS.Project,
            value: <BaseSelect options={projectList} placeholder="Select project" disabled={isLoading} />,
            colSpan: 12,
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            label: '',
            value: (
                <Form.Item name="isByPassProbation" valuePropName="checked">
                    <Checkbox disabled={isLoading}>Bypass Probation</Checkbox>
                </Form.Item>
            )
        }
    ];

    const formatConvertToEmployee = (data: IConvertToEmployee) => {
        const { badgeId, positionId, grade, workEmail, joinDate, projectId, isByPassProbation } = data;

        return {
            contractorId: contractorId,
            employeeId: employeeId,
            badgeId: badgeId,
            positionId: positionId,
            grade: grade,
            workEmail: workEmail,
            joinDate: joinDate ? formatTime(joinDate) : undefined,
            projectId: projectId,
            isByPassProbation: isByPassProbation
        };
    };

    const handleSubmitConvertToEmployee = async (values: IConvertToEmployee) => {
        try {
            const checkBadgeId = await contractorService.checkBadgeIdExist(values.badgeId);
            const checkWorkEmail = await contractorService.checkEmailExist(values.workEmail);

            let badgeIdError = '';
            let workEmailError = '';

            if (checkBadgeId.data) {
                badgeIdError = 'That Badge ID is taken. Try another';
            }

            if (checkWorkEmail.data) {
                workEmailError = 'That work email is taken. Try another';
            }

            form.setFields([
                { name: 'badgeId', errors: badgeIdError ? [badgeIdError] : [] },
                { name: 'workEmail', errors: workEmailError ? [workEmailError] : [] }
            ]);

            if (!badgeIdError && !workEmailError) {
                turnOnLoading();
                const formatData = filterNullProperties(formatConvertToEmployee(values));
                const res = await contractorService.convertToEmployee(formatData);
                const { succeeded, message } = res;

                if (succeeded) {
                    setIsShowDialogConvertToEmployee(false);
                    setIsReload?.({});
                }
                showNotification(succeeded, message);
            }
        } catch (error) {
            setIsShowDialogConvertToEmployee(false);
            showNotification(false, 'Convert to employee failed');
        } finally {
            turnOffLoading();
        }
    };

    const renderContentConvertToEmployee = () => (
        <Form form={form} onFinish={handleSubmitConvertToEmployee} requiredMark={RequiredMark}>
            <div className="dialog-convert-to-employee-container">
                <div className="info-default--img">
                    <Avatar size={90} shape="square" src={employeeImageUrl} className="avatar avatar--square" />
                </div>
                <div className="information-right">
                    <div className="info-full-name">{fullName}</div>
                    <div className="info-content">
                        <div className="info-row">
                            <div className="info-col">
                                <span className="info-title">Contractor ID </span>
                                <span className="info-value">{contractorBadgeId}</span>
                            </div>
                        </div>
                        <div className="info-row">
                            <div className="info-col">
                                <span className="info-title">Joined Date </span>
                                <span className="info-value">{renderWithFallback(formatTimeMonthDayYear(joinDate))}</span>
                            </div>
                        </div>
                        <div className="info-row">
                            <div className="info-col">
                                <span className="info-title">End Date</span>
                                <span className="info-value">{renderWithFallback(formatTimeMonthDayYear(endDate))}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="dialog-information__container">
                {filedConvertToEmployee
                    .filter(item => !item.hidden)
                    .map((item: any, index: number) => {
                        const { name, label, value, validation } = item;

                        return (
                            <Form.Item
                                key={index}
                                name={name}
                                label={label}
                                htmlFor=""
                                rules={validation}
                                className="dialog-information__item dialog-information__item-custom"
                            >
                                {value}
                            </Form.Item>
                        );
                    })}
            </div>
            <BaseDivider margin="24px 0 16px 0" />
            <div className="dialog-edit__footer">
                <Button disabled={isLoading} type="default" className="btn" onClick={handleCancelConvertToEmployee}>
                    Cancel
                </Button>
                <Button loading={isLoading} type="primary" htmlType="submit" className="btn btn--submit">
                    Convert
                </Button>
            </div>
        </Form>
    );

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

    const handleCancelConvertToEmployee = () => {
        if (isLoading) return;

        setIsShowDialogConvertToEmployee(false);
        form.resetFields();
    };

    const handleClickEndContractor = async () => {
        if (contractorId) {
            const res = await contractorService.endContractor(contractorId);
            const { succeeded, message } = res;

            if (succeeded) {
                setIsShowDialogEndContractor(false);
                setIsReload?.({});
            }
            showNotification(succeeded, message);
        }
    };

    const handleClickSendMail = async () => {
        const { contractorId } = dataProps || {};
        if (contractorId) {
            const res = await contractorService.sendEmail(contractorId);
            const { succeeded, message } = res;

            if (succeeded) {
                setIsShowDialogSendEmail(false);
                setIsReload?.({});
            }
            showNotification(succeeded, message);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const res = await contractorService.getPositions();
            const { data, succeeded } = res;

            if (succeeded && data) {
                const positionsFormat = formatPositionList(data);

                setPositionList(positionsFormat);
            }
        };

        const getAllIndex = async () => {
            const res = await contractorService.getAllIndexes();
            const { data, succeeded } = res;

            if (succeeded && data) {
                const projectList = data?.mainProjects?.map((item: any) => {
                    return {
                        label: item.projectName,
                        value: item.projectId
                    };
                });
                setProjectList(projectList);
            }
        };

        fetchData();
        getAllIndex();
    }, []);

    return (
        <div className="contractor-detail__information">
            <div className="header-action">
                <div className="header-action__title">Personal Details</div>

                <div className="header-action__button">
                    <Button onClick={() => setIsShowDialogSendEmail(true)} disabled={!isContractorDisabled || isSendMail}>
                        Send Email
                    </Button>
                    <Button onClick={() => setIsShowDialogEndContractor(true)} disabled={isContractorDisabled}>
                        End Contractor
                    </Button>
                    <Button type="primary" onClick={() => setIsShowDialogConvertToEmployee(true)} disabled={isContractorDisabled}>
                        Convert To Employee
                    </Button>
                </div>
            </div>
            <div className="information-detail">
                <div className="content-header">
                    <h3 className="title">Information Details</h3>
                    {havePermission('Edit') && (
                        <Button className="btn" type="text" onClick={() => setIsEditInformation(true)} disabled={isContractorDisabled}>
                            <img src="/media/icons/edit.svg" alt="edit.svg" />
                            <span>Edit</span>
                        </Button>
                    )}
                </div>
                <div className="content--body">
                    <Row className="row-field">
                        {renderFields('Gender', genderName)}
                        {renderFields('Mobile phone', mobilePhone)}
                        {renderFields('Personal email', personalEmail)}
                    </Row>
                    <Row className="row-field">
                        {renderFields('DOB', formatTimeMonthDayYear(birthday))}
                        {renderFields('Place of birth', birthPlace)}
                        {renderFields('Graduated', isGraduated ? 'Yes' : 'No')}
                    </Row>
                    <Row className="row-field">
                        {renderFields('Intend to be employee', formatTimeMonthDayYear(intendToEmployeeDate))}
                        {renderFields('Permanent address', permanentAddress, 16)}
                    </Row>
                    <Row className="row-field">
                        {renderFields('Entry language', entryLanguageName ? entryLanguageName + ': ' + entryLanguageScore : '-')}
                        {renderFields('Contact address', contactAddress, 16)}
                    </Row>
                </div>
            </div>

            {/* Dialog edit information */}
            {isEditInformation && (
                <DialogEditInformation
                    isShow={isEditInformation}
                    onCancel={handleCancelEditInformation}
                    data={dataProps}
                    reloadAPIEmployee={setIsReload}
                />
            )}

            {/* Dialog convert to employee */}
            <DialogDefault
                title="Convert to employee"
                isShow={isShowDialogConvertToEmployee}
                onCancel={handleCancelConvertToEmployee}
                content={renderContentConvertToEmployee()}
                className="dialog-information w-auto convert-to-employee__dialog"
                footer={null}
            />

            {/* Dialog end contractor */}
            <DialogCommon
                open={isShowDialogEndContractor}
                onClose={() => setIsShowDialogEndContractor(false)}
                title="End contractor"
                content={
                    <>
                        The contractor <strong>{dataProps?.fullName}</strong> - <strong>{dataProps?.contractorBadgeId}</strong> will be ended. Are you
                        sure you want to end this contractor?
                    </>
                }
                icon={icons.dialog.warning}
                buttonType="default-primary"
                buttonLeftClick={() => setIsShowDialogEndContractor(false)}
                buttonRightClick={handleClickEndContractor}
                buttonRight="End contractor"
            />

            {/* Dialog send email */}
            <DialogCommon
                open={isShowDialogSendEmail}
                onClose={() => setIsShowDialogSendEmail(false)}
                title="Send notification email"
                content="Notification email will be sent to contractor. Do you want to continue?"
                icon={icons.dialog.info}
                buttonType="default-primary"
                buttonLeftClick={() => setIsShowDialogSendEmail(false)}
                buttonRightClick={handleClickSendMail}
                buttonRight="Send"
            />
        </div>
    );
};

export default ContractInformationDetail;
