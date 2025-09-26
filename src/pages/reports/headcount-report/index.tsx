import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import pathnames from '@/pathnames';

import './index.scss';
import SubTab from '@/components/common/tab/sub-tab';
import { HeadcountSummaryReport } from '@/components/reports/headcount-report/headcount-summary';
import { HeadcountDetailsReport } from '@/components/reports/headcount-report/headcount-details';
import { SharedServiceSummaryReport } from '@/components/reports/headcount-report/shared-service-summary';
import { SharedServiceDetailsReport } from '@/components/reports/headcount-report/shared-service-details';
import { useState } from 'react';
import usePermissions from '@/utils/hook/usePermissions';

const breadcrumb = [{ title: pathnames.reports.main.name }, { title: pathnames.reports.headcountReport.main.name }];
export const HeadcountReportPage = () => {
    const { section } = usePermissions('Headcount', 'HeadcountReport');

    const [reloadSharedServiceDetails, setReloadSharedServiceDetails] = useState({});

    const tabItems = [
        { key: 'HeadcountSummaryReport', label: 'Headcount Summary Report', children: <HeadcountSummaryReport /> },
        { key: 'HeadcountDetailsReport', label: 'Headcount Details Report', children: <HeadcountDetailsReport /> },
        {
            key: 'SharedServiceSummaryReport',
            label: 'Shared Service Summary Report',
            children: <SharedServiceSummaryReport setReloadSharedServiceDetails={setReloadSharedServiceDetails} />
        },
        {
            key: 'SharedServiceDetailsReport',
            label: 'Shared Service Details Report',
            children: <SharedServiceDetailsReport reloadSharedServiceDetails={reloadSharedServiceDetails} />
        }
    ].filter(item => section.children?.some((child: any) => child.name === item.key));

    return (
        <DetailContent rootClassName="headcount-report">
            <BaseBreadcrumb dataItem={breadcrumb} />
            <h3 className="headcount-report__title">Headcount Report</h3>
            <SubTab items={tabItems} centered />
        </DetailContent>
    );
};
