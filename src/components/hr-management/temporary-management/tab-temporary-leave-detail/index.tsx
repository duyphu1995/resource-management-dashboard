import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import temporaryLeaveService from '@/services/hr-management/temporary-management';
import { IField, ITableHaveActionAddProps } from '@/types/common';
import { IInfoSection } from '@/types/hr-management/onsite-management';
import { ITemporaryDetail } from '@/types/hr-management/temporary-leaves';
import { formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import { ButtonProps } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TemporaryInfo from '../temporary-info';
import usePermissions from '@/utils/hook/usePermissions';

const TabTemporaryLeaveDetail = (props: ITableHaveActionAddProps<any>) => {
    const { isReload } = props;

    const navigation = useNavigate();
    const { id = '' } = useParams();
    const { havePermission } = usePermissions('TemporaryLeavesDetails', 'TemporaryLeaves');

    const [dataTemporaryDetail, setDataTemporaryDetail] = useState<ITemporaryDetail>();

    const employeeCols: IField[] = [
        {
            label: 'Full Name',
            value: renderWithFallback(dataTemporaryDetail?.fullName)
        },
        {
            label: 'Badge ID',
            value: renderWithFallback(dataTemporaryDetail?.badgeId)
        },
        {
            label: 'Leaves Type',
            value: renderWithFallback(dataTemporaryDetail?.leaveTypeName)
        },
        {
            label: ORG_UNITS.Project,
            value: renderWithFallback(dataTemporaryDetail?.projectName)
        },
        {
            label: 'Start Date',
            value: renderWithFallback(formatTimeMonthDayYear(dataTemporaryDetail?.startDate))
        },
        {
            label: 'Expected End Date',
            value: renderWithFallback(formatTimeMonthDayYear(dataTemporaryDetail?.endDate))
        },
        {
            label: 'Actual End Date',
            value: renderWithFallback(formatTimeMonthDayYear(dataTemporaryDetail?.actualEndDate))
        },
        {
            label: 'Effort',
            value: renderWithFallback(dataTemporaryDetail?.effort + '%')
        },
        {
            label: 'Note',
            value: renderWithFallback(dataTemporaryDetail?.notes)
        }
    ];

    const contractSelections: IInfoSection[] = [{ title: 'Employee Information', columns: employeeCols }];

    const goBack = () => navigation(pathnames.hrManagement.temporaryLeaves.main.path);
    const onClickEdit = () => navigation(pathnames.hrManagement.temporaryLeaves.edit.path + '/' + id);

    const buttons: ButtonProps[] = [
        havePermission('ViewEmployeeDetails') &&
        {
            children: 'View Employee Details',
            onClick: () => navigation(pathnames.hrManagement.employeeManagement.detail.path + '/' + dataTemporaryDetail?.employeeId)
        },
        havePermission('Edit') &&
        {
            onClick: onClickEdit,
            type: 'primary',
            children: 'Edit'
        }
    ].filter(Boolean);

    useEffect(() => {
        const fetchData = async () => {
            const response = await temporaryLeaveService.getTemporaryDetail(Number(id));
            setDataTemporaryDetail(response.data);
        };

        fetchData();
    }, [id, isReload]);

    return <TemporaryInfo pageTitle="Temporary Leaves Details" buttons={buttons} data={contractSelections} goBack={goBack} />;
};

export default TabTemporaryLeaveDetail;
