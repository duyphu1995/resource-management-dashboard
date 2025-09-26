import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import ReportFilter from '@/components/common/report-filter';
import SubTab from '@/components/common/tab/sub-tab';
import EmployeeList from '@/components/reports/external-certificate-report/employee-list';
import ReportStatistic from '@/components/reports/external-certificate-report/report-statistic';
import ReportSummary from '@/components/reports/external-certificate-report/report-summary';
import pathnames from '@/pathnames';
import externalCertificateReportService from '@/services/reports/external-certificate';
import reportService from '@/services/reports/report';
import { IFilterData } from '@/types/filter';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';
import { IReportCertificate } from '@/types/reports/report';
import { downloadFile, remapUnits } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Checkbox, Form } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import './index.scss';
import usePermissions from '@/utils/hook/usePermissions';
import { IExternalCertificateSummaryReport } from '@/types/reports/external-certificate';
import UnitService from '@/services/group-management/unit';

export interface IReportTabProps {
    searchParams: any;
    keyTabActive: string;
    handleFilterUnit?: (record: IExternalCertificateSummaryReport) => void;
}

const ExternalCertificateReportPage = () => {
    const { showNotification } = useNotify();
    const { havePermission } = usePermissions('ExternalCertificateReportList', 'ExternalCertificateReport');

    const [isExportLoading, setIsExportLoading] = useState(false);
    const [searchParams, setSearchParams] = useState<any>({});
    const [loadingFilter, setLoadingFilter] = useState(true);
    const [units, setUnits] = useState<IEmployeeUnit[]>([]);
    const [certificates, setCertificates] = useState<IReportCertificate[]>([]);
    const [keyTabActive, setKeyTabActive] = useState('reportSummary');
    const [showFilter, setShowFilter] = useState(false);

    const [filterForm] = Form.useForm();
    const isNoIssued = Form.useWatch('isNoIssued', filterForm);
    const isNoExpired = Form.useWatch('isNoExpired', filterForm);

    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.reports.main.name },
        { title: pathnames.reports.externalCertificateReport.main.name }
    ];

    const onExport = async () => {
        try {
            setIsExportLoading(true);
            const res = await externalCertificateReportService.export(searchParams);
            downloadFile(res, 'External Certificate Report.xlsx');
            showNotification(true, 'Export report successfully');
        } catch {
            showNotification(false, 'Export report failed');
        } finally {
            setIsExportLoading(false);
        }
    };

    const buttons: ButtonProps[] = havePermission('Export') && [{ children: 'Export', loading: isExportLoading, onClick: onExport, type: 'primary' }];

    const filterData: IFilterData[] = [
        {
            key: 'unitIds',
            label: 'Unit',
            forColumns: [],
            alwaysShow: true,
            control: <TreeSelect multiple size="small" treeData={remapUnits(units)} placeholder="Select unit" searchPlaceholder="Search unit" />
        },
        {
            key: 'certificateCatIds',
            label: 'Certificate',
            forColumns: [],
            alwaysShow: true,
            control: (
                <BaseSelect
                    size="small"
                    mode="multiple"
                    options={certificates.map(item => ({ value: item.certificateCatId.toString(), label: item.certificateCatName }))}
                    placeholder="Select certificate"
                    searchPlaceholder="Search certificate"
                />
            )
        },
        {
            key: 'expiredDate',
            label: 'Expired Date',
            forColumns: [],
            alwaysShow: true,
            colSpan: 12,
            control: <FilterDateRange fromName="fromExpiredDate" toName="toExpiredDate" disabled={isNoExpired} />
        },
        {
            key: 'issuedDate',
            label: 'Issued Date',
            forColumns: [],
            alwaysShow: true,
            colSpan: 12,
            control: <FilterDateRange fromName="fromIssuedDate" toName="toIssuedDate" disabled={isNoIssued} />
        },
        {
            key: 'isNoExpired',
            label: 'No Expired',
            forColumns: [],
            alwaysShow: true,
            colSpan: 6,
            control: <Checkbox />,
            valuePropName: 'checked'
        },
        {
            key: 'isNoIssued',
            label: 'No Issued',
            forColumns: [],
            alwaysShow: true,
            colSpan: 6,
            control: <Checkbox />,
            valuePropName: 'checked'
        }
    ];

    const handleFilterUnit = (record: IExternalCertificateSummaryReport) => {
        const valueControlChange = {
            unitIds: record?.dgId ? [String(record.dgId)] : [],
            certificateCatIds: record?.certificateTypeIds ? record.certificateTypeIds.split(',') : []
        };

        filterForm.setFieldsValue(valueControlChange);
        setSearchParams({ ...searchParams, ...valueControlChange });
        setShowFilter(true);
    };

    const tabs = [
        {
            key: 'reportSummary',
            label: 'Report - Summary',
            children: <ReportSummary searchParams={searchParams} keyTabActive={keyTabActive} handleFilterUnit={handleFilterUnit} />
        },
        {
            key: 'reportStatistic',
            label: 'Report - Statistic',
            children: <ReportStatistic searchParams={searchParams} keyTabActive={keyTabActive} />
        },
        {
            key: 'employeeList',
            label: 'Employee List',
            children: <EmployeeList searchParams={searchParams} keyTabActive={keyTabActive} />
        }
    ];

    useEffect(() => {
        const fetchUnits = async () => {
            setLoadingFilter(true);
            try {
                const res = await UnitService.getByManaged('ExternalCertificateReport');
                const { data, succeeded } = res;
                if (succeeded) {
                    setUnits(data || []);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch the unit list');
            } finally {
                setLoadingFilter(false);
            }
        };

        const fetchFilterData = async () => {
            setLoadingFilter(true);
            try {
                const res = await reportService.getAllIndexes();
                const { data, succeeded } = res;
                if (succeeded) {
                    setCertificates(data?.certificates || []);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch filter data');
            } finally {
                setLoadingFilter(false);
            }
        };

        fetchUnits();
        fetchFilterData();
    }, [showNotification]);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumb} />
            <ReportFilter
                pageTitle="External Certificate Report"
                loading={loadingFilter}
                data={filterData}
                moreButtons={buttons}
                onFilter={setSearchParams}
                onResetFilter={() => setSearchParams({})}
                filterForm={filterForm}
                showFilter={showFilter}
            />
            <SubTab items={tabs} onChangeTabs={key => setKeyTabActive(key)} />
        </DetailContent>
    );
};

export default ExternalCertificateReportPage;
