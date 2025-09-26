import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import employeeSummaryService from '@/services/reports/employee-summary';
import { IParamsList, ITabEmployeeSummary, ITabEmployeeSummaryProps } from '@/types/reports/employee-summary';
import { formatDataTable, handleClickViewListOfNewWindow, sumTotalEmployees } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';

const GenderSummary = (props: ITabEmployeeSummaryProps) => {
    const { tab, currentTab } = props;

    const moduleName = props.moduleName + 'Short';
    const moduleNameDetails = props.moduleName + 'ShortDetails';

    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { section } = usePermissions(moduleNameDetails, 'EmployeeSummary');

    const [dataList, setDataList] = useState<ITabEmployeeSummary[]>([]);

    const isContractor = currentTab === 'ContractorSummary';
    const titleTotal = isContractor ? 'Contractor' : 'Employee';

    const genderColumns: ColumnType<ITabEmployeeSummary>[] = [
        {
            dataIndex: 'genderName',
            key: 'genderName',
            title: 'Gender',
            width: '50%',
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'totalEmployee',
            key: 'totalEmployee',
            title: isContractor ? 'Number of Contractor' : '# Of Employee',
            width: '50%',
            align: 'center',
            onCell: () => ({
                className: 'align-center'
            }),
            render: (item, record) => {
                return section ? (
                    <a
                        className="underline"
                        onClick={() =>
                            handleClickViewListOfNewWindow(
                                pathnames.reports.employeeSummaryReport.genderDetails.path +
                                    '/' +
                                    record.genderId +
                                    `?genderName=${record.genderName}&tab=${tab}&moduleName=${moduleNameDetails}`
                            )
                        }
                    >
                        {renderWithFallback(item)}
                    </a>
                ) : (
                    renderWithFallback(item)
                );
            }
        }
    ];

    useEffect(() => {
        const fetchDataList = async (params: IParamsList) => {
            turnOnLoading();
            try {
                const res = await employeeSummaryService.getGenderList(params, moduleName);
                const { succeeded, data } = res;

                if (succeeded && data) {
                    setDataList(data);
                }
            } catch (error) {
                showNotification(false, 'Error fetching get gender list');
            } finally {
                turnOffLoading();
            }
        };

        if (tab === currentTab) {
            if (tab.startsWith('CompanySummary')) {
                const companyId = tab.split('-')[1];
                fetchDataList({ companyId: parseInt(companyId) });
                return;
            }
            fetchDataList({ tabType: tab });
        }
    }, [tab, currentTab, moduleName, turnOnLoading, turnOffLoading, showNotification]);

    return (
        <div className="title-header-table">
            <h3 className="title">
                Short Summary (Total {titleTotal}: {sumTotalEmployees(dataList)})
            </h3>
            <BaseTable
                columns={genderColumns}
                dataSource={formatDataTable(dataList)}
                loading={isLoading}
                scroll={{ x: 1200, y: 400 }}
                pagination={false}
                bordered
                className="table-virtual"
                virtual
            />
        </div>
    );
};

export default GenderSummary;
