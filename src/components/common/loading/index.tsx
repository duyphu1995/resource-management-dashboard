import { Spin } from 'antd';
import '../../../styles/loading.scss';

export interface ILoadingProps {
    type?: 'page' | 'component';
}
const Loading = ({ type = 'component' }: ILoadingProps) => {
    return type === 'component' ? <Spin size="default" className="component-loading" /> : <Spin size="large" className="overlay-loading" />;
};

export default Loading;
