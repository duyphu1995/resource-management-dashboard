import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import SubTab from '@/components/common/tab/sub-tab';
import BillableTracking from '@/components/reports/project-tracking/tab-billable-tracking';
import ProjectTracking from '@/components/reports/project-tracking/tab-project-tracking';
import pathnames from '@/pathnames';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import './index.scss';
import usePermissions from '@/utils/hook/usePermissions';

const breadcrumb: BreadcrumbItemType[] = [{ title: pathnames.reports.main.name }, { title: pathnames.reports.projectTracking.main.name }];
const ProjectTrackingPage = () => {
    const { section } = usePermissions('ProjectTracking', 'Reports');

    const tabs = [
        {
            key: 'ProjectTrackingList',
            label: 'Project Tracking',
            children: <ProjectTracking />
        },
        {
            key: 'BillableTrackingList',
            label: 'Billable Tracking',
            children: <BillableTracking />
        }
    ].filter(item => section?.children?.some((child: any) => child.name === item.key));

    return (
        <DetailContent rootClassName="project-tracking">
            <BaseBreadcrumb dataItem={breadcrumb} />
            <SubTab items={tabs} defaultActiveKey={section?.children[0]?.name} />
        </DetailContent>
    );
};

export default ProjectTrackingPage;
