import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailInfo from '@/components/common/detail-management/detail-info';
import BaseDivider from '@/components/common/divider';
import { EmployeeSelect } from '@/components/common/employee-select';
import DatePicker from '@/components/common/form/date-picker';
import FileUpload from '@/components/common/form/field-upload';
import InputCommon from '@/components/common/form/input';
import BaseSelect from '@/components/common/form/select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import { removeNullUndefinedEmpty, sumMonetaryUnit } from '@/components/hr-management/onsite-management/onsite-common';
import OnsiteInfo from '@/components/hr-management/onsite-management/onsite-info';
import pathnames from '@/pathnames';
import onsiteService from '@/services/hr-management/onsite-management';
import { IField, IUploadFile } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import {
    ICommitmentTypes,
    IExpense,
    IInfoSection,
    IOptionCountry,
    IOptionMoney,
    IOptionProject,
    IOptionVisaType,
    ITotalMoney
} from '@/types/hr-management/onsite-management';
import { formatCurrencyNumber, formatTime, generateUniqueId, handleUploadFile, validate1000Characters, validate500Characters } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Form, Input, Radio } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnsiteAddPage = () => {
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const navigation = useNavigate();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();

    const [employeeInfo, setEmployeeInfo] = useState<IEmployee | null>();
    const [uploadFile, setUploadFile] = useState<IUploadFile[]>([]);
    const [changeFileUpload, setChangeFileUpload] = useState<boolean>(false);
    const [fileLimit, setFileLimit] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [badgeId, setBadgeId] = useState<string>('');
    const [dataVisaTypeOptions, setDataVisaTypeOptions] = useState<DefaultOptionType[]>([]);
    const [projectOptions, setProjectOptions] = useState<DefaultOptionType[]>([]);
    const [dataCountryOptions, setDataCountryOptions] = useState<DefaultOptionType[]>([]);
    const [dataExpenseInfo, setDataExpenseInfo] = useState<IExpense[]>([]);
    const [dataMoneyOptions, setDataMoneyOptions] = useState<DefaultOptionType[]>([]);
    const [totalMoney, setTotalMoney] = useState<ITotalMoney[]>([]);
    const [commitmentTypes, setCommitmentTypes] = useState<ICommitmentTypes[] | null>([]);

    // Props upload file popup
    const propsUpload = {
        name: 'file',
        beforeUpload: (file: File) => {
            setUploadFile([file]);
            if (file.size > 1024 * 1024 * 4) {
                setFileLimit(true);
            } else {
                setFileLimit(false);
            }
            return false;
        },
        fileList: uploadFile,
        maxCount: 1
    };

    // handle change employee
    const handleChangeEmployee = async (employee: IEmployee | null) => {
        if (employee) {
            setEmployeeInfo(employee);

            form.setFieldsValue({
                fullName: employee?.fullName,
                projectName: employee?.projectName
            });
            setBadgeId(employee?.badgeId);
        }
    };

    const breadcrumbItems = [
        { title: pathnames.hrManagement.main.name },
        {
            title: pathnames.hrManagement.onsiteManagement.main.name,
            path: pathnames.hrManagement.onsiteManagement.main.path
        },
        { title: pathnames.hrManagement.onsiteManagement.add.name }
    ];

    const dataEmployeeInfo: IField[] = [
        {
            name: 'fullName',
            label: 'Full Name',
            value: <EmployeeSelect width={'100%'} getAPI={onsiteService.getEmployeeInformation} onSelectedEmployee={handleChangeEmployee} />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: 'Badge ID',
            value: renderWithFallback(badgeId)
        },
        {
            name: 'projectName',
            label: ORG_UNITS.Project,
            value: <BaseSelect options={projectOptions} loading={isLoading} placeholder="Select project" />
        },
        {
            name: 'customer',
            label: 'Customer',
            value: <Input placeholder="Enter customer" />,
            validation: [validate500Characters]
        },
        {
            name: 'emergency',
            label: 'Emergency',
            value: <Input placeholder="Enter emergency" />,
            validation: [validate500Characters]
        },
        {
            name: 'cashFromTMA',
            label: 'Cash From TMA',
            value: <Input placeholder="Enter cash from TMA" />,
            validation: [validate500Characters]
        },
        {
            name: 'receivedDate',
            label: 'Received Date',
            value: <DatePicker allowClear />
        },
        {
            name: 'incomeRemark',
            label: 'Income Remark',
            value: <Input placeholder="Enter income remark" />,
            validation: [validate500Characters]
        }
    ];

    const handleDisableDateFlightDeparture = (currentDate: dayjs.Dayjs) => {
        const flightReturn = form.getFieldValue('flightReturn');
        const expectedEndDate = form.getFieldValue('expectedEndDate');
        const actualEndDate = form.getFieldValue('actualEndDate');

        const smallestDay = [flightReturn, expectedEndDate, actualEndDate]
            .filter(day => day)
            .reduce((minDay, day) => (day.isBefore(minDay) ? day : minDay), currentDate);

        return currentDate.isAfter(smallestDay);
    };

    const handleDisableDateBeforeFlightDeparture = (currentDate: dayjs.Dayjs) => {
        const toValue = form.getFieldValue('flightDeparture');
        return toValue ? currentDate.isBefore(toValue) : false;
    };

    const dataFlightInfo: IField[] = [
        {
            name: 'onsiteCountryId',
            label: 'Country',
            value: <BaseSelect options={dataCountryOptions} placeholder="Select country" />
        },
        {
            name: 'cityName',
            label: 'City',
            value: <Input placeholder="Enter city" />,
            validation: [validate500Characters]
        },
        {
            name: 'visaTypeName',
            label: 'Visa Type',
            value: <BaseSelect options={dataVisaTypeOptions} placeholder="Select visa type" />
        },
        {
            name: 'flightDeparture',
            label: 'Flight Departure',
            value: <DatePicker allowClear disabledDate={handleDisableDateFlightDeparture} />
        },
        {
            name: 'flightReturn',
            label: 'Flight Return',
            value: <DatePicker allowClear disabledDate={handleDisableDateBeforeFlightDeparture} />
        },
        {
            name: 'expectedEndDate',
            label: 'Expected End',
            value: <DatePicker allowClear disabledDate={handleDisableDateBeforeFlightDeparture} />
        },
        {
            name: 'actualEndDate',
            label: 'Actual End',
            value: <DatePicker allowClear disabledDate={handleDisableDateBeforeFlightDeparture} />
        },
        {
            name: 'isInsurance',
            label: 'Insurance',
            value: (
                <div className="container">
                    <Radio.Group>
                        <Radio value={true}>Yes</Radio>
                        <Radio value={false}>No</Radio>
                    </Radio.Group>
                </div>
            )
        },
        {
            name: 'notes',
            label: 'Note',
            value: <Input.TextArea placeholder="Enter note" className="text-area-item" />,
            validation: [validate1000Characters]
        }
    ];

    const watchSignedDate = Form.useWatch('signedDate', form);
    const watchFrom = Form.useWatch('fromDate', form);
    const watchTo = Form.useWatch('toDate', form);
    const watchFile = Form.useWatch('file', form);
    const watchNoteCommitment = Form.useWatch('noteCommitment', form);
    const watchCommitmentTypes = Form.useWatch('commitmentTypes', form);
    const isAnyFieldPresent = watchSignedDate || watchFrom || watchTo || watchFile || watchNoteCommitment || watchCommitmentTypes;

    const validateFromOnsite = () => ({
        required: true,
        validator(_: any, value: any) {
            if (isAnyFieldPresent && (value === undefined || value === null)) {
                return Promise.reject(new Error('Please select valid value'));
            }
            return Promise.resolve();
        }
    });

    const validateFile = () => ({
        required: true,
        validator(_: any, value: any) {
            if ((isAnyFieldPresent && value === undefined) || value === null) {
                setError(true);
                return Promise.reject(new Error('Please select valid value'));
            }
            if (fileLimit) {
                setError(true);
                return Promise.reject('File size must be smaller than 4MB!');
            }
            setError(false);
            return Promise.resolve();
        }
    });

    // Handle change file upload
    const onChangeFileUpload = () => {
        setChangeFileUpload(true);
        form.validateFields();

        // if fileLimit is true validate file size
        if (fileLimit) {
            form.validateFields(['file']);
        }
    };

    // Handle clear file
    const handleClearFile = () => {
        setUploadFile([]);
        setFileLimit(false);
        form.setFieldsValue({
            file: undefined
        });
    };

    const mappingCommitmentTypes = (data: any = []) => {
        return data.map((item: any) => ({
            label: item.commitmentTypeName,
            value: item.commitmentTypeId
        }));
    };

    const dataCommitmentInfo: IField[] = [
        {
            name: 'commitmentTypes',
            label: 'Commitment Types',
            value: <BaseSelect options={mappingCommitmentTypes(commitmentTypes || null)} placeholder="Select commitment" />,
            validation: [validateFromOnsite]
        },
        {
            name: 'signedDate',
            label: 'Signed Date',
            value: <DatePicker allowClear />,
            validation: [validateFromOnsite]
        },
        {
            name: 'fromDate',
            label: 'From',
            value: (
                <DatePicker
                    allowClear
                    disabledDate={currentDate => {
                        if (!currentDate) return false;
                        const toValue = form.getFieldValue('toDate');
                        return toValue ? currentDate.isAfter(toValue) : false;
                    }}
                />
            ),
            validation: [validateFromOnsite]
        },
        {
            name: 'toDate',
            label: 'To',
            value: (
                <DatePicker
                    allowClear
                    disabledDate={currentDate => {
                        if (!currentDate) return false;
                        const fromValue = form.getFieldValue('fromDate');
                        return fromValue ? currentDate.isBefore(fromValue) : false;
                    }}
                />
            ),
            validation: [validateFromOnsite]
        },
        {
            name: 'file',
            label: 'Attachment',
            value: (
                <FileUpload
                    keyId={generateUniqueId()}
                    propsUpload={propsUpload}
                    uploadFile={uploadFile}
                    fileLimit={fileLimit}
                    error={error}
                    onChange={onChangeFileUpload}
                    handleClearFile={handleClearFile}
                />
            ),
            validation: [validateFile]
        },
        {
            name: 'noteCommitment',
            label: 'Note',
            value: <Input.TextArea placeholder="Input" className="text-area-item" />,
            validation: [validate1000Characters]
        }
    ];

    const onsiteSelections: IInfoSection[] = [
        { title: 'Employee Information', columns: dataEmployeeInfo },
        { title: 'Flight Information', columns: dataFlightInfo },
        { title: 'Commitment', columns: dataCommitmentInfo }
    ];

    const remapExpenses = () => {
        const newData: IField[] = [];

        dataExpenseInfo.forEach(item => {
            const { name } = item;

            const handleUnitChange = () => {
                const outputArray = sumMonetaryUnit(form?.getFieldsValue());
                setTotalMoney(outputArray);
            };

            const handleChangeValue = () => {
                const outputArray = sumMonetaryUnit(form?.getFieldsValue());
                setTotalMoney(outputArray);
            };

            newData.push(
                ...[
                    { label: name, colSpan: 4 },
                    {
                        name: [name, 'costFee'],
                        value: <InputCommon placeholder="Enter value" onChange={handleChangeValue} typeInput="numbers-only" />,
                        colSpan: 4
                    },
                    {
                        name: [name, 'monetaryUnit'],
                        value: <BaseSelect options={dataMoneyOptions} placeholder="Select unit" onChange={handleUnitChange} />,
                        colSpan: 4
                    },
                    {
                        name: [name, 'notes'],
                        value: <Input placeholder="Enter note" />,
                        validation: [validate1000Characters],
                        colSpan: 12
                    }
                ]
            );
        });

        return newData;
    };

    const sectionExpense = (
        <DetailInfo title="Expense">
            <DetailFields className="label-center-vertical" data={remapExpenses()} />
            <BaseDivider className="dashed-divider" />
            <DetailFields
                data={[
                    { label: <div className="total">Total</div>, colSpan: 4 },
                    {
                        label: (
                            <div className="price">
                                {totalMoney.map((item: ITotalMoney, index: number) => {
                                    return (
                                        <div className="content-price" key={`${item}-${index}`}>
                                            {formatCurrencyNumber(item.totalCostFee)} {item.totalMonetaryUnit}
                                        </div>
                                    );
                                })}
                            </div>
                        ),
                        colSpan: 4
                    }
                ]}
            />
        </DetailInfo>
    );

    const formatOnsiteData = (item: any) => {
        const {
            fullName,
            projectName,
            customer,
            emergency,
            cashFromTMA,
            receivedDate,
            incomeRemark,
            onsiteCountryId,
            cityName,
            visaTypeName,
            flightDeparture,
            flightReturn,
            expectedEndDate,
            actualEndDate,
            isInsurance,
            notes,
            signedDate,
            fromDate,
            toDate,
            noteCommitment,
            commitmentTypes
        } = item;

        const commitment = {
            fromDate: fromDate && formatTime(fromDate),
            toDate: toDate && formatTime(toDate),
            signedDate: signedDate && formatTime(signedDate),
            notes: noteCommitment,
            commitmentTypeId: commitmentTypes
        };

        const expenses = dataExpenseInfo
            .filter((expenseItem: IExpense) => item[expenseItem.name])
            .map((expenseItem: IExpense) => {
                const { name } = expenseItem;

                return {
                    expenseName: name,
                    monetaryUnit: item[name]?.monetaryUnit,
                    costFee: item[name]?.costFee ? parseFloat(item[name]?.costFee) : undefined,
                    notes: item[name]?.notes
                };
            });

        const result = {
            employeeId: employeeInfo?.employeeId,
            projectName,
            customer,
            emergency,
            cashFromTMA,
            receivedDate: receivedDate && formatTime(receivedDate),
            incomeRemark,
            onsiteCountryId,
            fullName,
            cityName,
            visaTypeName,
            flightDeparture: flightDeparture && formatTime(flightDeparture),
            flightReturn: flightReturn && formatTime(flightReturn),
            expectedEndDate: expectedEndDate && formatTime(expectedEndDate),
            actualEndDate: actualEndDate && formatTime(actualEndDate),
            isInsurance: isInsurance === 'true' ? true : false,
            notes,
            commitment,
            expenses
        };

        return result;
    };

    const UploadFile = async (dataFormat: any) => {
        try {
            turnOnLoading();
            const nameUploadFile = await handleUploadFile(uploadFile, changeFileUpload, onsiteService.uploadFile);
            nameUploadFile && (dataFormat.commitment.attachment = nameUploadFile);
        } catch (error) {
            showNotification(false, 'Upload file failed');
        } finally {
            turnOffLoading();
        }
    };

    // onfinish
    const onSubmit = async () => {
        const data = form.getFieldsValue();
        const dataFormat = removeNullUndefinedEmpty(formatOnsiteData(data));

        await UploadFile(dataFormat);

        const response = await onsiteService.addOnsite(dataFormat as any);
        const { succeeded, message } = response;

        succeeded && navigation(pathnames.hrManagement.onsiteManagement.main.path);
        showNotification(succeeded, message);
    };

    const goBack = () => {
        navigation(pathnames.hrManagement.onsiteManagement.main.path);
    };

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

    // set value project options for form
    useEffect(() => {
        if (employeeInfo) {
            const fetchDataProject = async () => {
                const res = await onsiteService.getProject(employeeInfo.employeeId);
                const newProject = (res?.data || [])?.map((item: IOptionProject) => {
                    return {
                        label: item.unitName,
                        value: item.unitName
                    };
                });

                setProjectOptions(newProject);
            };
            fetchDataProject();
        }
    }, [employeeInfo, form]);

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const resVisaType = await onsiteService.getVisaType();
                const newVisaType = (resVisaType?.data || []).map((item: IOptionVisaType) => {
                    return {
                        label: item.name,
                        value: item.name
                    };
                });
                const resCountry = await onsiteService.getCountry();
                const newCountry = (resCountry?.data || []).map((item: IOptionCountry) => {
                    return {
                        label: item.countryName,
                        value: item.onsiteCountryId
                    };
                });
                const resExpense = await onsiteService.getExpense();
                const resMoneyUnit = await onsiteService.getMoneyUnit();
                const newMoneyUnit = (resMoneyUnit?.data || []).map((item: IOptionMoney) => {
                    return {
                        label: item.name,
                        value: item.name
                    };
                });

                setDataVisaTypeOptions(newVisaType);
                setDataCountryOptions(newCountry);
                setDataExpenseInfo(resExpense.data || []);
                setDataMoneyOptions(newMoneyUnit);
            } catch (error) {
                showNotification(false, 'Get options failed');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [showNotification, turnOnLoading, turnOffLoading]);

    // Fetch data for commitmentTypes
    useEffect(() => {
        const fetchCommitmentType = async () => {
            turnOnLoading();
            try {
                const res = await onsiteService.getCommitmentTypes();
                const { data } = res;
                setCommitmentTypes(data || null);
            } catch (error) {
                showNotification(false, 'Get commitment types failed');
            } finally {
                turnOffLoading();
            }
        };
        fetchCommitmentType();
    }, [showNotification, turnOnLoading, turnOffLoading]);

    return (
        <OnsiteInfo
            pageTitle={pathnames.hrManagement.onsiteManagement.add.name}
            breadcrumbData={breadcrumbItems}
            buttons={buttons}
            onSubmitForm={onSubmit}
            form={form}
            goBack={goBack}
            data={onsiteSelections}
            sectionExpense={sectionExpense}
        />
    );
};

export default OnsiteAddPage;
