import { handleDownloadImage } from '@/utils/common';
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

interface IDownloadChartDropdownProps {
    chartRef: React.RefObject<ReactECharts>;
    pageHeightProp?: string;
    pageWidthProp?: string;
}

const ButtonDownloadChart = (props: IDownloadChartDropdownProps) => {
    const { chartRef, pageHeightProp, pageWidthProp } = props;

    const [pageWidth, setPageWidth] = useState<number | string>('100vw');
    const pageHeight = '100vh';

    useEffect(() => {
        if (chartRef.current) {
            const rect = chartRef.current.getEchartsInstance().getDom().getBoundingClientRect();
            setPageWidth(rect.width + 40 + 'px');
        }
    }, [chartRef]);

    const handlePrintAction = useReactToPrint({
        pageStyle: `@media print {
            @page {
                size: ${pageWidthProp || pageWidth} ${pageHeightProp || pageHeight} !important;
                margin: 0;
                padding: 20;
            }
            .print-container {
                padding: 40px;
            }
        }`,
        content: () => chartRef.current?.getEchartsInstance().getDom() as HTMLDivElement
    });

    const handleDownload = (format: 'png' | 'jpeg' | 'svg' | 'pdf') => {
        if (chartRef.current) {
            handleDownloadImage(chartRef.current.getEchartsInstance().getDataURL(), format);
        }
    };

    return (
        <Dropdown
            menu={{
                items: [
                    {
                        key: '1',
                        label: (
                            <Button type="link" onClick={() => handlePrintAction()}>
                                Print Chart
                            </Button>
                        )
                    },
                    {
                        key: '2',
                        label: (
                            <Button type="link" onClick={() => handleDownload('png')}>
                                Download PNG Image
                            </Button>
                        )
                    },
                    {
                        key: '3',
                        label: (
                            <Button type="link" onClick={() => handleDownload('jpeg')}>
                                Download JPEG Image
                            </Button>
                        )
                    },
                    {
                        key: '4',
                        label: (
                            <Button type="link" onClick={() => handleDownload('pdf')}>
                                Download PDF Document
                            </Button>
                        )
                    },
                    {
                        key: '5',
                        label: (
                            <Button type="link" onClick={() => handleDownload('svg')}>
                                Download SVG Vector Image
                            </Button>
                        )
                    }
                ]
            }}
            placement="bottomRight"
            overlayStyle={{ border: '1px solid #2A9AD6', borderRadius: '4px' }}
            rootClassName="print-chart-pie-resignation"
        >
            <Button className="download-btn">
                Download <DownOutlined />
            </Button>
        </Dropdown>
    );
};

export default ButtonDownloadChart;
