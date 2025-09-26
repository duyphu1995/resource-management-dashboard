import DetailFields from '@/components/common/detail-management/detail-fields';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import documentService from '@/services/hr-management/document-management';
import { IField, IFieldValueForm, IRenderItemForm, IRenderItemFormValidate, ITableHaveActionAddProps } from '@/types/common';
import { IDocumentList, IDocumentType } from '@/types/hr-management/document-management';
import { IInfoSection } from '@/types/hr-management/onsite-management';
import { formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Checkbox } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DocumentInfo from '../document-info';
import './index.scss';
import usePermissions from '@/utils/hook/usePermissions';

const TabDocumentDetail = (props: ITableHaveActionAddProps<any>) => {
    const { isReload } = props;

    const { showNotification } = useNotify();
    const navigation = useNavigate();
    const { id } = useParams();

    const [data, setData] = useState<IDocumentList>();

    const { havePermission } = usePermissions('DocumentDetails', 'DocumentManagement');


    const dataEmployeeInfo: IRenderItemForm[] = [
        {
            label: 'Full Name',
            value: `${data?.fullName || '-'}`
        },
        {
            label: 'Badge ID',
            value: `${data?.badgeId || '-'}`
        },
        {
            label: ORG_UNITS.Project,
            value: `${data?.projectName || '-'}`
        },
        {
            label: 'Position',
            value: `${data?.positionName || '-'}`
        }
    ];

    const onsiteSelections: IInfoSection[] = [{ title: 'Employee Information', columns: dataEmployeeInfo }];

    const goBack = () => {
        navigation(pathnames.hrManagement.documentManagement.main.path);
    };

    const onClickEdit = () => navigation(pathnames.hrManagement.documentManagement.edit.path + '/' + id);

    const buttons: ButtonProps[] = [
        havePermission('ViewEmployeeDetails') &&
        {
            children: 'View Employee Details',
            onClick: () => navigation(pathnames.hrManagement.employeeManagement.detail.path + '/' + id)
        },
        havePermission('Edit') &&
        {
            onClick: onClickEdit,
            type: 'primary',
            children: 'Edit'
        }
    ].filter(Boolean);

    const dataDocumentInfo: IRenderItemFormValidate[] = (data?.documents || []).map((item: IDocumentType) => {
        return {
            name: item.documentTypeName,
            label: item.documentTypeName,
            value: item
        };
    });

    const remapDocument = () => {
        const newData: (IField | undefined)[] = [];

        dataDocumentInfo.forEach(item => {
            const { label, value } = item;

            newData.push(
                ...[
                    {
                        value: (
                            <>
                                <Checkbox className="padding-right-16" checked={!!(value as IFieldValueForm)?.receivedDate} disabled />
                                {label}
                            </>
                        ),
                        colSpan: 4
                    },
                    {
                        label: 'Request Date',
                        value: renderWithFallback(formatTimeMonthDayYear((value as IFieldValueForm)?.requestDate)),
                        colSpan: 5
                    },
                    {
                        label: 'Received Date',
                        value: renderWithFallback(formatTimeMonthDayYear((value as IFieldValueForm)?.receivedDate)),
                        colSpan: 5
                    },
                    {
                        label: 'Notes',
                        value: renderWithFallback((value as IFieldValueForm)?.notes),
                        colSpan: 5
                    },
                    label === 'Degree'
                        ? {
                            label: 'Type',
                            value: renderWithFallback((value as IFieldValueForm)?.rankTypeName),
                            colSpan: 5
                        }
                        : {
                            value: '',
                            colSpan: 5
                        }
                ]
            );
        });

        return newData;
    };

    const sectionDocument = <DetailFields className="label-document-center-vertical" data={remapDocument()} />;

    //call api get data document detail
    useEffect(() => {
        //call api get data document detail
        const fetchData = async () => {
            try {
                const response = await documentService.getDocumentDetail(`${id}`);
                setData(response.data);
            } catch (error) {
                showNotification(false, 'Error fetching data document');
            }
        };

        fetchData();
    }, [id, isReload, showNotification]);

    return <DocumentInfo pageTitle="Document Details" buttons={buttons} goBack={goBack} data={onsiteSelections} sectionDocument={sectionDocument} />;
};

export default TabDocumentDetail;
