import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailInfo from '@/components/common/detail-management/detail-info';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import SubTab from '@/components/common/tab/sub-tab';
import Billable from '@/components/reports/effort-allocation-report/billable';
import NonBillable from '@/components/reports/effort-allocation-report/non-billable';
import TotalEffort from '@/components/reports/effort-allocation-report/total-effort';
import pathnames from '@/pathnames';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';
import { downloadFile, findInTree, handleClickViewListOfNewWindow, remapUnits } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import { Button, Checkbox, Form } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import './index.scss';
import { IFormValuesEmployeeList, IPayloadExport } from '@/types/reports/effort-allocation';
import effortAllocationReportServices from '@/services/reports/effort-allocation-report';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import UnitService from '@/services/group-management/unit';

const EffortAllocationReportPage = () => {
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { turnOnLoading, turnOffLoading } = useLoading();

    const breadcrumb: BreadcrumbItemType[] = [{ title: pathnames.reports.main.name }, { title: pathnames.reports.effortAllocationReport.main.name }];
    const pageTitle = pathnames.reports.effortAllocationReport.main.name;

    const [units, setUnits] = useState<IEmployeeUnit[]>([]);
    const [payloadExport, setPayloadExport] = useState<IPayloadExport>({
        filterBy: 'Effort',
        sortedBy: 'badgeId'
    });
    const [isLoadingExport, setIsLoadingExport] = useState(false);

    const { havePermission } = usePermissions('EffortAllocationList', 'EffortAllocationReport');

    const handleViewReport = (values: IFormValuesEmployeeList) => {
        const { unitId, filterBy, includeContractor } = values;

        const matchedUnit = findInTree(units, unit => unit?.unitId?.toString() === unitId?.toString());

        const queryParams = {
            unitName: matchedUnit?.unitName ? encodeURIComponent(matchedUnit.unitName) : undefined,
            filterBy: filterBy ? encodeURIComponent(filterBy) : undefined,
            excludeContractor: !includeContractor ? 'true' : undefined
        };

        const filteredQueryParams = Object.entries(queryParams)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        const fullPath = `${pathnames.reports.effortAllocationReport.effortAllocationReportList.path}/${unitId}${filteredQueryParams ? `?${filteredQueryParams}` : ''}`;

        handleClickViewListOfNewWindow(fullPath);
    };

    const reportTypeOptions = [
        {
            label: 'All Employees',
            value: 'All'
        },
        {
            label: 'Billable Employees',
            value: 'Billable'
        },
        {
            label: 'Backup Employees',
            value: 'NonBillable'
        },
        {
            label: 'Redeployable Employees',
            value: 'Redeployable'
        }
    ];

    const mappingUnits: any = (units: any = []) => {
        const unitOptions = remapUnits(units);

        return [{ label: 'TMA Solutions', value: 'all-units', children: unitOptions }];
    };

    // Fetch unit data
    useEffect(() => {
        const fetchUnitsData = async () => {
            turnOnLoading();
            try {
                const res = await UnitService.getByManaged('EffortLocationReport');
                const { data, succeeded } = res;

                if (succeeded) {
                    setUnits(data || []);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch units');
            } finally {
                turnOffLoading();
            }
        };
        fetchUnitsData();
    }, [turnOnLoading, turnOffLoading, showNotification]);

    const tabs = [
        {
            key: 'Effort',
            label: 'Total Effort',
            children: <TotalEffort setPayloadExport={setPayloadExport} />
        },
        {
            key: 'Billable',
            label: 'Billable',
            children: <Billable setPayloadExport={setPayloadExport} />
        },
        {
            key: 'NonBillable',
            label: 'Non-Billable',
            children: <NonBillable setPayloadExport={setPayloadExport} />
        }
    ];

    const handleOnchangeTab = (key: string) => {
        setPayloadExport(prev => ({ ...prev, filterBy: key }));
    };

    const handleExportEffortAllocationReport = async () => {
        setIsLoadingExport(true);
        try {
            const response = await effortAllocationReportServices.exportEffortLocation(payloadExport);
            downloadFile(response, 'EmployeeEffortAllocationReport.xlsx');
            showNotification(true, 'Export successful');
        } catch (error) {
            showNotification(false, 'Export failed. Please try again later');
        } finally {
            setIsLoadingExport(false);
        }
    };

    const renderTitleEffortAllocationReport = (
        <div className="employee-effort-allocation-report__title">
            Employee Effort Allocation Report
            {havePermission('Export') ? (
                <Button type="default" onClick={handleExportEffortAllocationReport} loading={isLoadingExport} className="export-btn">
                    Export
                </Button>
            ) : null}
        </div>
    );

    return (
        <DetailContent>
            <div className="effort-allocation-report-container">
                <BaseBreadcrumb dataItem={breadcrumb} />
                <div className="page-title">{pageTitle}</div>
                <div className="generate-employee-list-report">
                    <DetailInfo title="Generate Employee List Report">
                        <Form form={form} onFinish={handleViewReport} className="employee-list-report-form">
                            <div className="employee-list-report-form__controller">
                                <Form.Item label="Unit" name="unitId" initialValue="all-units">
                                    <TreeSelect treeData={mappingUnits(units)} allowClear={false} searchPlaceholder="Search unit" />
                                </Form.Item>
                                <Form.Item label="Report Type" name="filterBy" initialValue="All">
                                    <BaseSelect allowClear={false} options={reportTypeOptions} />
                                </Form.Item>
                                <Form.Item name="includeContractor" valuePropName="checked">
                                    <Checkbox>Including Contractor</Checkbox>
                                </Form.Item>
                            </div>
                            <Button htmlType="submit" type="default">
                                View Report
                            </Button>
                        </Form>
                    </DetailInfo>
                </div>
                <div className="employee-effort-allocation-report">
                    <DetailInfo title={renderTitleEffortAllocationReport}>
                        <SubTab items={tabs} onChange={handleOnchangeTab} />
                    </DetailInfo>
                </div>
            </div>
        </DetailContent>
    );
};

export default EffortAllocationReportPage;
