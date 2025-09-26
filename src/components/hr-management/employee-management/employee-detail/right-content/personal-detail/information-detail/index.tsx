import DialogViewMoreComment from '@/components/common/dialog/dialog-view-more-comment';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import { ICheckbox, ITableHaveActionAddProps } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import { formatTimeMonthDayYear } from '@/utils/common';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import usePermissions from '@/utils/hook/usePermissions';
import RenderContentMoreAndLess from '@/utils/render-content-more-and-less';
import { Button, Checkbox, Col, Row } from 'antd';
import React, { ReactNode, useState } from 'react';
import { useParams } from 'react-router-dom';
import DialogEditInformation from './dialog-edit-information';

interface FieldRow {
    label: string;
    value?: ReactNode;
    fieldKey: string;
    className?: string;
}

const InformationDetail = (props: ITableHaveActionAddProps<IEmployee>) => {
    const { dataProps, setIsReload } = props;
    const {
        genderName,
        birthPlace,
        idCardNo,
        idCardIssuePlace,
        idCardIssueDate = '',
        passportNo,
        probationScore,
        probationRetestScore,
        maritalStatusName = '',
        birthday = '',
        passportExpiryDate = '',
        passportIssueDate = '',
        comment = '',
        permanentAddress,
        personalEmail,
        mobilePhone,
        nationalityName,
        emergencyPhone,
        contactAddress,
        homePhone,
        hrPositionName,
        entryLanguageName,
        entryLanguageScore,
        // *dataCheckDocuments
        isDegree = false,
        isTranscript = false,
        isReceivedIdCard = false,
        isHouseholdRegistration = false,
        isReceivedCV = false,
        hrComments = []
    } = dataProps || {};

    const nameFromUrl = useGetNameFromUrl();
    const { havePermission, fieldsForSensitiveData, fieldsForRestrictData, fieldsForEditData, isLimitEditData } = usePermissions(
        'InformationDetails',
        nameFromUrl
    );

    const dataCheckDocuments: ICheckbox[] = [
        {
            key: 'isDegree',
            checked: isDegree,
            label: 'Degree'
        },
        {
            key: 'isReceivedIdCard',
            checked: isReceivedIdCard,
            label: 'Received ID Card'
        },
        {
            key: 'isReceivedCV',
            checked: isReceivedCV,
            label: 'Received CV'
        },
        {
            key: 'isTranscript',
            checked: isTranscript,
            label: 'Transcript'
        },
        {
            key: 'isHouseholdRegistration',
            checked: isHouseholdRegistration,
            label: 'Household Registration'
        }
    ];

    const [isEditInformation, setIsEditInformation] = useState(false);
    const [isShowModalComment, setIsShowModalComment] = useState(false);

    const { id = '' } = useParams();

    //Edit information
    const handleCancelEditInformation = () => {
        setIsEditInformation(false);
    };

    const renderFields = (title: string, value?: ReactNode, classField?: string) => {
        return (
            <Col className={`col-field ${classField}`}>
                <div className="title">{title}</div>
                <div className="font-weight-500">{value || '-'}</div>
            </Col>
        );
    };

    const fieldRows: FieldRow[][] = [
        [
            { label: 'Gender', value: genderName, fieldKey: 'genderName' },
            { label: 'DOB', value: formatTimeMonthDayYear(birthday), fieldKey: 'birthday' },
            { label: 'Marital Status', value: maritalStatusName, fieldKey: 'maritalStatusName' }
        ],
        [
            { label: 'Place Of Birth', value: renderWithFallback(birthPlace, true, 30), fieldKey: 'birthPlace' },
            { label: 'Permanent Address', value: renderWithFallback(permanentAddress, true, 30), fieldKey: 'permanentAddress' },
            { label: 'Personal Email', value: renderWithFallback(personalEmail, true, 30), fieldKey: 'personalEmail' }
        ],
        [
            { label: 'Contact Address', value: renderWithFallback(contactAddress, true, 30), fieldKey: 'contactAddress' },
            { label: 'Mobile Phone', value: mobilePhone, fieldKey: 'mobilePhone' }
        ],
        [
            { label: 'Home Phone', value: homePhone, fieldKey: 'homePhone' },
            { label: 'Nationality', value: nationalityName, fieldKey: 'nationalityName' },
            {
                label: 'Language Certification',
                value: entryLanguageName ? `${entryLanguageName}: ${entryLanguageScore}` : '-',
                fieldKey: 'languageCertification'
            }
        ],
        [
            { label: 'ID Card', value: renderWithFallback(idCardNo, true, 30), fieldKey: 'idCardNo' },
            { label: 'ID Card Issued Place', value: renderWithFallback(idCardIssuePlace, true, 30), fieldKey: 'idCardIssuePlace' },
            { label: 'ID Card Issued Date', value: formatTimeMonthDayYear(idCardIssueDate), fieldKey: 'idCardIssueDate' }
        ],
        [
            { label: 'Passport', value: renderWithFallback(passportNo, true, 30), fieldKey: 'passportNo' },
            { label: 'Passport Issued Date', value: formatTimeMonthDayYear(passportIssueDate), fieldKey: 'passportIssueDate' },
            { label: 'Passport Expiry Date', value: formatTimeMonthDayYear(passportExpiryDate), fieldKey: 'passportExpiryDate' }
        ],
        [
            { label: 'Emergency', value: renderWithFallback(emergencyPhone, true, 30), fieldKey: 'emergencyPhone' },
            { label: 'Probation Score', value: probationScore, fieldKey: 'probationScore' },
            { label: 'Probation Retest', value: probationRetestScore, fieldKey: 'probationRetestScore' }
        ]
    ];

    return (
        <>
            <div className="information-detail">
                <div className="content-header">
                    <h3 className="title">Personal information</h3>
                    {havePermission('Edit') && (
                        <Button className="btn" type="text" onClick={() => setIsEditInformation(true)}>
                            <img src="/media/icons/edit.svg" alt="edit.svg" />
                            <span>Edit</span>
                        </Button>
                    )}
                </div>
                <div className="content--body">
                    {fieldRows.map((row, rowIndex) => (
                        <Row key={rowIndex} className="row-field">
                            {row.map(({ label, value, fieldKey, className }, fieldIndex) => {
                                if (fieldsForRestrictData?.includes(fieldKey)) {
                                    return null; // Hide the field
                                }
                                const maskedValue = fieldsForSensitiveData?.includes(fieldKey) ? '***' : value;
                                return <React.Fragment key={fieldIndex}>{renderFields(label, maskedValue, className)}</React.Fragment>;
                            })}
                        </Row>
                    ))}
                    <Row className="row-field">
                        {!fieldsForRestrictData?.includes('hrPositionName') && renderFields('HR Position', hrPositionName)}
                        {!fieldsForRestrictData?.includes('comment') && (
                            <>
                                <Col className="col-field comment">
                                    <div className="content">
                                        <div className="title">Comment</div>
                                        <div className="font-weight-500">{RenderContentMoreAndLess(comment)}</div>
                                    </div>
                                </Col>
                                <Col className="col-field">
                                    <Button type="text" className="btn-comment" onClick={() => setIsShowModalComment(true)}>
                                        <img src="/media/icons/comment.svg" alt="comment.svg" />
                                        <span>View More Comment</span>
                                    </Button>
                                </Col>
                            </>
                        )}
                    </Row>
                </div>
                <div className="content--footer">
                    <h4 className="title">Check Documents</h4>
                    <div className="content">
                        {dataCheckDocuments.map((item: ICheckbox, index: number) => {
                            const { key, label, checked } = item;
                            if (fieldsForRestrictData?.includes(key)) {
                                return null;
                            }
                            return (
                                <Checkbox key={`${label}_${index}`} checked={checked} disabled className="checkbox-item">
                                    {label}
                                </Checkbox>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* Dialog edit information */}
            {isEditInformation && (
                <DialogEditInformation
                    isShow={isEditInformation}
                    onCancel={handleCancelEditInformation}
                    data={{ ...dataProps, dataCheckDocuments }}
                    reloadAPIEmployee={setIsReload}
                    editedFields={fieldsForEditData}
                    isLimit={isLimitEditData}
                    moduleName={props.moduleName}
                />
            )}
            {/* Dialog view more comment */}
            <DialogViewMoreComment
                hrComments={hrComments}
                reloadAPIEmployee={setIsReload}
                id={id}
                isShowModalComment={isShowModalComment}
                setIsShowModalComment={setIsShowModalComment}
                moduleName={props.moduleName}
            />
        </>
    );
};

export default InformationDetail;
