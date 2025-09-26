import BaseToolTip from '@/components/common/tooltip';
import usePermissions from '@/utils/hook/usePermissions';
import { Checkbox, Col, Flex, Form, Input, Radio, Row } from 'antd';
import Title from 'antd/es/typography/Title';

interface ISectionTransferToProps {
    checkedCustomer: {
        isSameCustomer: boolean;
        isDifferentCustomer: boolean;
    };
    setCheckedCustomer: (checkedCustomer: any) => void;
    isKeepHDD: boolean;
    setIsKeepHDD: (isKeepHDD: boolean) => void;
}

const SectionTransferTo = (props: ISectionTransferToProps) => {
    const { checkedCustomer, setCheckedCustomer, isKeepHDD, setIsKeepHDD } = props;

    const { havePermission } = usePermissions('AddNewTransfer', 'EmployeeTransfer');

    const onChangeChecked = (value: any) => {
        if (value.target.value === 'sameCustomer') {
            setCheckedCustomer({
                isSameCustomer: true,
                isDifferentCustomer: false
            });
        } else {
            setCheckedCustomer({
                isSameCustomer: false,
                isDifferentCustomer: true
            });
        }
    };

    const renderTransferTo = () => (
        <div style={{ marginTop: 32 }}>
            <Title level={5}>
                Transfer To <span style={{ color: 'red' }}>*</span>
            </Title>
            <Flex vertical gap={8}>
                <Form.Item name="radio" rules={[{ required: true, message: 'Please select valid option' }]}>
                    <Radio.Group onChange={onChangeChecked} className="w-100">
                        <Flex vertical gap={24}>
                            <Flex vertical>
                                <Radio value="sameCustomer">Transfer To Same Customer</Radio>
                                {checkedCustomer?.isSameCustomer && (
                                    <>
                                        <Col span={12} style={{ marginTop: 16, marginBottom: 4, fontWeight: 500 }}>
                                            Need IT To Take Action <span style={{ color: 'red' }}>*</span>
                                        </Col>
                                        <Row gutter={24}>
                                            <Col span={12}>
                                                <Form.Item name="itActionNote" rules={[{ required: true, message: 'Please enter valid value' }]}>
                                                    <Input.TextArea placeholder="Enter IT to take action" className="text-area-item" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </>
                                )}
                            </Flex>
                            <div>
                                <Radio value="differentCustomer">
                                    <Flex align="center" gap={8}>
                                        <span>Transfer To Different Customer</span>
                                        <BaseToolTip title="You can remove the privileges of this employee according to the ticked number granted" />
                                    </Flex>
                                </Radio>
                            </div>
                        </Flex>
                    </Radio.Group>
                </Form.Item>
                {checkedCustomer?.isDifferentCustomer && (
                    <>
                        <Form.Item name="isKeepHDD" valuePropName="checked">
                            <Checkbox onChange={() => setIsKeepHDD(!isKeepHDD)} style={{ marginTop: 16 }} disabled={!havePermission('KeepHDD')}>
                                Keep HDD
                            </Checkbox>
                        </Form.Item>
                        <div>Note</div>
                        <span>Only Director/Sr. Director is able to select "Keep HDD" option.</span>
                        <span>By accepting Keep HDD, it's assumed that you reviewed and accepted the risk of data leak on this employee.</span>
                        {isKeepHDD && (
                            <>
                                <div>
                                    Reason <span style={{ color: 'red' }}>*</span>
                                </div>
                                <Row>
                                    <Col span={12}>
                                        <Form.Item name="keepHDDReason" rules={[{ required: true, message: 'Please enter valid value' }]}>
                                            <Input.TextArea placeholder="Enter IT to take action" className="text-area-item" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </>
                )}
            </Flex>
        </div>
    );
    return renderTransferTo();
};

export default SectionTransferTo;
