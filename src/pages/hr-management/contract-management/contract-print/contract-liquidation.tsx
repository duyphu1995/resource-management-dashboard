import PrintEditor from '@/components/common/print-editor';
import pathnames from '@/pathnames';
import contractService from '@/services/hr-management/contract-management';
import { IContract } from '@/types/hr-management/contract-management';
import { TIME_FORMAT } from '@/utils/constants';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const ContractPrintLiquidationPage = () => {
    const { contractId = '' } = useParams();
    const [data, setData] = useState<IContract | undefined>();
    const pathname = useLocation().pathname;
    const navigation = useNavigate();
    const nowDate = dayjs();
    const moduleName = 'PrintTemporaryLeaves';

    // Fetch liquidation contract data
    useEffect(() => {
        const fetchData = async () => {
            const res = await contractService.getContractDetail(contractId, moduleName);
            const { succeeded, data } = res;
            const errorURL = pathnames.notFound + '?url=' + pathname;

            if (succeeded) {
                // Contract type is 'Indefinite Contract'
                // Go to Not Found page
                if (!data?.endDate) navigation(errorURL);
                else setData(data); // Set contract data
            } else navigation(errorURL);
        };

        fetchData();
    }, [contractId, pathname, navigation]);

    return (
        <div className="contract-print page-print">
            <style dangerouslySetInnerHTML={{ __html: `@page { margin: 40px 0; }` }}></style>
            <div style={{ lineHeight: '150%' }}>
                <b>
                    <center>
                        <span style={{ textTransform: 'uppercase' }}>{data?.companyName}</span>
                        <br />
                        <span style={{ textTransform: 'uppercase' }}>{data?.companyNameEN}</span>
                    </center>
                </b>
            </div>

            <div style={{ height: 1, background: '#323232', width: 300, margin: '6px auto' }}></div>

            <div style={{ fontSize: 10, fontStyle: 'italic', textAlign: 'center' }}>Địa chỉ: {data?.companyAddress}</div>
            <div style={{ margin: '20px 50px 0 0', fontSize: 10, textAlign: 'right', fontStyle: 'italic' }}>
                <PrintEditor textTransform="capitalize" />, ngày <PrintEditor text={nowDate.format('DD')} /> tháng{' '}
                <PrintEditor text={nowDate.format('MM')} /> năm <PrintEditor text={nowDate.format('YYYY')} />
            </div>
            <div style={{ textAlign: 'center', fontWeight: 600, margin: '18px 0 6px 0', fontSize: 14 }}>
                BIÊN BẢN THỎA THUẬN
                <br />
                CHẤM DỨT HỢP ĐỒNG LAO ĐỘNG
            </div>
            <div style={{ textAlign: 'center', fontStyle: 'italic', fontWeight: 600 }}>
                Số: {data?.badgeId}/<PrintEditor text={dayjs(data?.startDate, TIME_FORMAT.VN_DATE).format('YYYY')} />
                /TMA
            </div>
            <div style={{ marginTop: 12, fontStyle: 'italic' }}>
                Căn cứ thời hạn HĐLĐ số: {data?.badgeId}. Ký ngày: {data?.startDate}
                <br />
                Theo đề nghị của Trưởng bộ phận/ Quản lý dự án.
                <br />
                Theo đề nghị của Ông/ Bà phụ trách nhân sự
            </div>
            <div style={{ fontSize: 12 }}>
                <div style={{ marginTop: 12, fontStyle: 'italic', fontWeight: 600 }}>Chúng tôi, một bên là:</div>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{data?.companyName}</div>
                <div>Địa chỉ: {data?.companyAddress}</div>
                <div>Điện thoại: {data?.companyPhone}</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                    <div>Đại diện: {data?.companyOwner}</div>
                    <div style={{ width: '50%' }}>
                        Chức vụ: <PrintEditor text={data?.ownerPosition} textTransform="capitalize" />
                    </div>
                </div>
                <div>Dưới đây gọi tắt là “{data?.companyAcronym}”</div>
            </div>

            <div style={{ fontSize: 12 }}>
                <div style={{ marginTop: 12, fontStyle: 'italic', fontWeight: 600 }}>Và một bên là:</div>
                <div>
                    Họ và tên: <PrintEditor text={data?.fullName} textTransform="uppercase" />, Mã số NV: {data?.badgeId}, Dự án:{' '}
                    <PrintEditor text={data?.projectName} />
                </div>
                <div>
                    Sinh năm: <PrintEditor text={data?.birthday} />, Tại: <PrintEditor text={data?.birthPlace} textTransform="capitalize" />. CMND số:{' '}
                    <PrintEditor text={data?.idCardNo} />, Cấp ngày: <PrintEditor text={data?.idCardIssueDate} />. Tại:{' '}
                    <PrintEditor text={data?.idCardIssuePlace} textTransform="capitalize" />
                </div>
                <div>
                    Nơi đăng ký hộ khẩu thường trú: <PrintEditor text={data?.contactAddress} />
                </div>
                <div>
                    Được {data?.companyAcronym} tuyển dụng theo HĐLĐ số {data?.badgeId}, ký ngày: {data?.startDate}
                </div>
            </div>

            <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 10, fontWeight: 600, textAlign: 'center' }}>Nay thỏa thuận thống nhất như sau:</div>
                <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 50, fontWeight: 600 }}>Điều 1</div>
                    <div style={{ flex: 1 }}>
                        Kết thúc và thanh lý Hợp đồng lao động số {data?.badgeId}, ký ngày {data?.startDate} giữa Ông/ bà{' '}
                        <span style={{ textTransform: 'uppercase' }}>{data?.fullName}</span> và {data?.companyAcronym} kể từ ngày 13-12-2022.
                    </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
                    <div style={{ width: 50, fontWeight: 600 }}>Điều 2</div>
                    <div style={{ flex: 1 }}>
                        <div>
                            Các quyền và nghĩa vụ của 02 bên liên quan đến Hợp đồng lao động số {data?.badgeId} ký ngày {data?.startDate} chấm dứt kể
                            từ ngày ký biên bản thỏa thuận này.
                        </div>
                        <div style={{ marginTop: 20 }}>
                            Biên bản được lập thành 02 bản, mỗi bên giữ 01 bản, có giá trị như nhau và có hiệu lực từ ngày 13-12-2022 .
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: 'fit-content', textAlign: 'center' }}>
                    <div style={{ fontWeight: 600 }}>Người lao động</div>
                    <div>(ký tên, ghi rõ họ tên)</div>
                </div>

                <div style={{ width: 200, textAlign: 'center' }}>
                    <div style={{ fontWeight: 600 }}>
                        <div>Người sử dụng lao động</div>
                        <div style={{ textTransform: 'uppercase' }}>{data?.companyName}</div>
                        <PrintEditor text={data?.ownerPosition} />
                    </div>
                    <div style={{ marginTop: 80, fontWeight: 600, textTransform: 'capitalize' }}>{data?.companyOwner}</div>
                </div>
            </div>
        </div>
    );
};

export default ContractPrintLiquidationPage;
