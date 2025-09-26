import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import Loading from '@/components/common/loading';
import ReportFilter from '@/components/common/report-filter';
import SpansOfControlTable from '@/components/reports/spans-of-control-report/spans-of-control-table';
import pathnames from '@/pathnames';
import UnitService from '@/services/group-management/unit';
import reportService from '@/services/reports/report';
import spanOfControlReport from '@/services/reports/span-of-control-index-report';
import { IFilterData } from '@/types/filter';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';
import { ISpanControlFilter, ISpanControlType } from '@/types/reports/report';
import { downloadFile, remapUnits } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Form } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface IBreadcrumbItemTypeCustom extends BreadcrumbItemType {
    state?: any;
}

const SpanOfControlListPage = () => {
    const [filterForm] = Form.useForm();
    const { showNotification } = useNotify();
    const location = useLocation();
    const { unitId, name, typeName } = location.state || {};

    const [filterParams, setFilterParams] = useState<ISpanControlFilter>({});
    const [loadingFilter, setLoadingFilter] = useState(true);
    const [isExportLoading, setIsExportLoading] = useState(false);
    const [spanControlTypes, setSpanControlTypes] = useState<ISpanControlType[]>([]);
    const [units, setUnits] = useState<IEmployeeUnit[]>([]);
    const breadcrumb: IBreadcrumbItemTypeCustom[] = [
        { title: pathnames.reports.main.name, path: pathnames.reports.main.path },
        {
            title: pathnames.reports.spansOfControlReport.main.name,
            path: pathnames.reports.spansOfControlReport.main.path,
            state: { tabActive: name }
        },
        { title: pathnames.reports.spansOfControlReport.spanOfControlList.name }
    ];

    const onExport = async () => {
        try {
            setIsExportLoading(true);
            const res = await spanOfControlReport.export(filterParams);
            downloadFile(res, 'SpansOfControlList.xlsx');
            showNotification(true, 'Export report successfully');
        } catch {
            showNotification(false, 'Export report failed');
        } finally {
            setIsExportLoading(false);
        }
    };

    const filterData: IFilterData[] = [
        {
            key: 'spanControlTypes',
            label: 'Span Control Type',
            forColumns: [],
            alwaysShow: true,
            control: (
                <BaseSelect
                    size="small"
                    mode="multiple"
                    options={spanControlTypes.map(item => ({ ...item, value: item.value.toString() }))}
                    placeholder="Select type"
                    searchPlaceholder="Search type"
                    isShowOptionAll
                />
            )
        },
        {
            key: 'unitIds',
            label: 'Unit',
            forColumns: [],
            alwaysShow: true,
            control: <TreeSelect multiple size="small" treeData={remapUnits(units)} placeholder="Select unit" searchPlaceholder="Search unit" />
        }
    ];

    const buttons: ButtonProps[] = [{ children: 'Export', loading: isExportLoading, onClick: onExport, type: 'primary' }];

    // Fetch filter data
    useEffect(() => {
        const fetchData = async () => {
            setLoadingFilter(true);

            const fetchFilterData = async () => {
                try {
                    const res = await reportService.getAllIndexes();
                    const { data, succeeded } = res;

                    if (succeeded) {
                        const type = data?.spanControlTypes.find(value => value.label === typeName);

                        filterForm.setFieldsValue({
                            spanControlTypes: type && [type?.value.toString()],
                            unitIds: unitId?.split(',')
                        });
                        setFilterParams({
                            spanControlTypes: type && [type?.value.toString()],
                            unitIds: unitId?.split(',')
                        });
                        setSpanControlTypes(data?.spanControlTypes || []);
                    }
                } catch (error) {
                    showNotification(false, 'Failed to fetch Control Type');
                }
            };

            const fetchUnits = async () => {
                try {
                    const res = await UnitService.getByManaged('SpanOfControlReport');
                    const { succeeded, data } = res;

                    if (succeeded) {
                        setUnits(data || []);
                    }
                } catch (error) {
                    showNotification(false, 'Failed to fetch units');
                }
            };

            try {
                await Promise.all([fetchFilterData(), fetchUnits()]);
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                setLoadingFilter(false);
            }
        };

        fetchData();
    }, [filterForm, typeName, unitId, showNotification]);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumb} />
            <ReportFilter
                pageTitle={`Report List For All ${name || 'N/A'}`}
                loading={loadingFilter}
                data={filterData}
                filterForm={filterForm}
                moreButtons={buttons}
                onFilter={setFilterParams}
                onResetFilter={() => setFilterParams({})}
            />
            {loadingFilter ? <Loading /> : <SpansOfControlTable filterParams={filterParams} unitName={name || 'N/A'} />}
        </DetailContent>
    );
};

export default SpanOfControlListPage;
