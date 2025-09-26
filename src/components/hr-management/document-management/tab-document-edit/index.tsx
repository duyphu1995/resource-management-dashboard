import DetailFields from '@/components/common/detail-management/detail-fields';
import DatePicker from '@/components/common/form/date-picker';
import BaseSelect from '@/components/common/form/select';
import pathnames from '@/pathnames';
import documentService from '@/services/hr-management/document-management';
import { IField, IRenderItemForm, IRenderItemFormValidate, IResponse, ITableHaveActionAddProps } from '@/types/common';
import { IDocumentAllIndexes, IDocumentList, IDocumentType } from '@/types/hr-management/document-management';
import { IInfoSection } from '@/types/hr-management/onsite-management';
import { filterNullProperties, validate1000Characters } from '@/utils/common';
import { ORG_UNITS, TIME_FORMAT } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Checkbox, Form, Input } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DocumentInfo from '../document-info';

const TabDocumentEdit = (props: ITableHaveActionAddProps<any>) => {
    const { isReload } = props;

    const navigation = useNavigate();
    const [form] = Form.useForm();
    const { id = '' } = useParams();
    const { showNotification } = useNotify();

    const [checkBoxStates, setCheckBoxStates] = useState<Array<boolean>>([]);
    const [data, setData] = useState<IDocumentList>();
    const [documentAllIndex, setDocumentAllIndex] = useState<IDocumentAllIndexes>();
    const [loadingIndex, setLoadingIndex] = useState<boolean>(false);

    const goBack = () => navigation(pathnames.hrManagement.documentManagement.main.path);

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

    const buttons: ButtonProps[] = [
        {
            onClick: goBack,
            children: 'Cancel'
        },
        {
            htmlType: 'submit',
            type: 'primary',
            children: 'Save'
        }
    ];

    const dataDocumentInfo: IRenderItemFormValidate[] = (data?.documents || []).map((item: IDocumentType) => {
        return {
            name: item.documentTypeName,
            label: item.documentTypeName,
            value: item
        };
    });

    const validateDocumentEdit = ({ getFieldValue }: { getFieldValue: any }) => ({
        required: true,
        validator(record: any, value: any) {
            const fieldName = record.field.split('.')[0];
            const checkBox = getFieldValue([fieldName, 'checkbox']);

            if (!value?.toString() && checkBox) {
                return Promise.reject(new Error('Please select the valid value'));
            }

            return Promise.resolve();
        }
    });

    const remapDocument = () => {
        const newData: (IField | undefined)[] = [];

        const handleCheckboxChange = (index: number, label: string) => {
            // Toggle the checkbox state
            const newEditCheckBoxStates = [...checkBoxStates];
            newEditCheckBoxStates[index] = !newEditCheckBoxStates[index];
            setCheckBoxStates(newEditCheckBoxStates);

            // If checkbox is checked, set receivedDate to current date
            if (newEditCheckBoxStates[index]) {
                const currentDate = dayjs();

                form.setFieldsValue({
                    [label]: { receivedDate: currentDate }
                });
            } else {
                // If checkbox is unchecked, then set receivedDate to null
                form.setFieldsValue({
                    [label]: { receivedDate: null }
                });
            }

            form.validateFields();
        };

        const onChangeRequestDate = (dateString: string, label: string) => {
            const receivedDate = form.getFieldValue([label, 'receivedDate']);
            const requestDate = dayjs(dateString, TIME_FORMAT.VN_DATE);
            form.setFieldsValue({
                [label]: { requestDate: dateString },
                [label]: { receivedDate: requestDate > receivedDate ? null : receivedDate }
            });
        };

        dataDocumentInfo.forEach((item, index) => {
            const { label } = item;

            newData.push(
                ...[
                    {
                        name: [label, 'checkbox'],
                        initValue: label,
                        valuePropName: 'checked',
                        value: (
                            <div>
                                <Checkbox
                                    className="padding-right-16"
                                    onChange={() => handleCheckboxChange(index, label)}
                                    checked={checkBoxStates[index]}
                                />
                                {label}
                            </div>
                        ),
                        colSpan: 4
                    },
                    {
                        name: [label, 'requestDate'],
                        label: 'Request Date',
                        value: (
                            <DatePicker
                                className="input-default"
                                placeholder="Request date"
                                onChange={(_, dateString) => onChangeRequestDate(dateString, label)}
                                allowClear
                            />
                        ),
                        colSpan: 5
                    },
                    {
                        name: [label, 'receivedDate'],
                        label: 'Received Date',
                        value: (
                            <DatePicker
                                className="input-default"
                                placeholder="Received date"
                                disabled={!checkBoxStates[index]}
                                allowClear
                                disabledDate={current => {
                                    // Can not select days before request date
                                    return current && current < dayjs(form.getFieldValue([label, 'requestDate']), TIME_FORMAT.VN_DATE);
                                }}
                            />
                        ),
                        validation: [validateDocumentEdit],
                        colSpan: 5
                    },
                    {
                        name: [label, 'notes'],
                        label: 'Notes',
                        value: <Input.TextArea className="text-area-item" placeholder="Notes" />,
                        validation: [validate1000Characters],
                        colSpan: 5
                    },
                    label === 'Degree'
                        ? {
                              name: [label, 'rankTypeId'],
                              label: 'Type',
                              value: (
                                  <BaseSelect
                                      loading={loadingIndex}
                                      options={documentAllIndex?.rankTypes.map(rank => ({
                                          label: rank.rankName,
                                          value: rank.rankId
                                      }))}
                                      placeholder="Type"
                                  />
                              ),
                              colSpan: 5
                          }
                        : {
                              label: '',
                              colSpan: 5
                          }
                ]
            );
        });

        return newData;
    };

    const sectionDocument = <DetailFields className="label-document-center-vertical section-document" data={remapDocument()} />;

    const formatDocumentData = (item: IDocumentType) => {
        // Original data
        const originalDocuments = data?.documents || [];

        // Map the values from onFinish to the corresponding documents
        const formattedData = Object.entries(item).map(([key, value]) => {
            const originalDocument = originalDocuments.find(doc => doc.documentTypeName === key);

            return {
                employeeId: originalDocument?.employeeId,
                employeeDocumentId: originalDocument?.employeeDocumentId,
                documentTypeId: originalDocument?.documentTypeId,
                isCompleted: !!value.receivedDate,
                requestDate: originalDocument?.requestDate,
                receivedDate: originalDocument?.receivedDate,
                notes: originalDocument?.notes,
                ...(value as any),
                // Remove the checkbox payload
                checkbox: undefined
            };
        });

        return formattedData;
    };

    const removeNullFields = (dataArray: IDocumentType[]): IDocumentType[] => {
        const cleanedArray = dataArray.map(item => {
            //  Remove null or undefined properties
            const cleanedItem: Partial<IDocumentType> = filterNullProperties(item);
            return cleanedItem as IDocumentType;
        });
        return cleanedArray;
    };

    const onSubmit = async () => {
        form.validateFields();
        const data = form.getFieldsValue();
        const formattedData = formatDocumentData(data);
        const filteredData = removeNullFields(formattedData);

        const res = await documentService.updateDocumentDetail(filteredData);
        const { succeeded, message } = res;
        succeeded && navigation(pathnames.hrManagement.documentManagement.main.path);
        showNotification(succeeded, message, 4);
    };

    //call api get data document detail
    useEffect(() => {
        const fetchDocumentAllIndex = async () => {
            try {
                setLoadingIndex(true);
                const res: IResponse<IDocumentAllIndexes> = await documentService.getAllIndexes();
                setDocumentAllIndex(res.data);
            } catch (error) {
                showNotification(false, 'Get document all index failed');
            } finally {
                setLoadingIndex(false);
            }
        };

        //call api get data document detail
        const fetchData = async () => {
            let hasSetCheckBoxStates = false;

            try {
                const response = await documentService.getDocumentDetail(`${id}`);

                setData(response.data);

                // Set initial values for receivedDate fields in the form
                response.data?.documents?.forEach(item => {
                    form.setFieldsValue({
                        [item.documentTypeName]: {
                            checkbox: item.receivedDate ? true : false,
                            receivedDate: item.receivedDate ? dayjs(item.receivedDate, TIME_FORMAT.VN_DATE) : null,
                            requestDate: item.requestDate ? dayjs(item.requestDate, TIME_FORMAT.VN_DATE) : null,
                            notes: item.notes || '',
                            rankTypeId: item.rankTypeId || null
                        }
                    });
                });

                // Initialize checkbox states based on receivedDate values
                if (!hasSetCheckBoxStates) {
                    const newCheckBoxStates = response.data?.documents?.map(item => !!item.receivedDate);
                    setCheckBoxStates(newCheckBoxStates || []);
                    hasSetCheckBoxStates = true;
                }
            } catch (error) {
                showNotification(false, 'Error fetching data');
            }
        };

        fetchData();
        fetchDocumentAllIndex();
    }, [id, form, isReload, showNotification]);

    return (
        <DocumentInfo
            pageTitle={pathnames.hrManagement.documentManagement.edit.name}
            buttons={buttons}
            onSubmitForm={onSubmit}
            goBack={goBack}
            form={form}
            data={onsiteSelections}
            sectionDocument={sectionDocument}
        />
    );
};

export default TabDocumentEdit;
