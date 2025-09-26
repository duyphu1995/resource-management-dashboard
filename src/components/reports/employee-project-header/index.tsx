import { IOverviewItem } from '@/types/reports/monthly-delivery-statistic-report';
import { Button, Col, Dropdown, MenuProps, Row } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import './index.scss';

import useLoading from '@/utils/hook/useLoading';
import employeeProjectService from '@/services/reports/employee-project';
import { downloadFile } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';

export interface IEmployeeProjectItemsProps {
    items: IOverviewItem[];
}

const menuItems: MenuProps['items'] = [
    { label: 'Export To Excel', key: 'xlsx' },
    { label: 'Export To CSV', key: 'csv' }
];

const EmployeeProjectHeader = ({ items }: IEmployeeProjectItemsProps) => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { havePermission } = usePermissions('EmployeeProjectList', 'EmployeeProject');

    const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
        turnOnLoading();
        try {
            const response = await employeeProjectService[key === 'xlsx' ? 'exportExcel' : 'exportCSV']();
            downloadFile(response, `EmployeeProjectReport.${key}`);
            showNotification(true, 'Export report successfully');
        } catch {
            showNotification(false, 'Export report failed');
        } finally {
            turnOffLoading();
        }
    };

    return (
        <Row className="employee-project-header">
            <div className="header-total">
                {items.map((item, index) => (
                    <Col span={6} key={index}>
                        <div className="header-total__item">
                            <div className="value">{item.value}</div>
                            <div className="label">{item.label}</div>
                        </div>
                    </Col>
                ))}
            </div>
            <div className="header-btn">
                {havePermission('Export') &&
                    <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} placement="bottomRight">
                        <Button size="large" loading={isLoading} className="export-btn">
                            Export
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                }
            </div>
        </Row>
    );
};

export default EmployeeProjectHeader;
