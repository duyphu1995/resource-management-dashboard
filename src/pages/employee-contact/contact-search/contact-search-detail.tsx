import Avatar from '@/components/common/avatar';
import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import pathnames from '@/pathnames';
import contactSearchService from '@/services/employee-contact/contact-search';
import { IField } from '@/types/common';
import { IContactSearchDetail, IContactSearchManagedUnit, IContactSearchProject } from '@/types/employee-contact/contact-search';
import { formatDataTable } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { Flex, Spin } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const ContactSearchDetailPage = () => {
    const navigation = useNavigate();
    const { showNotification } = useNotify();
    const { employeeId = '0' } = useParams();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { fieldsForSensitiveData } = usePermissions('ContactSearchDetails', 'ContactSearch');

    const [data, setData] = useState<IContactSearchDetail | null>(null);

    const pageTitle = pathnames.employeeContact.contactSearch.detail.name;

    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.employeeContact.main.name },
        {
            title: pathnames.employeeContact.contactSearch.main.name,
            path: pathnames.employeeContact.contactSearch.main.path
        },
        {
            title: pageTitle
        }
    ];
    const primaryColor = '#2a9ad6';

    const goBack = () => {
        navigation(pathnames.employeeContact.contactSearch.main.path);
    };

    // Fetch detail
    useEffect(() => {
        const fetchDetail = async () => {
            turnOnLoading();
            try {
                const res = await contactSearchService.getDetail(parseInt(employeeId));
                const { succeeded = false, data = null } = res;

                if (succeeded && data) setData(data);
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                turnOffLoading();
            }
        };

        fetchDetail();
    }, [employeeId, navigation, turnOnLoading, turnOffLoading, showNotification]);

    const isSensitive = fieldsForSensitiveData?.includes('mobilePhone');

    const detailFields: IField[] = [
        {
            label: 'Full Name',
            value: renderWithFallback(data?.fullName),
            colSpan: 8
        },
        {
            label: 'Badge ID',
            value: renderWithFallback(data?.badgeId),
            colSpan: 8
        },
        {
            label: 'Gender',
            value: renderWithFallback(data?.genderName),
            colSpan: 8
        },
        {
            label: 'Email',
            value: data?.workEmail ? (
                <a href={`mailto:${data.workEmail}`} className="underline" style={{ display: 'inline', color: primaryColor }}>
                    {data.workEmail}
                </a>
            ) : (
                <div>-</div>
            ),
            colSpan: 8
        },
        {
            label: 'Mobile',
            value: renderWithFallback(isSensitive ? '**********' : data?.mobilePhone),
            colSpan: 8
        },
        {
            label: 'Ext',
            value: renderWithFallback(data?.workPhone),
            colSpan: 8
        },
        {
            label: 'Working Lab',
            value: renderWithFallback(data?.buildingName),
            colSpan: 8
        }
    ];

    const renderWorkingProjectColumn = (unitId: number, unitName: string, isMainProject: boolean, email: string) => {
        const mainProjectJSX = isMainProject && <b> (Main Project)</b>;
        const unitJSX = (
            <Link
                to={pathnames.groupManagement.main.path + '/' + unitId}
                style={{ display: 'inline', color: primaryColor }}
                className="underline"
                target="_blank"
            >
                {unitName} {mainProjectJSX}
            </Link>
        );
        const emailJSX = (
            <a href={`mailto:${email}`} className="underline" style={{ display: 'inline', color: primaryColor }}>
                {email}
            </a>
        );
        const unitContentJSX = (
            <div>
                <div>{unitId && unitName ? unitJSX : '-'}</div>
                <div>
                    <b>Managed: </b>
                    {email ? emailJSX : <span>-</span>}
                </div>
            </div>
        );

        return !unitId && !unitName && !email ? '-' : unitContentJSX;
    };

    const workingProjectColumns: ColumnType<IContactSearchProject>[] = [
        {
            title: 'No.',
            width: 100,
            render: (_value: any, _record: IContactSearchProject, index: number) => index + 1
        },
        {
            title: ORG_UNITS.Project,
            width: 220,
            render: (record: IContactSearchProject) =>
                renderWorkingProjectColumn(record.projectId, record.projectName, record.isMainProject, record.projectManagerEmail)
        },
        {
            title: ORG_UNITS.Program,
            width: 220,
            render: (record: IContactSearchProject) =>
                renderWorkingProjectColumn(record.programId, record.programName, false, record.programManagerEmail)
        },
        {
            title: ORG_UNITS.DC,
            width: 220,
            render: (record: IContactSearchProject) => renderWorkingProjectColumn(record.dcId, record.dcName, false, record.dcManagerEmail)
        },
        {
            title: ORG_UNITS.DG,
            width: 220,
            render: (record: IContactSearchProject) => renderWorkingProjectColumn(record.dgId, record.dgName, false, record.dgManagerEmail)
        }
    ];

    const managedUnitColumns: ColumnType<IContactSearchManagedUnit>[] = [
        {
            title: 'Unit',
            width: 220,
            render: (record: IContactSearchManagedUnit) => {
                const unitName = renderWithFallback(record.unitName);
                const unitJSX = (
                    <Link
                        to={record.unitId ? pathnames.groupManagement.main.path + '/' + record.unitId : ''}
                        className="underline"
                        style={{ color: primaryColor }}
                        target="_blank"
                    >
                        {unitName}
                    </Link>
                );

                return record.unitId && unitName ? unitJSX : '-';
            }
        },
        {
            title: 'Type',
            width: 100,
            render: (record: IContactSearchManagedUnit) => renderWithFallback(record.unitTypeName)
        },
        {
            title: 'Direct Manager',
            width: 400,
            render: (record: IContactSearchManagedUnit) => {
                const directMangerJSX = (
                    <div>
                        {renderWithFallback(record.managerName)}
                        {record.managerEmail && (
                            <span>
                                &nbsp;
                                <a href={'mailto:' + record.managerEmail} className="underline" style={{ display: 'inline', color: primaryColor }}>
                                    ({record.managerEmail})
                                </a>
                            </span>
                        )}
                    </div>
                );

                return !record.managerName && !record.managerEmail ? '-' : directMangerJSX;
            }
        }
    ];

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <BaseBreadcrumb dataItem={breadcrumb} />
                <DetailHeader pageTitle={pageTitle} goBack={goBack} />

                {/* GENERAL INFO */}
                <DetailInfo title="General Info">
                    <Flex gap={'24px'}>
                        <div style={{ flex: 1 }}>
                            <DetailFields data={detailFields} />
                        </div>
                        <Avatar size={200} shape="square" src={data?.employeeImageUrl} />
                    </Flex>
                </DetailInfo>

                <div style={{ marginTop: 24 }}></div>

                {/* TABLES */}
                <DetailInfo title="Employee More Information">
                    {data?.projectDtos && data?.projectDtos.length > 0 && (
                        <TableHaveAdd title="Working Project" columns={workingProjectColumns} dataSource={formatDataTable(data.projectDtos)} />
                    )}
                    {data?.managerUnitDtos && data?.managerUnitDtos.length > 0 && (
                        <TableHaveAdd title="Managed Unit(s)" columns={managedUnitColumns} dataSource={formatDataTable(data.managerUnitDtos)} />
                    )}
                </DetailInfo>
            </Spin>
        </DetailContent>
    );
};

export default ContactSearchDetailPage;
