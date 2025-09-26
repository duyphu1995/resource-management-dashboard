import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import TreeSelect from '@/components/common/form/tree-select';
import Loading from '@/components/common/loading';
import ReportFilter from '@/components/common/report-filter';
import ResourceProjectionChart from '@/components/resource-plan/resource-projection/chart';
import ResourceProjectionTable from '@/components/resource-plan/resource-projection/table';
import pathnames from '@/pathnames';
import reportService from '@/services/reports/report';
import { IFilterData } from '@/types/filter';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';
import { remapUnits } from '@/utils/common';
import { findUnitId } from '@/utils/tree-utils';
import { Form } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const ResourceProjectionPage = () => {
    const [filterForm] = Form.useForm();

    const currentYear = dayjs().year();

    const [reloadAPI, setReloadAPI] = useState({});
    const [units, setUnits] = useState<IEmployeeUnit[]>([]);
    const [currentUnit, setCurrentUnit] = useState<IEmployeeUnit>();
    const [loadingFilter, setLoadingFilter] = useState(false);
    const [unitTypeName, setUnitTypeName] = useState<string>();

    const pageTitle = pathnames.resourcePlan.resourceProjection.main.name;

    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.resourcePlan.main.name },
        { title: pathnames.resourcePlan.resourceProjection.main.name }
    ];
    const tableTitle = `${currentUnit?.unitName} - Resource Projection`;
    const chartTitle = `${currentUnit?.unitName} - Resource Projection In ${currentYear}`;

    const mappingUnits: any = (units: any = []) => {
        return units.map((unit: any) => ({
            label: unit.unitName,
            value: unit.unitId.toString(),
            children: unit?.children ? remapUnits(unit?.children) : undefined
        }));
    };
    const filterData: IFilterData[] = [
        {
            key: 'unitIds',
            label: 'Unit',
            forColumns: [],
            alwaysShow: true,
            control: <TreeSelect size="small" treeData={mappingUnits(units)} placeholder="Select unit" searchPlaceholder="Search unit" />
        }
    ];

    // Fetch filter data
    useEffect(() => {
        const fetchFilterData = async () => {
            setLoadingFilter(true);
            const res = await reportService.getAllIndexes();
            const { data } = res;
            const resourceUnits = data?.resourceUnits;
            setUnits(resourceUnits || []);
            if (resourceUnits && resourceUnits?.length > 0) {
                setCurrentUnit(resourceUnits[0]);
                filterForm.setFieldsValue({ unitIds: resourceUnits[0].unitId });
            }
            setLoadingFilter(false);
        };
        fetchFilterData();
    }, [filterForm]);

    // Handle filter
    const onFilter = (value: any) => {
        const unit = findUnitId(value.unitIds, units);
        if (unit) {
            setUnitTypeName(unit.unitTypeName);
            setCurrentUnit(unit);
        }
    };

    // Handle reset filter
    const onResetFilter = () => {
        setLoadingFilter(true);
        filterForm.resetFields();
        setCurrentUnit(units[0]);
        filterForm.setFieldsValue({ unitIds: units[0].unitId });
        setLoadingFilter(false);
    };

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumb} />
            <ReportFilter
                pageTitle={pageTitle}
                loading={loadingFilter}
                data={filterData}
                filterForm={filterForm}
                onResetFilter={onResetFilter}
                onFilter={onFilter}
            />
            {currentUnit ? (
                <>
                    <ResourceProjectionTable
                        title={tableTitle}
                        unitId={currentUnit.unitId}
                        currentUnit={currentUnit}
                        unitTypeName={unitTypeName}
                        setReloadAPIChart={setReloadAPI}
                    />
                    <ResourceProjectionChart title={chartTitle} unitId={currentUnit.unitId} reloadAPI={reloadAPI} />
                </>
            ) : (
                <Loading />
            )}
        </DetailContent>
    );
};

export default ResourceProjectionPage;
