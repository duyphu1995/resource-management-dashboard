import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailInfo from '@/components/common/detail-management/detail-info';
import BaseDivider from '@/components/common/divider';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import OnsiteInfo from '@/components/hr-management/onsite-management/onsite-info';
import pathnames from '@/pathnames';
import onsiteService from '@/services/hr-management/onsite-management';
import { IField, ITableHaveActionAddProps } from '@/types/common';
import { IExpense, IInfoSection, IOnsite } from '@/types/hr-management/onsite-management';
import { formatCurrencyNumber, formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import usePermissions from '@/utils/hook/usePermissions';
import { ButtonProps, Checkbox, Radio } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TabOnsiteDetail = (props: ITableHaveActionAddProps<any>) => {
    const { isReload } = props;

    const { id = '' } = useParams();
    const navigation = useNavigate();
    const [dataOnsiteInfo, setDataOnsiteInfo] = useState<IOnsite>();

    const { havePermission } = usePermissions('OnsiteDetails', 'OnsiteManagement');

    const dataEmployeeInfo: IField[] = [
        {
            label: 'Full Name',
            value: renderWithFallback(dataOnsiteInfo?.fullName)
        },
        {
            label: 'Badge ID',
            value: renderWithFallback(dataOnsiteInfo?.badgeId)
        },
        {
            label: ORG_UNITS.Project,
            value: renderWithFallback(dataOnsiteInfo?.projectName)
        },
        {
            label: 'Customer',
            value: renderWithFallback(dataOnsiteInfo?.customer)
        },
        {
            label: 'Emergency',
            value: renderWithFallback(dataOnsiteInfo?.emergency)
        },
        {
            label: 'Cash From TMA',
            value: renderWithFallback(dataOnsiteInfo?.cashFromTMA)
        },
        {
            label: 'Received Date',
            value: renderWithFallback(formatTimeMonthDayYear(dataOnsiteInfo?.receivedDate))
        },
        {
            label: 'Income Remark',
            value: renderWithFallback(dataOnsiteInfo?.incomeRemark)
        }
    ];

    const renderInsurance = (
        <>
            <Radio checked={dataOnsiteInfo?.isInsurance} disabled>
                Yes
            </Radio>
            <Radio checked={!dataOnsiteInfo?.isInsurance} disabled>
                No
            </Radio>
        </>
    );

    const dataFlightInfo: IField[] = [
        {
            label: 'Country',
            value: renderWithFallback(dataOnsiteInfo?.countryName)
        },
        {
            label: 'City',
            value: renderWithFallback(dataOnsiteInfo?.cityName)
        },
        {
            label: 'Visa Type',
            value: renderWithFallback(dataOnsiteInfo?.visaTypeName)
        },
        {
            label: 'Flight Departure',
            value: renderWithFallback(formatTimeMonthDayYear(dataOnsiteInfo?.flightDeparture))
        },
        {
            label: 'Flight Return',
            value: renderWithFallback(formatTimeMonthDayYear(dataOnsiteInfo?.flightReturn))
        },
        {
            label: 'Expected End',
            value: renderWithFallback(formatTimeMonthDayYear(dataOnsiteInfo?.expectedEndDate))
        },
        {
            label: 'Actual End',
            value: renderWithFallback(formatTimeMonthDayYear(dataOnsiteInfo?.actualEndDate))
        },
        {
            label: 'Insurance',
            value: renderWithFallback(renderInsurance)
        },
        {
            label: 'Note',
            value: renderWithFallback(dataOnsiteInfo?.notes)
        }
    ];

    const dataCommitmentInfo: IField[] = [
        {
            label: 'Commitments Type',
            value: renderWithFallback(dataOnsiteInfo?.commitment?.commitmentTypeName)
        },
        {
            label: 'Signed Date',
            value: renderWithFallback(formatTimeMonthDayYear(dataOnsiteInfo?.commitment?.signedDate))
        },
        {
            label: 'From',
            value: renderWithFallback(formatTimeMonthDayYear(dataOnsiteInfo?.commitment?.fromDate))
        },
        {
            label: 'To',
            value: renderWithFallback(formatTimeMonthDayYear(dataOnsiteInfo?.commitment?.toDate))
        },
        {
            label: 'Attachment',
            value: <div className="onsite-file">{renderWithFallback(dataOnsiteInfo?.commitment?.attachmentName)}</div>
        },
        {
            label: 'Note',
            value: renderWithFallback(dataOnsiteInfo?.commitment?.notes)
        },
        {
            label: ' ',
            value: (
                <Checkbox checked={dataOnsiteInfo?.commitment?.isBroken} disabled>
                    Broken
                </Checkbox>
            )
        }
    ];

    const onsiteSelections: IInfoSection[] = [
        { title: 'Employee Information', columns: dataEmployeeInfo },
        { title: 'Flight Information', columns: dataFlightInfo },
        { title: 'Commitment', columns: dataCommitmentInfo }
    ];

    const calculateTotalCost = (expenses: IExpense[]) => {
        const totalCost: Record<string, number> = {};

        expenses.forEach(item => {
            const { costFee, monetaryUnit } = item;

            if (costFee !== undefined && monetaryUnit !== undefined) {
                const key = monetaryUnit;
                totalCost[key] = (totalCost[key] || 0) + costFee;
            }
        });

        const entries = Object.entries(totalCost);

        if (entries.length === 0) {
            return <div className="content-price">-</div>;
        }

        return entries.map(([monetaryUnit, value], index) => (
            <div className="content-price" key={`${index}`}>
                {formatCurrencyNumber(value)} {monetaryUnit}
            </div>
        ));
    };

    const remapExpenses = () => {
        const newData: IField[] = [];

        dataOnsiteInfo?.expenses.forEach((item: IExpense) => {
            const { costFee, expenseName, monetaryUnit, notes } = item;

            newData.push(
                ...[
                    { label: expenseName, colSpan: 4 },
                    { label: renderWithFallback(formatCurrencyNumber(costFee)), colSpan: 4 },
                    { label: renderWithFallback(monetaryUnit), colSpan: 4 },
                    { label: renderWithFallback(notes), colSpan: 12 }
                ]
            );
        });

        return newData;
    };

    const sectionExpense = (
        <div className="box-form-group">
            <DetailInfo title="Expense">
                <DetailFields className="label-center-vertical expense" data={remapExpenses()} />
                <BaseDivider className="dashed-divider" />
                <DetailFields
                    data={[
                        { label: <div className="total">Total</div>, colSpan: 4 },
                        { label: <div className="price">{calculateTotalCost(dataOnsiteInfo?.expenses || [])}</div>, colSpan: 4 }
                    ]}
                />
            </DetailInfo>
        </div>
    );

    const goBack = () => navigation(pathnames.hrManagement.onsiteManagement.main.path);
    const onClickEdit = () => navigation(pathnames.hrManagement.onsiteManagement.edit.path + '/' + id);

    const buttons: ButtonProps[] = [
        havePermission('ViewEmployeeDetails') && {
            children: 'View Employee Details',
            onClick: () => navigation(pathnames.hrManagement.employeeManagement.detail.path + '/' + dataOnsiteInfo?.employeeId)
        },
        havePermission('Edit') && {
            onClick: onClickEdit,
            type: 'primary',
            children: 'Edit'
        }
    ].filter(Boolean);

    useEffect(() => {
        const fetchData = async () => {
            const response = await onsiteService.getOnsiteDetail(Number(id));
            setDataOnsiteInfo(response.data);
        };

        fetchData();
    }, [id, isReload]);

    useEffect(() => {
        const handlePopState = () => {
            navigation(pathnames.hrManagement.onsiteManagement.main.path);
        };
        window.addEventListener('popstate', handlePopState);

        return () => {
            setTimeout(() => {
                window.removeEventListener('popstate', handlePopState);
            }, 0);
        };
    }, [navigation]);

    return <OnsiteInfo pageTitle="Onsite Details" buttons={buttons} goBack={goBack} data={onsiteSelections} sectionExpense={sectionExpense} />;
};

export default TabOnsiteDetail;
