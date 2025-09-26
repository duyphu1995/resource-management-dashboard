import Title from 'antd/es/typography/Title';
import { ReactNode } from 'react';

export interface IDetailInfoProps {
    title?: string | ReactNode;
    children: ReactNode;
}

const DetailInfo = (props: IDetailInfoProps) => {
    const { title, children } = props;

    return (
        <div className="box-content-container">
            <div className="box-form-group">
                {title && (
                    <Title level={4} className="box-form-title">
                        {title}
                    </Title>
                )}
                <div className="box-row-group">{children}</div>
            </div>
        </div>
    );
};

export default DetailInfo;
