import { Form, FormItemProps } from 'antd';
import './index.scss';

const FormItem = (props: FormItemProps) => {
    return (
        <Form.Item {...props} className="form-item-group">
            {props.children}
        </Form.Item>
    );
};

export default FormItem;
