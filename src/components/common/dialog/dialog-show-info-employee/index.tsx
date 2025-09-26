import pathnames from '@/pathnames';
import { formatTimeMonthDayYear } from '@/utils/common';
import usePermissions from '@/utils/hook/usePermissions';
import { Button, Col, Flex, Modal, Row } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import Title from 'antd/es/typography/Title';
import React from 'react';
import Avatar from '../../avatar';
import BaseDivider from '../../divider';
import Loading from '../../loading';
import RenderProjectGroup from './render-project-group';
import iconMobilePhone from '/media/icons/cell-phone-gray.svg';
import iconMail from '/media/icons/mail-gray.svg';
import iconMap from '/media/icons/map-pin-gray.svg';
import iconPhone from '/media/icons/phone-gray.svg';
import { useAppSelector } from '@/redux/store';
import { selectAuth } from '@/redux/auth-slice';

interface IDialogShowInfoEmployeeProps<T> {
    onShowDetailEmployee: boolean;
    onCloseModal: () => void;
    selectedEmployee: T | null;
    loading?: boolean;
}

const DialogShowInfoEmployee = <T extends AnyObject>(props: IDialogShowInfoEmployeeProps<T>) => {
    const { onShowDetailEmployee, onCloseModal, selectedEmployee, loading } = props;

    const currentUser = useAppSelector(selectAuth).currentUser;
    const { fieldsForSensitiveData } = usePermissions('OrganizationChart', 'GroupManagement');
    const { section } = usePermissions('EmployeeDetails', 'EmployeeManagement');

    const renderContent = () => {
        if (!selectedEmployee) return null;

        const {
            employeeImageUrl,
            fullName,
            badgeId,
            positionName,
            workPhone,
            mobilePhone,
            workEmail,
            locationName,
            genderName,
            joinDate,
            grade,
            employeeId,
            managerName,
            employeeContactUnitDtos,
            employeeUnitInfoDto,
            isContractor,
            isViewDetail
        } = selectedEmployee;

        const contactInformation = [
            { icon: iconPhone, label: workPhone, isSensitive: false },
            { icon: iconMobilePhone, label: mobilePhone, isSensitive: fieldsForSensitiveData?.includes('mobilePhone') },
            { icon: iconMail, label: workEmail, mailto: true, isSensitive: false },
            { icon: iconMap, label: locationName, isSensitive: false }
        ];

        const renderContactInfo = () => {
            return (
                <div style={{ width: '100%' }}>
                    <BaseDivider margin="16px 0" bgColor="#DFDFDF" />
                    <div style={{ fontWeight: 600, color: '#848484', marginBottom: 12 }}>Contact Information</div>
                    <Flex vertical gap={16}>
                        {contactInformation.map((info, index) => (
                            <Flex key={index} align="center" gap={12}>
                                <img src={info.icon} alt="info" style={{ width: 16, height: 16 }} />
                                {info.mailto ? (
                                    <a className="underline" href={`mailto:${info.label}`}>
                                        {info.isSensitive ? '**********' : info.label}
                                    </a>
                                ) : (
                                    <span>{info.isSensitive ? '**********' : info.label || '-'}</span>
                                )}
                            </Flex>
                        ))}
                    </Flex>
                </div>
            );
        };

        const detailInfo = [
            { label: 'Gender', value: genderName },
            { label: 'Joined Date', value: formatTimeMonthDayYear(joinDate) },
            { label: 'Grade', value: grade },
            { label: 'Manager', value: managerName }
        ];

        const renderDetailInfo = () => {
            return (
                <div style={{ width: '100%', marginTop: 16 }}>
                    <BaseDivider margin="16px 0" bgColor="#DFDFDF" />
                    <div style={{ fontWeight: 600, color: '#848484', marginBottom: 12 }}>Detail Information</div>
                    <Row gutter={[24, 16]}>
                        {detailInfo.map((info, index) => (
                            <React.Fragment key={index}>
                                <Col span={6}>{info.label}</Col>
                                <Col span={18}>{info.value || '-'}</Col>
                            </React.Fragment>
                        ))}
                    </Row>
                </div>
            );
        };

        const renderProjectGroup = () => {
            return (
                <div style={{ width: '100%', marginTop: 16 }}>
                    <BaseDivider margin="16px 0" bgColor="#DFDFDF" />
                    <div style={{ fontWeight: 600, color: '#848484', marginBottom: 12 }}>Project/Groups</div>

                    <RenderProjectGroup items={employeeContactUnitDtos || employeeUnitInfoDto} />
                </div>
            );
        };

        let pathDetailEmployee = '';

        if (employeeId === currentUser?.employeeId) {
            pathDetailEmployee = pathnames.employeeContact.myProfile.main.path;
        } else if (section) {
            pathDetailEmployee = pathnames.hrManagement.employeeManagement.detail.path;
        } else {
            pathDetailEmployee = pathnames.groupManagement.detail.path;
        }

        return (
            <div className="dialog-info-employee__chart">
                <div className="chart--header" />
                <Flex justify="center" align="center" vertical className="chart--content">
                    <Avatar className="img-info-chart" src={employeeImageUrl} size={90} />
                    <Title level={4} className="info-title">
                        {fullName}
                    </Title>
                    <span style={{ marginBottom: 8 }}>{badgeId}</span>
                    <span style={{ fontWeight: 500 }}>{positionName}</span>
                    {renderContactInfo()}
                    {renderDetailInfo()}
                    {renderProjectGroup()}
                </Flex>
                <BaseDivider margin="0 0 16px 0" />
                <Flex justify="center" gap={16} className="chart--footer">
                    <Button onClick={() => onCloseModal()}>Cancel</Button>
                    {!isContractor && isViewDetail && (
                        <Button type="primary" onClick={() => window.open(pathDetailEmployee + '/' + employeeId)}>
                            View Details
                        </Button>
                    )}
                </Flex>
            </div>
        );
    };

    return (
        <>
            {loading ? (
                <Loading type="page" />
            ) : (
                <Modal
                    title=""
                    open={onShowDetailEmployee}
                    onCancel={() => onCloseModal()}
                    className="dialog-info-employee__chart"
                    rootClassName="dialog-info-chart-root"
                    footer={null}
                >
                    {renderContent()}
                </Modal>
            )}
        </>
    );
};

export default DialogShowInfoEmployee;
