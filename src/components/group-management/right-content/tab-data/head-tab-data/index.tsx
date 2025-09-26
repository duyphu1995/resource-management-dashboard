import BaseDivider from '@/components/common/divider';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseToolTip from '@/components/common/tooltip';
import pathnames from '@/pathnames';
import { IUnitData } from '@/types/group-management/group-management';
import icons from '@/utils/icons';
import { Col, Flex, Row, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React, { ReactNode } from 'react';
import { useParams } from 'react-router-dom';

interface ContentItem {
    value: string | JSX.Element | null;
    title: string;
    toolTip?: string | ReactNode;
    label?: string;
    tab?: string;
    hiddenFilter?: boolean;
    viewHR?: boolean;
    isSharedService?: boolean;
}

interface IHeadTabDataProps {
    unitName: string;
    unitData: IUnitData;
}

const HeadTabData = ({ unitName, unitData }: IHeadTabDataProps) => {
    const { id = '' } = useParams();
    const {unitSharedServices, lastWeek, currentWeek} = unitData || {}

    const timeHeadOne = dayjs(lastWeek?.lastUpdateReport, 'DD-MM-YYYY').format('DD-MM-YYYY');

    const headerDataOne = [
        { label: 'Baseline Name', value: unitName || '-' },
        { label: 'Year', value: lastWeek?.year || '-' },
        { label: 'Week', value: lastWeek?.week || '-' },
        { label: 'Time', value: lastWeek ? timeHeadOne : '-' }
    ];

    const headerDataTwo = [
        { label: 'Baseline Name', value: unitName || '-' },
        { label: 'Year', value: currentWeek?.year || '-' },
        { label: 'Week', value: currentWeek?.week || '-' },
        { label: 'Time', value: currentWeek?.lastUpdateReport ? dayjs(currentWeek?.lastUpdateReport, 'DD-MM-YYYY').format('DD-MM-YYYY') : '-' }
    ];

    const formatValue = (value: number | undefined): string => (value !== undefined ? value?.toFixed(2).toString() : '-');

    const contentDataOne: ContentItem[] = [
        {
            value: formatValue(lastWeek?.totalHeadCount),
            title: 'Headcount*'
        },
        {
            value: formatValue(lastWeek?.totalEffort),
            title: 'Effort'
        },
        {
            value: formatValue(lastWeek?.totalBillable),
            title: 'Billable'
        },
        {
            value: formatValue(lastWeek?.totalNonBillable),
            title: 'Non-Billable'
        },
        {
            value: formatValue(lastWeek?.totalNonBillableRatio) + `${lastWeek ? '%' : ''}`,
            title: 'NBR'
        },
        {
            value: formatValue(lastWeek?.totalNonBillableRatioStar) + `${lastWeek ? '%' : ''}`,
            title: 'NBR*'
        }
    ];

    const contentDataTwo: ContentItem[] = [
        {
            value: formatValue(currentWeek?.totalHeadCount),
            title: 'Headcount*',
            label: 'HeadCount',
            tab: 'employee',
            viewHR: true,
            toolTip: `HeadCount* = Exclude BU & DC Head`
        },
        {
            value: formatValue(currentWeek?.totalEffort),
            title: 'Effort',
            label: 'Effort',
            tab: 'all',
            viewHR: true,
            toolTip: `Total Effort = sum (billable effort and backup effort).`
        },
        {
            value: (currentWeek?.totalRedeployablePercent !== undefined ? currentWeek?.totalRedeployablePercent.toFixed(2) : '-') + '%',
            title: `Redeployable (${currentWeek?.totalRedeploy})`,
            label: 'Redeployable',
            tab: 'all',
            hiddenFilter: true,
            toolTip: (
                <>
                    Redeployable = SUM(redeployable effort) <br />
                    %Redeployable = Redeployable / Total Effort
                </>
            )
        },
        {
            value: formatValue(currentWeek?.totalBillable),
            title: 'Billable',
            label: 'Billable',
            tab: 'all',
            hiddenFilter: true,
            toolTip: ` Billable = SUM(Projects' Total Billable)`
        },
        {
            value: formatValue(currentWeek?.productFactorValue),
            title: 'Productivity Factor',
            tab: 'employee',
            label: 'HeadCount',
            viewHR: true
        },
        {
            value: formatValue(currentWeek?.totalNonBillable),
            title: 'Non-Billable',
            label: 'NonBillable',
            tab: 'all',

            toolTip: `NB = Total Effort – Total Billable`
        },
        {
            value: (currentWeek?.totalCoreMemberPercent !== undefined ? currentWeek?.totalCoreMemberPercent.toFixed(2) : '-') + '%',
            title: `Core member (${currentWeek?.totalCoreMember})`,
            label: 'CoreMember',
            tab: 'all',
            hiddenFilter: true,
            toolTip: '%Coremember = #Coremember / Total Member'
        },
        {
            value: '-',
            title: 'Shared Service Billables (Man-week)',
            isSharedService: true
        },
        {
            value: currentWeek?.totalNonBillableRatioStar?.toFixed(2) + '%',
            title: 'NBR*',
            label: 'HeadCount',
            tab: 'employee',
            viewHR: true,
            toolTip: 'NBR* = (((Headcount* x Productivity Factor) – Billable) / (Headcount* x Productivity Factor)) x 100'
        },
        {
            value: currentWeek?.totalNonBillableRatio?.toFixed(2) + '%',
            title: 'NBR',
            toolTip: 'NBR (Non-billable ratio)= NB / Total Effort'
        },
        {
            value: formatValue(currentWeek?.staffGradeIndex),
            title: 'Staff Grade Index',
            label: 'StaffGradeIndex',
            toolTip: `Staff Grade Index = sum(effort x grade) / sum(effort).`
        }
    ];

    const totalUnitSharedServices = unitSharedServices?.reduce((total: number, item: any) => total + item.totalSharedServiceNumber, 0);

    const renderContentBox = (item: ContentItem, index: number) => {
        if (item.isSharedService) {
            return (
                <div key={index} className={`tab-data__content--box share-service`}>
                    <Flex justify="space-between" align="center" className="content--title">
                        <span>Shared Service Billables (Man-week)</span>
                    </Flex>
                    <div className="content--value overFlow-ellipsis" style={{ width: '100%', height: '100%' }}>
                        {unitSharedServices?.map(item => (
                            <Flex justify="space-between" key={item.unitId} className="item-share-service" gap={20}>
                                {renderWithFallback(item.unitName, true, 25)}
                                <span>{item.totalSharedServiceNumber}</span>
                            </Flex>
                        ))}
                    </div>
                    <Flex justify="space-between" align="center" className="content--title item-total-share-service">
                        <span>Total</span>
                        <span>{totalUnitSharedServices}</span>
                    </Flex>
                </div>
            );
        }

        return (
            <div key={index} className={`tab-data__content--box`}>
                <div className="content--value overFlow-ellipsis">{item.value}</div>
                <Flex align="center" justify="center" className="content--title">
                    <span
                        className={item.label ? 'underline cursor-pointer c_2a9ad6' : ''}
                        onClick={() => {
                            if (item.label === 'StaffGradeIndex') {
                                // [Incomplete] Implement opening a new tab for 'StaffGradeIndex' to display Resource Experience Reports > Staff Grade Details > Staff Grade Project
                                return;
                            } else if (item.tab) {
                                const { path: reportPath } = pathnames.groupManagement.openReportList;

                                // Base URL
                                let url = `${reportPath}/${id}?filterBy=${item.label}&tab=${item.tab}&title=${item.title}&unitName=${unitName}`;

                                // Conditionally append optional query parameters
                                if (item.hiddenFilter) {
                                    url += `&hiddenButtonFilter=${item.hiddenFilter}`;
                                }
                                if (item.viewHR) {
                                    url += `&viewHR=${item.viewHR}`;
                                }

                                // Open the URL
                                window.open(url);
                            }
                        }}
                    >
                        {item.title}
                    </span>
                </Flex>
                {item.toolTip && <BaseToolTip className="tooltip-icon" title={item.toolTip} icon={icons.infoTooltip.info_gray} />}
            </div>
        );
    };

    return (
        <>
            <div className="tab-data__content">
                <div className="tab-data__header">
                    {headerDataOne.map((item, index) => (
                        <React.Fragment key={index}>
                            <div>
                                {item.label}: <span style={{ fontWeight: 600 }}>{item.value}</span>
                            </div>
                            {index < headerDataOne.length - 1 && <BaseDivider className="divider" type="vertical" />}
                        </React.Fragment>
                    ))}
                </div>

                <Row gutter={[16, 16]}>
                    {contentDataOne.map((item, index) => {
                        const { title, value, toolTip } = item;

                        return (
                            <Col key={index} span={6}>
                                <div className="tab-data__content--box">
                                    <div className="content--value">{value}</div>
                                    <Flex align="center" justify="center" className="content--title">
                                        {title}
                                    </Flex>
                                    {toolTip && (
                                        <Tooltip title={toolTip}>
                                            <img src={icons.infoTooltip.info_gray} alt="info" className="tooltip-icon" />
                                        </Tooltip>
                                    )}
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </div>

            <div className="tab-data__content">
                <div className="tab-data__header">
                    {headerDataTwo.map((item, index) => (
                        <React.Fragment key={index}>
                            <div>
                                {item.label}: <span style={{ fontWeight: 600 }}>{item.value}</span>
                            </div>
                            {index < headerDataTwo.length - 1 && <BaseDivider className="divider" type="vertical" />}
                        </React.Fragment>
                    ))}
                </div>
                <div className="parent">
                    {contentDataTwo.map((item, index) => (
                        <div key={index} className={`div${index + 1}`}>
                            {renderContentBox(item, index)}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default HeadTabData;
