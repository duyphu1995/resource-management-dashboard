import EmptyBox from '@/components/common/empty-box';
import BaseSelect from '@/components/common/form/select';
import BaseToolTip from '@/components/common/tooltip';
import employeeTransferService from '@/services/transfer-employee';
import { IEmployeeInfo, IMailingList } from '@/types/transfer-employee';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { Col, Flex } from 'antd';
import Title from 'antd/es/typography/Title';
import { useEffect, useState } from 'react';

interface ISectionRemoveMailingListProps {
    employeeInfo: IEmployeeInfo | null;
    employeeMailList: IMailingList[];
    setEmployeeMailList: (employeeMailList: IMailingList[]) => void;
    removeMailList: IMailingList[];
    setRemoveMailList: (removeMailList: IMailingList[]) => void;
    turnOnLoading: () => void;
    turnOffLoading: () => void;
}

const SectionRemoveMailingList = (props: ISectionRemoveMailingListProps) => {
    const { employeeInfo, employeeMailList, setEmployeeMailList, removeMailList, setRemoveMailList, turnOnLoading, turnOffLoading } = props;

    const { showNotification } = useNotify();
    const { fieldsForRestrictData } = usePermissions('AddNewTransfer', 'EmployeeTransfer');

    const [selectedRecordMail, setSelectedRecordMail] = useState<IMailingList>();
    const [selectedRecordEmployeeMail, setSelectedRecordEmployeeMail] = useState<IMailingList>();
    const [selectedRecordRemoveMail, setSelectedRecordRemoveMail] = useState<IMailingList>();
    const [mailList, setMailList] = useState<IMailingList[]>([]);

    const renderTransferButton = (type: string) => {
        const handleClick = (direction: string) => {
            // updatedData is used to update the flagTransfer of each item based on the conditions of the 4 buttons
            const updateMailList = [...mailList];
            const updateEmployeeMailList = [...employeeMailList];
            const updateRemoveMailList = [...removeMailList];

            //move record from this list to another list
            const moveRecord = (flag: string, selectedRecord: any, fromList: any[], toList: any[]) => {
                let alreadyExists = false;
                toList.forEach(item => {
                    if (item.value === selectedRecord?.value) {
                        alreadyExists = true;
                    }
                });

                if (!alreadyExists) {
                    toList.push({
                        ...selectedRecord,
                        flagTransfer: flag
                    });
                }

                fromList.forEach((item, index) => {
                    if (item.value === selectedRecord?.value) {
                        fromList.splice(index, 1);
                    }
                });
            };

            if (type && direction) {
                switch (true) {
                    case direction === 'right' && type === 'one' && selectedRecordMail?.flagTransfer === '1':
                        moveRecord('2', selectedRecordMail, updateMailList, updateEmployeeMailList);
                        break;
                    case direction === 'left' && type === 'one' && selectedRecordEmployeeMail?.flagTransfer === '2':
                        if (selectedRecordEmployeeMail?.flagDisableTransfer !== 1) {
                            showNotification(false, "You can't move this field");
                            return;
                        }
                        moveRecord('1', selectedRecordEmployeeMail, updateEmployeeMailList, updateMailList);
                        break;
                    case direction === 'right' && type === 'two' && selectedRecordEmployeeMail?.flagTransfer === '2':
                        if (selectedRecordEmployeeMail?.flagDisableTransfer === 1) {
                            showNotification(false, "You can't move this field");
                            return;
                        }
                        moveRecord('3', selectedRecordEmployeeMail, updateEmployeeMailList, updateRemoveMailList);
                        break;
                    case direction === 'left' && type === 'two' && selectedRecordRemoveMail?.flagTransfer === '3':
                        moveRecord('2', selectedRecordRemoveMail, updateRemoveMailList, updateEmployeeMailList);
                        break;
                    default:
                        return;
                }
            }

            //update data for lists
            setMailList(updateMailList);
            setEmployeeMailList(updateEmployeeMailList);
            setRemoveMailList(updateRemoveMailList);
        };

        return (
            <Flex vertical align="center" justify="center" gap={24} className="transfer-container">
                <Flex align="center" justify="center" className={`transfer-box transfer-box-${type} `} onClick={() => handleClick('right')}>
                    <img src="/media/icons/chevron-right-gray.svg" alt="arrow" className="transfer-icon" />
                </Flex>
                <Flex align="center" justify="center" className={`transfer-box transfer-box-${type} `} onClick={() => handleClick('left')}>
                    <img src="/media/icons/chevron-left-gray.svg" alt="arrow" className="transfer-icon" />
                </Flex>
            </Flex>
        );
    };

    const locale = { emptyText: <EmptyBox loading={false} imageSize={100} minHeight={234} /> };

    const renderRemoveMailingList = () => (
        <div className="table-transfer-mailing-list">
            <Title level={5}>
                Remove Mailing List <BaseToolTip title="You can remove mailing list not using for this employee" />
            </Title>
            <div className="grid-container">
                {!fieldsForRestrictData?.includes('MailingList') && (
                    <>
                        <div className="column">
                            <Flex vertical>
                                <Flex align="center" gap={8}>
                                    <div style={{ fontWeight: 500 }}>Mailing List</div>
                                </Flex>
                                <Col style={{ margin: '16px 12px 12px 0px', backgroundColor: '#fff', padding: 'unset' }}>
                                    <BaseSelect
                                        options={mailList}
                                        style={{ width: '100%' }}
                                        open={true}
                                        className="select-mail"
                                        notFoundContent={locale.emptyText}
                                        onChange={(value: string, event: any) =>
                                            setSelectedRecordMail({
                                                label: event.label,
                                                value: value,
                                                flagTransfer: event.flagTransfer,
                                                flagDisableTransfer: event.flagDisableTransfer
                                            })
                                        }
                                    />
                                </Col>
                            </Flex>
                        </div>
                        <div className="button-column">{renderTransferButton('one')}</div>
                    </>
                )}

                <div className="column">
                    <Flex vertical>
                        <Flex align="center" gap={8}>
                            <div style={{ fontWeight: 500 }}>Employee Mailing List </div>
                        </Flex>
                        <Col style={{ margin: '16px 0px 12px 0px', backgroundColor: '#fff', padding: 'unset' }}>
                            <BaseSelect
                                options={employeeMailList}
                                style={{ width: '100%' }}
                                open={true}
                                className="select-mail"
                                notFoundContent={locale.emptyText}
                                onChange={(value: string, event: any) =>
                                    setSelectedRecordEmployeeMail({
                                        label: event.label,
                                        value: value,
                                        flagTransfer: event.flagTransfer,
                                        flagDisableTransfer: event.flagDisableTransfer
                                    })
                                }
                            />
                        </Col>
                    </Flex>
                </div>
                <div className="button-column">{renderTransferButton('two')}</div>

                <div className="column">
                    <Flex vertical>
                        <Flex align="center" gap={8}>
                            <div style={{ fontWeight: 500 }}>Remove Mailing List</div>
                        </Flex>
                        <Col style={{ margin: '16px 12px 12px 0px', backgroundColor: '#fff', padding: 'unset' }}>
                            <BaseSelect
                                options={removeMailList}
                                style={{ width: '100%' }}
                                open={true}
                                className="select-mail"
                                notFoundContent={locale.emptyText}
                                onChange={(value: string, event: any) =>
                                    setSelectedRecordRemoveMail({
                                        label: event.label,
                                        value: value,
                                        flagTransfer: event.flagTransfer,
                                        flagDisableTransfer: event.flagDisableTransfer
                                    })
                                }
                            />
                        </Col>
                    </Flex>
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        const fetchDataMailList = async () => {
            turnOnLoading();
            const res = await employeeTransferService.getEmployeeMailList(employeeInfo?.workEmail);
            const { data } = res;

            if (data) {
                const maillist = data.maillist?.map((item: any) => ({
                    label: item,
                    value: item,
                    flagTransfer: '1',
                    flagDisableTransfer: 1
                }));
                const employeeMaillist = data.employeeMaillist?.map((item: any) => ({
                    label: item,
                    value: item,
                    flagTransfer: '2',
                    flagDisableTransfer: 2
                }));

                setMailList(maillist);
                setEmployeeMailList(employeeMaillist);
                setRemoveMailList([]);
            }

            turnOffLoading();
        };

        fetchDataMailList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeInfo, turnOnLoading, turnOffLoading]);

    return renderRemoveMailingList();
};

export default SectionRemoveMailingList;
