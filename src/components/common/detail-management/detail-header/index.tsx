import { Button, ButtonProps, Flex } from 'antd';
import Title from 'antd/es/typography/Title';
import { ReactNode } from 'react';

interface IDetailHeader {
    pageTitle: string | ReactNode;
    moreContent?: ReactNode;
    buttons?: ButtonProps[];
    goBack?: () => void;
    infoTooltip?: ReactNode;
}

const DetailHeader = (props: IDetailHeader) => {
    const { buttons = [], pageTitle, infoTooltip, moreContent, goBack } = props;

    const renderButtons = () => {
        return buttons?.map((button, index) => {
            const key = Math.floor(Math.random() * 10000) + '-' + index;

            return <Button {...button} key={key}></Button>;
        });
    };

    return (
        <div className="box-content-title-header">
            <div className="box-content-title-container">
                <div className="box-title-and-icon">
                    {goBack && <img className="icon-leading-title" src="/media/icons/chevron-left.svg" alt="chevron-left-icon" onClick={goBack} />}
                    <Flex align="center" gap={8}>
                        <Title level={3} className="box-content-title__title">
                            {pageTitle}
                        </Title>
                        {infoTooltip}
                    </Flex>
                </div>
            </div>
            {moreContent && moreContent}
            <Flex gap={12}>{buttons && renderButtons()}</Flex>
        </div>
    );
};

export default DetailHeader;
