import DialogDefault from '@/components/common/dialog/default';
import BaseDivider from '@/components/common/divider';
import BaseTable from '@/components/common/table/table';
import { Button, TableColumnType } from 'antd';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import { IKpiReports } from '@/types/reports/kpi';
import dayjs from 'dayjs';
import './dialog-kpi-report.scss';
import { ORG_UNITS } from '@/utils/constants';

interface DialogKpiReport {
    open: boolean;
    onClose: () => void;
    detailWeekModal?: IKpiReports;
}

const DialogKpiReport = ({ open, onClose, detailWeekModal }: DialogKpiReport) => {
    const { kpiReportInformation = [], weekNumber = 0, year = 0 } = detailWeekModal || {};

    const columns: TableColumnType<any>[] = [
        {
            dataIndex: 'badgeId',
            key: 'badgeId',
            title: 'Badge ID',
            width: 100,
            fixed: 'left',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fullName',
            key: 'fullName',
            title: 'Name',
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: ORG_UNITS.DC,
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: ORG_UNITS.DG,
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'applyDate',
            key: 'applyDate',
            title: 'Apply Date',
            width: 150,
            render: item => renderWithFallback(dayjs(item).format('MMM DD, YYYY'))
        },
        {
            dataIndex: 'resignDate',
            key: 'resignDate',
            title: 'Resign Date',
            width: 150,
            render: item => renderWithFallback(dayjs(item).format('MMM DD, YYYY'))
        }
    ];

    const renderReportContent = () => (
        <div className="dialog">
            <div className="dialog-title">
                <h3>
                    Attrition report of week {weekNumber < 10 ? `0${weekNumber}` : weekNumber} in {year}
                </h3>
                <span>Total attrition: {kpiReportInformation.length}</span>
            </div>
            <BaseDivider margin="16px 0" />
            <div className="dialog-content">
                <BaseTable
                    dataSource={kpiReportInformation.map(item => ({ ...item, key: item.badgeId }))}
                    style={{ marginTop: 12 }}
                    columns={columns}
                    pagination={false}
                />
            </div>
            <BaseDivider margin="16px 0" />
            <div className="dialog-button">
                <Button onClick={onClose}>Close</Button>
            </div>
        </div>
    );

    const renderEmptyContent = () => (
        <div className="dialog-empty">
            <div className="dialog-title">
                <h3>
                    Attrition report of week {weekNumber < 10 ? `0${weekNumber}` : weekNumber} in {year}
                </h3>
            </div>
            <BaseDivider margin="16px 0" />
            <div className="dialog-content">
                <img src="/media/icons/box-empty.svg" alt="No data" />
                <span>No attrition data for this week.</span>
            </div>
            <BaseDivider margin="16px 0" />
            <div className="dialog-button">
                <Button onClick={onClose}>Close</Button>
            </div>
        </div>
    );

    return (
        <DialogDefault
            title=""
            isShow={open}
            onCancel={onClose}
            content={kpiReportInformation.length ? renderReportContent() : renderEmptyContent()}
            footer={null}
            className={kpiReportInformation.length ? 'dialog' : 'dialog-empty'}
        />
    );
};

export default DialogKpiReport;
