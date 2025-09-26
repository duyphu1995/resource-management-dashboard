import { Divider, DividerProps } from 'antd';

interface IDividerProps extends DividerProps {
    margin?: string;
    bgColor?: string;
}

const BaseDivider = (props: IDividerProps) => {
    const { margin, bgColor, ...otherProps } = props;
    return <Divider style={{ margin: margin, backgroundColor: bgColor }} {...otherProps} />;
};

export default BaseDivider;
