import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import TreeSelect from '@/components/common/form/tree-select';
import ReportFilter from '@/components/common/report-filter';
import SharedServiceBillablePlanTable from '@/components/resource-plan/shared-service-billable-plan/table';
import pathnames from '@/pathnames';
import sharedServiceBillablePlanServices from '@/services/resource-plan/shared-service-billable-plan';
import { IFilterData } from '@/types/filter';
import { ISharedServiceBillableAllIndex } from '@/types/resource-plan/shared-service-billable-plan/shared-service-billable-plan';
import { remapUnits } from '@/utils/common';
import usePermissions from '@/utils/hook/usePermissions';
import { ButtonProps, Form } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface IFilterValues {
    sharedServiceId: number | undefined;
    unitWorkingId: number | undefined;
}

const SharedServiceBillablePlanPage = () => {
    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.resourcePlan.main.name },
        { title: pathnames.resourcePlan.sharedServiceBillablePlan.main.name }
    ];
    const [loadingFilter, setLoadingFilter] = useState(false);
    const [filterForm] = Form.useForm();
    const [units, setUnits] = useState<ISharedServiceBillableAllIndex>();
    const [filterValues, setFilterValues] = useState<IFilterValues>();
    const navigation = useNavigate();

    const { havePermission } = usePermissions('SharedServiceBillablePlanList', 'SharedServiceBillablePlan');

    const currentYear = dayjs().year();
    const pageTitle = 'Shared Service Billable Plan ' + currentYear;

    const mappingSharedServiceUnits: any = (units: any = []) => {
        return units.map((unit: any) => ({
            label: unit.unitName,
            value: unit.unitId,
            children: unit?.children ? remapUnits(unit?.children) : undefined
        }));
    };

    const mappingWorkingUnits: any = (units: any = []) => {
        return units.map((unit: any) => ({
            label: unit.value,
            value: unit.id,
            children: unit?.children ? remapUnits(unit?.children) : undefined
        }));
    };

    const filterData: IFilterData[] = [
        {
            key: 'sharedServiceId',
            label: 'Shared Service Name',
            forColumns: [],
            alwaysShow: true,
            control: (
                <TreeSelect
                    size="small"
                    treeData={mappingSharedServiceUnits(units?.sharedServices)}
                    defaultValue={units?.sharedServices[0]?.unitName}
                    allowClear={false}
                />
            )
        },
        {
            key: 'unitWorkingId',
            label: 'Unit Working',
            forColumns: [],
            alwaysShow: true,
            control: (
                <TreeSelect
                    size="small"
                    treeData={mappingWorkingUnits(units?.workingUnits)}
                    defaultValue={units?.workingUnits[0]?.value}
                    isSortTreeData={false}
                    allowClear={false}
                />
            )
        }
    ];

    const buttons: ButtonProps[] = [
        havePermission('Add') && {
            type: 'primary',
            onClick: () => navigation(`${pathnames.resourcePlan.sharedServiceBillablePlan.add.path}/${filterValues?.sharedServiceId}`),
            children: 'Add',
            disabled: !filterValues?.sharedServiceId
        }
    ].filter(Boolean);

    // Fetch filter data
    useEffect(() => {
        const fetchFilterData = async () => {
            setLoadingFilter(true);
            const res = await sharedServiceBillablePlanServices.getAllIndexes();
            const { data } = res;
            setUnits(data);
            setFilterValues({
                sharedServiceId: data?.sharedServices[0]?.unitId,
                unitWorkingId: data?.workingUnits[0]?.id
            });
            setLoadingFilter(false);
        };
        fetchFilterData();
    }, []);

    // Handle reset filter
    const onResetFilter = () => {
        setLoadingFilter(true);
        filterForm.resetFields();
        setLoadingFilter(false);
        setFilterValues({
            sharedServiceId: units?.sharedServices[0]?.unitId,
            unitWorkingId: units?.workingUnits[0]?.id
        });
    };

    // Handle filter
    const onFilter = (value: IFilterValues) => {
        setFilterValues({
            ...filterValues,
            ...value
        });
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
            <SharedServiceBillablePlanTable filterValues={filterValues} buttons={buttons} loadingFilter={loadingFilter} />
        </DetailContent>
    );
};

export default SharedServiceBillablePlanPage;
