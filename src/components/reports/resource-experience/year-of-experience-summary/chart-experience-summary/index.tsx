import ReportNoData from '@/components/reports/report-no-data';
import { IYearOfExperienceSummary } from '@/types/reports/resource-experience';
import { colorCharts } from '@/utils/constants';
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';
import { toSvg } from 'html-to-image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import './index.scss';

const ChartExperienceSummary = ({ isLoading, dataChart }: { isLoading: boolean; dataChart: IYearOfExperienceSummary[] | undefined }) => {
    const chartRef = useRef<HTMLDivElement | null>(null);

    const barChartOptions = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: (params: any) => {
                // Extract the x-axis label (name) from the first item
                const xAxisName = params[0]?.name;

                // Generate the tooltip content
                const tooltipContent = params
                    .map((item: any, index: number) => {
                        // Display the x-axis name only for the first item
                        const nameDisplay = index === 0 ? `<strong>Grade: ${xAxisName}</strong><br/>` : '';

                        return `
                            ${nameDisplay}
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="margin-right: 5px;">
                                    <span style="font-size: 20px; margin-right: 6px; color: ${item.color};">●</span>
                                    ${item.seriesName}:
                                </div>
                                <span><strong>${item.value}</strong></span>
                            </div>
                        `;
                    })
                    .join('');

                return tooltipContent;
            }
        },
        legend: {
            data: dataChart?.map(item => item.dcName),
            icon: 'circle',
            itemGap: 24,
            textStyle: {
                fontSize: 14
            },
            bottom: 20
        },
        grid: {
            top: '50',
            left: '50',
            right: '50',
            bottom: '80',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: [
                '<1 year',
                '1 year',
                '2 years',
                '3 years',
                '4 years',
                '5 years',
                '6 years',
                '7 years',
                '8 years',
                '9 years',
                '10 years',
                '>10 years',
                'YoE Average'
            ]
        },
        yAxis: {
            type: 'value'
        },
        series: dataChart?.map(item => ({
            name: item.dcName,
            type: 'bar',
            data: [
                item.range0,
                item.range1,
                item.range2,
                item.range3,
                item.range4,
                item.range5,
                item.range6,
                item.range7,
                item.range8,
                item.range9,
                item.range10,
                item.range11,
                item.averageExp
            ]
        })),
        graphic: [
            {
                type: 'group',
                left: '0',
                top: 'middle',
                children: [
                    {
                        type: 'text',
                        style: {
                            text: 'Employees',
                            fontSize: 14
                        },
                        position: [0, 0],
                        rotation: Math.PI / 2
                    }
                ]
            },
            {
                type: 'group',
                bottom: 55,
                left: 'middle',
                children: [
                    {
                        type: 'text',
                        style: {
                            text: 'YoE Average',
                            fontSize: 14
                        },
                        position: [0, 0]
                    }
                ]
            }
        ],
        label: {
            show: true,
            position: 'top',
            fontSize: 12,
            formatter: (params: any) => params.value
        }
    };

    const generateEChartOptions = (data: any[], title: string) => {
        return {
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    return `${params.data.name}: <strong>${params.value}</strong>`;
                }
            },
            legend: {
                show: false
            },
            color: colorCharts,
            series: [
                {
                    name: title,
                    type: 'pie',
                    radius: '70%',
                    data: data
                        ?.filter(item => item.dcName !== 'TMA Total')
                        .map(item => ({
                            name: item.dcName,
                            value: item.totalEmployee
                        })),
                    label: {
                        formatter: (params: any) => {
                            return params.value;
                        }
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
    };

    const downloadAsImage = (canvas: HTMLCanvasElement, fileName: string, dataUrl?: string) => {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl || canvas.toDataURL('image/png');
        link.click();
    };

    const handleDownloadImagePNG_JPEG = async (element: HTMLDivElement, format: 'png' | 'jpeg', className?: string) => {
        if (!element) return;

        if (className) {
            element.classList.add(className);
        }

        try {
            // Set the scale for better quality
            const canvas = await html2canvas(element, {
                scale: 2, // Increased scale for higher resolution
                backgroundColor: '#f7f6f6'
            });

            // Determine file name and image format
            const fileName = `chart.${format}`;
            if (format === 'jpeg') {
                // Convert to JPEG with a quality setting (0-1)
                const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.9); // 90% quality
                downloadAsImage(canvas, fileName, jpgDataUrl);
            } else {
                downloadAsImage(canvas, fileName); // Default to PNG
            }
        } catch (error) {
            console.error('Error capturing chart:', error);
        }
    };

    const handleDownloadPDF = (element: HTMLDivElement, fileName: string) => {
        if (element) {
            html2canvas(element, { scale: 2, backgroundColor: '#f7f6f6' }).then(canvas => {
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;

                // Convert canvas dimensions from pixels to mm (1 px ≈ 0.2645 mm)
                const pageWidth = imgWidth * 0.2645;
                const pageHeight = imgHeight * 0.2645;

                // Check if the width is greater than the height to switch to landscape, otherwise it's portrait
                const orientation = pageWidth > pageHeight ? 'l' : 'p';

                const pdf = new jsPDF(orientation, 'mm', [pageWidth, pageHeight]);
                const imgData = canvas.toDataURL('image/png');

                pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
                pdf.save(fileName);
            });
        }
    };

    const handleDownloadSVG = (element: HTMLDivElement, styleFile: string) => {
        if (element)
            toSvg(element)
                .then(function (dataUrl) {
                    const link = document.createElement('a');
                    link.download = `chart.${styleFile}`;
                    link.href = dataUrl;
                    link.click();
                })
                .catch(function (error) {
                    console.error('Error generating image:', error);
                });
    };

    const pageStyle = `@media print {
        @page {
            size: 1500px 1100px !important;
            margin: 0;
            padding: 0
        }
    }`;

    return (
        <Spin spinning={isLoading}>
            {dataChart?.length ? (
                <div className="chart-experience-summary">
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: '1',
                                    label: (
                                        <ReactToPrint
                                            trigger={() => <Button type="link">Print Chart</Button>}
                                            content={() => chartRef.current}
                                            pageStyle={pageStyle}
                                        />
                                    )
                                },
                                {
                                    key: '2',
                                    label: (
                                        <Button type="link" onClick={() => chartRef.current && handleDownloadImagePNG_JPEG(chartRef.current, 'png')}>
                                            Download PNG Image
                                        </Button>
                                    )
                                },
                                {
                                    key: '3',
                                    label: (
                                        <Button type="link" onClick={() => chartRef.current && handleDownloadImagePNG_JPEG(chartRef.current, 'jpeg')}>
                                            Download JPEG Image
                                        </Button>
                                    )
                                },
                                {
                                    key: '4',
                                    label: (
                                        <Button type="link" onClick={() => chartRef.current && handleDownloadPDF(chartRef.current, 'pdf')}>
                                            Download PDF Document
                                        </Button>
                                    )
                                },
                                {
                                    key: '5',
                                    label: (
                                        <Button type="link" onClick={() => chartRef.current && handleDownloadSVG(chartRef.current, 'svg')}>
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
                    <div ref={chartRef} className="print-container">
                        <div className="chart-container">
                            <h3 className="text-align-center">TMA Solutions Year Of Experience Summary</h3>

                            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ReactECharts
                                    option={generateEChartOptions(dataChart || [], '')}
                                    style={{ width: 400, height: 300 }}
                                    opts={{ renderer: 'svg' }}
                                />
                                <div>
                                    {dataChart?.map((item, index) => (
                                        <p key={index}>
                                            {item.dcName === 'TMA Total' ? 'Total Employees TMA' : item.dcName}: {item.totalEmployee}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <ReactECharts option={barChartOptions} style={{ height: 600 }} opts={{ renderer: 'svg' }} />
                    </div>
                </div>
            ) : (
                <ReportNoData />
            )}
        </Spin>
    );
};

export default ChartExperienceSummary;
