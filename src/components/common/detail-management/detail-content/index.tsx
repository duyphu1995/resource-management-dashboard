import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { ReactNode } from 'react';

export interface IDetailContentProps {
    children: ReactNode;
    rootClassName?: string;
}

const DetailContent = (props: IDetailContentProps) => {
    const { children, rootClassName } = props;

    return (
        <Layout className={`layout-detail ${rootClassName}`}>
            <Content className="content-container">{children}</Content>
        </Layout>
    );
};

export default DetailContent;
