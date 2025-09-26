import Avatar from '@/components/common/avatar';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import { IField, ITableHaveActionAddProps } from '@/types/common';
import { IContractor } from '@/types/hr-management/contractor-management';
import { formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import usePermissions from '@/utils/hook/usePermissions';
import { Button } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useState } from 'react';
import DialogEditWorkInfoContractor from './dialog-edit-work-information-contractor';

const ContractorDetailLeftContent = (props: ITableHaveActionAddProps<IContractor>) => {
    const { dataProps, isReload } = props;
    const {
        contractorBadgeId,
        projectName,
        buildingName,
        floorName,
        roomName,
        effort,
        contractTypeName,
        joinDate,
        endDate,
        notes,
        employeeImageUrl,
        fullName,
        isContractorDisabled,
        positionName,
        grade,
        contractorStatusColor,
        contractorStatus
    } = dataProps || {};

    const { havePermission } = usePermissions('CommonInformation', 'ContractorManagement');

    // Dialog edit
    const [isShowDialogEdit, setIsShowDialogEdit] = useState(false);

    const handleCancelDialog = () => {
        setIsShowDialogEdit(false);
    };

    const arrFields: IField[] = [
        {
            label: 'Contractor ID',
            value: renderWithFallback(contractorBadgeId)
        },
        {
            label: ORG_UNITS.Project,
            value: renderWithFallback(projectName)
        },
        {
            label: 'Location',
            value: `${buildingName || '-'}${floorName ? ` - ${floorName}` : ''}${roomName ? ` - ${roomName}` : ''}`
        },
        {
            label: 'Effort',
            value: renderWithFallback(effort + '%')
        },
        {
            label: 'Contract',
            value: renderWithFallback(contractTypeName)
        },
        {
            label: 'Joined Date',
            value: renderWithFallback(formatTimeMonthDayYear(joinDate))
        },
        {
            label: 'End Date',
            value: renderWithFallback(formatTimeMonthDayYear(endDate))
        },
        {
            label: 'Note',
            value: renderWithFallback(notes)
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
                        <Button className="btn" type="text" onClick={() => setIsShowDialogEdit(true)} disabled={isContractorDisabled}>
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
                        <span className="icon-dot" style={{ color: contractorStatusColor }}>
                            ●
                        </span>
                        <div className="time" style={{ color: contractorStatusColor }}>
                            {contractorStatus}
                        </div>
                    </div>
                </div>
            </div>
            {arrFields.map((item: IField, index: number) => {
                const { label, value } = item;
                return (
                    <div className="info-item" key={index}>
                        <div className="title">{label}</div>
                        <div className="value">{value}</div>
                    </div>
                );
            })}
            {isShowDialogEdit && (
                <DialogEditWorkInfoContractor data={{ ...dataProps }} isShow={isShowDialogEdit} onCancel={handleCancelDialog} isReload={isReload} />
            )}
        </Content>
    );
};

export default ContractorDetailLeftContent;
