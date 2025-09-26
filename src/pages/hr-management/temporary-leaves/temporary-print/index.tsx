import PrintEditor from '@/components/common/print-editor';
import temporaryLeaveService from '@/services/hr-management/temporary-management';
import { ITemporaryDetail } from '@/types/hr-management/temporary-leaves';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

const TemporaryLeavePrintPage = () => {
    const { id = '' } = useParams();

    const [data, setData] = useState<ITemporaryDetail>();

    const currentDate = dayjs();

    const day = currentDate.date();
    const month = currentDate.format('MM');
    const year = currentDate.year();

    useEffect(() => {
        const fetchData = async () => {
            const res = await temporaryLeaveService.getTemporaryDetail(Number(id));

            const { succeeded, data } = res;

            if (succeeded && data) {
                setData(data);
            }
        };

        fetchData();
    }, [id]);

    return (
        <div className="page-print contract-contractor-print">
            <div
                style={{
                    display: 'flex',
                    gap: 20,
                    justifyContent: 'space-between'
                }}
            >
                <div>
                    <div style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'center' }}>
                        {data?.companyName || '...'}
                    </div>
                </div>

                <div style={{ textAlign: 'center', width: 240, minWidth: 240 }}>
                    CỘNG HOÀ XÃ HỘI CHỦ NGHIÃ VIỆT NAM
                    <br />
                    Độc Lập - Tự Do - Hạnh Phúc
                    <br />
                    <span>----------</span>
                    <br />
                    <br />
                    <span>
                        <PrintEditor text='................' />, ngày {day} tháng {month} năm {year}
                    </span>
                </div>
            </div>

            <div style={{ marginTop: 20, marginBottom: 5, fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>BẢN THỎA THUẬN</div>

            <div style={{ textAlign: 'center', marginBottom: 5 }}>V/v Nghỉ tạm thời không lương</div>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                Số: <PrintEditor text={data?.badgeId} />
                /{year}/TMA
            </div>

            <div>
                <div>
                    <i>Căn cứ Bộ luật Lao động 2012;</i>
                </div>
                <div>
                    <i>
                        Căn cứ Hợp đồng lao động số <PrintEditor text={data?.badgeId} />; Ký ngày: <PrintEditor text={data?.startDate} />
                    </i>
                </div>
                <div>
                    <i>Căn cứ nguyện vọng và thỏa thuận giữa 2 bên</i>
                </div>

                <br />

                <div style={{ marginLeft: 20 }}>
                    <div>
                        <b>
                            Chúng tôi một bên là: <br />{' '}
                            <span style={{ textTransform: 'uppercase' }}>{data?.companyName || '...'}</span>
                        </b>
                    </div>

                    <div>Địa chỉ: {data?.companyAddress || '...'}</div>

                    <div style={{ display: 'flex' }}>
                        <span style={{ flex: 2 }}>Điện thoại: {data?.companyPhone || '...'}</span>
                        <span style={{ flex: 1 }}>Fax: {data?.companyFax || '...'}</span>
                    </div>

                    <div style={{ display: 'flex' }}>
                        <span style={{ flex: 2 }}>Đại diện: {data?.companyOwner || '...'}</span>
                        <span style={{ flex: 1 }}>Chức vụ: {data?.ownerPosition || '...'}</span>
                    </div>

                    <div>Dưới đây gọi tắt là "Công ty"</div>

                    <br />

                    <div>
                        <b>Và một bên là:</b>
                    </div>

                    <div>
                        Họ và tên:{' '}
                        <b>
                            <PrintEditor text={data?.fullName} display="inline" />
                        </b>{' '}
                        Mã số NV: <PrintEditor text={data?.badgeId} display="inline" /> Dự án:{' '}
                        <PrintEditor text={data?.projectName} display="inline" />
                    </div>
                    <div>
                        Ngày sinh: <PrintEditor text={data?.birthday || '...'} display="inline" /> Tại:{' '}
                        <PrintEditor text={data?.birthPlace || '...'} display="inline" />
                    </div>

                    <div>
                        Được Công ty tuyển dụng theo HĐLĐ số <PrintEditor text={data?.badgeId || '...'} display="inline" /> Ngày:{' '}
                        <PrintEditor text={data?.startDate || '...'} display="inline" />
                    </div>

                    <br />
                    <br />

                    <div style={{ textAlign: 'center' }}>
                        <b>Nay đồng ý cam kết làm đúng những điều khoản sau đây:</b>
                    </div>

                    <br />

                    <div style={{ display: 'flex' }}>
                        <b style={{ flex: 1 }}>Điều 1:</b>
                        <span style={{ flex: 8 }}>
                            Ông bà{' '}
                            <b>
                                <PrintEditor text={data?.fullName || '...'} display="inline" />
                            </b>{' '}
                            xin nghỉ không lương từ ngày <PrintEditor text={data?.startDate || '...'} display="inline" /> đến ngày{' '}
                            <PrintEditor text={data?.endDate || '...'} display="inline" />
                        </span>
                    </div>

                    <br />

                    <div style={{ display: 'flex' }}>
                        <b style={{ flex: 1 }}>Điều 2:</b>
                        <span style={{ flex: 8 }}>
                            Hai bên có trách nhiệm thực hiện nghiêm chỉnh tất cả các điều khoản trong bản thỏa thuận này <br /> <br />
                            Bản thỏa thuận được lập thành 2 bản, có hiệu lực từ ngày{' '}
                            <PrintEditor text={data?.startDate || '...'} display="inline" />
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', marginTop: 24 }}>
                        <div>
                            <div style={{ textAlign: 'center' }}>
                                <b>Người lao động</b>
                                <br />
                                <span>(Ký tên)</span>
                            </div>
                            <div style={{ marginTop: 108, textTransform: 'uppercase' }}>
                                <b>{data?.fullName}</b>
                            </div>
                        </div>

                        <div>
                            <div style={{ textAlign: 'center' }}>
                                <b>
                                    Người sử dụng lao động <br /> {data?.companyName || '...'} <br /> Giám đốc <br />
                                </b>
                                (Ký tên và đóng dấu)
                            </div>
                            <div style={{ marginTop: 80, textTransform: 'uppercase', textAlign: 'center' }}>
                                <b>{data?.companyOwner || '...'}</b>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemporaryLeavePrintPage;
