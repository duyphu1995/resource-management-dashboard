import Avatar from '@/components/common/avatar';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import { ICheckbox, IField } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import { formatTimeMonthDayYear } from '@/utils/common';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import usePermissions from '@/utils/hook/usePermissions';
import { Button, Checkbox, Layout } from 'antd';
import React, { useState } from 'react';
import DialogEditWorkInfo from './dialog-edit-work-info';
import './index.scss';

const { Content } = Layout;

const LeftContent: React.FC<{ data: IEmployee | undefined; isReload: (value: any) => void; moduleName?: string }> = ({
    data,
    isReload,
    moduleName
}) => {
    const {
        badgeId = '',
        positionName,
        statusName,
        joinDate = '',
        isKRD = false,
        isLowPerformance = false,
        isBlacklisted = false,
        isGraduated = false,
        workEmail,
        workPhone,
        grade,
        contractTypeName,
        statusColor,
        employeeImageUrl,
        effort,
        managerName,
        buildingName,
        floorName,
        roomName,
        fullName
    } = data || {};

    const nameFromUrl = useGetNameFromUrl();
    const { havePermission, fieldsForRestrictData, fieldsForEditData, isLimitEditData } = usePermissions('CommonInformation', nameFromUrl);

    const dataNote: ICheckbox[] = [
        {
            key: 'isKRD',
            checked: isKRD,
            label: 'Has KRD'
        },
        {
            key: 'isLowPerformance',
            checked: isLowPerformance,
            label: 'Low Performance'
        },
        {
            key: 'isBlacklisted',
            checked: isBlacklisted,
            label: 'Blacklisted'
        },
        {
            key: 'isGraduated',
            checked: isGraduated,
            label: 'Graduated'
        }
    ];

    //Dialog edit
    const [isShowDialogEdit, setIsShowDialogEdit] = useState(false);

    const handleCancelDialog = () => {
        setIsShowDialogEdit(false);
    };

    const location = buildingName && `${buildingName} ${floorName ? `- ${floorName}` : ''} ${roomName ? `- ${roomName}` : ''}`;

    const arrFields: IField[] = [
        {
            label: 'Badge ID',
            value: renderWithFallback(badgeId),
            name: 'badgeId'
        },
        {
            label: 'Work Mail',
            value: renderWithFallback(workEmail),
            name: 'workEmail'
        },
        {
            label: 'Work Phone',
            value: renderWithFallback(workPhone),
            name: 'workPhone'
        },
        {
            label: 'Manager',
            value: renderWithFallback(managerName),
            name: 'managerName'
        },
        {
            label: 'Location',
            value: renderWithFallback(location),
            name: 'location'
        },
        {
            label: 'Effort',
            value: effort ? effort + '%' : '-',
            name: 'effort'
        },
        {
            label: 'Contract',
            value: renderWithFallback(contractTypeName),
            name: 'contractTypeName'
        },
        {
            label: 'Joined Date',
            value: renderWithFallback(formatTimeMonthDayYear(joinDate)),
            name: 'joinDate'
        }
    ];

    return (
        <Content className="left-content">
            <div className="info-default">
                <div className="info-default--img">
                    <Avatar src={employeeImageUrl} size={252} alt="avatar" className="avatar" />
                </div>
                <div className="info-default--header">
                    <span className="name">{fullName}</span>
                    {havePermission('Edit') && (
                        <Button className="btn" type="text" onClick={() => setIsShowDialogEdit(true)}>
                            <img src="/media/icons/edit.svg" alt="edit.svg" />
                            <span>Edit</span>
                        </Button>
                    )}
                </div>
                <div className="level">
                    <span>
                        {positionName} - Grade {grade}
                    </span>
                    <div className="level-right">
                        <span className="icon-dot" style={{ color: statusColor }}>
                            ●
                        </span>
                        <div className="time" style={{ color: statusColor }}>
                            {statusName}
                        </div>
                    </div>
                </div>
            </div>
            {arrFields.map((item: IField, index: number) => {
                const { label, value, name } = item;
                if (fieldsForRestrictData?.includes(name)) {
                    return null; // Hide fields
                }
                return (
                    <div className="info-item" key={index}>
                        <div className="title">{label}</div>
                        <div className="value">{value}</div>
                    </div>
                );
            })}
            <div className="note">
                {/* Hide title if not have checkbox to show */}
                {Number(fieldsForRestrictData?.length || 0) < dataNote.length && <div className="label">Note</div>}
                <div className="item">
                    {dataNote.map((item: ICheckbox, index: number) => {
                        const { key, label, checked } = item;
                        if (fieldsForRestrictData?.includes(key)) {
                            return null; // Hide fields
                        }
                        return (
                            <Checkbox key={`${label}_${index}`} checked={checked} disabled className="checkbox-item">
                                {label}
                            </Checkbox>
                        );
                    })}
                </div>
            </div>
            {isShowDialogEdit && (
                <DialogEditWorkInfo
                    data={{ ...data, dataNote }}
                    isShow={isShowDialogEdit}
                    onCancel={handleCancelDialog}
                    isReload={isReload}
                    editedFields={fieldsForEditData}
                    isLimit={isLimitEditData}
                    moduleName={moduleName}
                />
            )}
        </Content>
    );
};

export default LeftContent;
