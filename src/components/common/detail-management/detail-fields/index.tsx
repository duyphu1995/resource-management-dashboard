import { IField } from '@/types/common';
import { Col, Form, Row } from 'antd';
import { Gutter } from 'antd/es/grid/row';

export interface IDetailFieldsProps {
    data: (IField | undefined)[];
    gap?: Gutter | [Gutter, Gutter];
    className?: string;
}

const DetailFields = (props: IDetailFieldsProps) => {
    const { data = [], gap = [24, 24], className } = props;

    return (
        <Row gutter={gap} className={className}>
            {data.map((field, index) => {
                if (field) {
                    const { name, label, validation, value, initValue, valuePropName, hidden, colSpan = 6 } = field;

                    return (
                        <Col span={colSpan} key={index} hidden={hidden}>
                            <Form.Item name={name} label={label} htmlFor="" rules={validation} initialValue={initValue} valuePropName={valuePropName}>
                                {value}
                            </Form.Item>
                        </Col>
                    );
                } else return null;
            })}
        </Row>
    );
};

export default DetailFields;
