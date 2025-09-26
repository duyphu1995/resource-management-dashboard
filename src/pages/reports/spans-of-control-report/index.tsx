import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import SubTab from '@/components/common/tab/sub-tab';
import TabDelivery from '@/components/reports/spans-of-control-report/tab-delivery';
import TabDepartment from '@/components/reports/spans-of-control-report/tab-department';
import pathnames from '@/pathnames';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useLocation } from 'react-router-dom';

const SpansOfControlReport = () => {
    const location = useLocation() || {};
    const { state } = location;

    const breadcrumb: BreadcrumbItemType[] = [{ title: pathnames.reports.main.name }, { title: pathnames.reports.spansOfControlReport.main.name }];
    const pageTitle = pathnames.reports.spansOfControlReport.main.name;
    const tabs = [
        {
            key: 'Delivery',
            label: 'Delivery',
            children: <TabDelivery />
        },
        {
            key: 'Department',
            label: 'Department',
            children: <TabDepartment />
        }
    ];

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumb} />
            <DetailHeader pageTitle={pageTitle} />
            <SubTab items={tabs} defaultActiveKey={state?.tabActive || 'Delivery'} />
        </DetailContent>
    );
};

export default SpansOfControlReport;
