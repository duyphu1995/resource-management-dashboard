import PrintEditor from '@/components/common/print-editor';
import { IResignation } from '@/types/hr-management/resignation-management';
import dayjs from 'dayjs';

interface ITerminateEmploymentContractProps {
    data: IResignation | undefined;
}

const TerminateEmploymentContract = (props: ITerminateEmploymentContractProps) => {
    const {
        data: {
            companyName,
            fullName,
            companyOwner,
            companyAddress,
            companyPhone,
            companyFax,
            birthday,
            badgeId,
            applyDate,
            resignDate,
            permanentAddress,
            idCardNo,
            idCardIssuePlace,
            idCardIssueDate
        } = {}
    } = props;

    const currentDate = dayjs();

    const day = currentDate.date();
    const month = currentDate.format('MM');
    const year = currentDate.year();

    const terms = [
        {
            id: '1',
            title: 'Điều 1. Chấm dứt Hợp đồng lao động',
            children: [
                {
                    id: '1.1',
                    title: '1. ',
                    valueType: 'inline',
                    value: `Hai bên đồng ý tự nguyện thoả thuận về việc chấm dứt Hợp đồng lao động số ${badgeId} ký ngày ${applyDate} từ ngày ${resignDate}, tất cả các quyền, trách nhiệm, nghĩa vụ liên quan và các văn bản có chữ ký của hai bên sẽ tự động hết hiệu lực kể từ ngày chấm dứt Hợp đồng lao động.`
                },
                {
                    id: '1.2',
                    title: '2. ',
                    valueType: 'inline',
                    value: 'Lương và phụ cấp: Người lao động được thanh toán đầy đủ các khoản lương, phụ cấp và các chế độ khác (nếu có) theo quy định của pháp luật lao động và văn bản nội bộ của công ty.'
                }
            ]
        },
        {
            id: '2',
            title: 'Điều 2. Thỏa thuận khác',
            children: [
                {
                    id: '2.1',
                    title: '1. ',
                    valueType: 'inline',
                    value: `Căn cứ quy định của pháp luật lao động hiện hành, ông/ bà ${fullName?.toLocaleUpperCase()} không được nhận các khoản tiền nào khác ngoài những khoản tiền đã nêu tại Điều 1 của Thoả thuận này.`
                },
                {
                    id: '2.2',
                    title: '2. ',
                    valueType: 'inline',
                    value: 'Các khoản thuế thu nhập cá nhân phát sinh theo quy định của pháp luật Việt nam (nếu có) liên quan đến khoản hỗ trợ này do người lao động tự chi trả.'
                },
                {
                    id: '2.3',
                    title: '3. ',
                    valueType: 'inline',
                    value: 'Bắt đầu từ ngày ký thoả thuận này, hai bên cam kết sẽ không có bất kỳ khiếu nại, khởi kiện, hoặc bất cứ yêu cầu nào khác liên quan đến quyền, nghĩa vụ và trách nhiệm của hai bên theo hợp đồng lao động (đã được thoả thuận chấm dứt theo Điều 1 của văn bản này). Nếu không tự nguyện thực hiện cam kết này, bên vi phạm phải chịu hoàn toàn trách nhiệm trước pháp luật.'
                }
            ]
        },
        {
            id: '3',
            title: 'Điều 3. Hiệu lực thi hành',
            children: [
                {
                    id: '3.1',
                    title: '1. ',
                    valueType: 'inline',
                    value: 'Văn bản này có hiệu lực kể từ ngày ký.'
                },
                {
                    id: '3.2',
                    title: '2. ',
                    valueType: 'inline',
                    value: `Văn bản này là căn cứ hợp pháp để Công ty tiến hành thủ tục chấp dứt hợp đồng lao động với ông/bà ${fullName?.toLocaleUpperCase()} (theo quy định tại Khoản 3 Điều 34 Bộ luật Lao động 2019).`
                },
                {
                    id: '3.3',
                    title: '3. ',
                    valueType: 'inline',
                    value: `Các bộ phận có liên quan và ông/bà ${fullName?.toLocaleUpperCase()} có trách nhiệm thực hiện đúng các thoả thuận tại văn bản này.`
                },
                {
                    id: '3.4',
                    title: '4. ',
                    valueType: 'inline-jsx',
                    value: (
                        <>
                            Thoả thuận này được lập thành 03 (ba) bản, với chữ ký của người lao động, chữ ký của người đại diện Công ty và chữ ký của{' '}
                            <PrintEditor text="............" /> (người làm chứng)
                        </>
                    )
                },
                {
                    id: '3.5',
                    title: ' ',
                    valueTitle: 'none',
                    valueType: 'inline',
                    value: 'Các bên đồng ý rằng bản sao của văn bản này có giá trị pháp lý như bản gốc.'
                },
                {
                    id: '3.6',
                    title: ' ',
                    valueTitle: 'none',
                    valueType: 'inline',
                    value: `Với sự chứng kiến của người làm chứng, ông/bà ${fullName?.toLocaleUpperCase()} đồng ý rằng: <b>Bằng sự hiểu biết tốt nhất của mình, trong trạng thái tâm thần hoàn toàn tự nguyện và tỉnh táo, đã đọc kỹ toàn bộ văn bản này, hoàn toàn hiểu và đồng ý với mọi điều khoản của Biên bản thoả thuận này.</b>`
                }
            ]
        }
    ];

    const renderTerms = (list: any[]) => {
        return list.map((item, index) => {
            const { title, textStyle, valueType = 'body', valueTitle, value, children } = item;

            return (
                <div className="resignation-terms-item" key={'item_' + index}>
                    {title && (
                        <div className="resignation-terms-item-header" style={valueTitle && { paddingLeft: '12px' }}>
                            <span className="resignation-terms-item-title" style={{ fontStyle: textStyle }}>
                                {title}
                            </span>

                            {valueType === 'inline' && value && (
                                <span className="resignation-terms-item-value" dangerouslySetInnerHTML={{ __html: value }} />
                            )}
                            {valueType === 'inline-jsx' && value && <span className="resignation-terms-item-value">{value}</span>}
                        </div>
                    )}

                    {/* Value body */}
                    {valueType === 'body' && value && <div className="resignation-terms-item-body">{value}</div>}

                    {/* Children */}
                    {children && <div className="resignation-terms-item-body">{renderTerms(children)}</div>}
                </div>
            );
        });
    };

    return (
        <div className="resignation-print page-print">
            <div style={{ display: 'flex', gap: 20, justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'center' }}>{companyName}</div>
                </div>

                <div style={{ textAlign: 'center', width: 240, minWidth: 240 }}>
                    CỘNG HOÀ XÃ HỘI CHỦ NGHIÃ VIỆT NAM
                    <br />
                    Độc Lập - Tự Do - Hạnh Phúc
                    <br />
                    <span>----------</span>
                    <br />
                </div>
            </div>

            <div style={{ textAlign: 'end', marginTop: 10 }}>
                <PrintEditor text="........................." />, ngày {day} tháng {month} năm {year}
            </div>

            <div style={{ marginTop: 10, marginBottom: 10, fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>BIÊN BẢN THỎA THUẬN</div>

            <div style={{ marginTop: 10, marginBottom: 10, fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>
                Về việc tự nguyện thỏa thuận chấm dứt hợp đồng lao động theo
            </div>
            <div style={{ marginTop: 10, marginBottom: 10, fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>
                khoản 3 Điều 34 Bộ luật Lao Động 2019
            </div>

            <div style={{ textAlign: 'center', marginBottom: 10 }}>----------------------</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, lineHeight: '140%' }}>
                <i>Căn cứ khoản 3 Điều 34 Bộ Luật Lao Động năm 2019 và các văn bản hướng dẫn thi hành Bộ Luật Lao động;</i>

                <i>Căn cứ Hợp đồng lao động số {badgeId};</i>

                <i>
                    Căn cứ nguyện vọng, sự thỏa thuận và thống nhất ý chí giữa đại diện {companyName} (Ông/bà {companyOwner?.toLocaleUpperCase()}) và
                    người lao động (Ông/bà) <b style={{ fontStyle: 'normal', fontWeight: 600 }}>{fullName?.toLocaleUpperCase()}</b>
                </i>

                <i>
                    Với sự chứng kiến của: <PrintEditor text=".........................." />
                </i>

                <div>
                    Hôm nay, vào hồi <PrintEditor text="............." /> Phút <PrintEditor text="..........." />, ngày {`${day}-${month}-${year}`}{' '}
                    tại phòng Nhân Sự, {companyName} đã thỏa thuận với ông/bà {fullName?.toLocaleUpperCase()} về việc chấm dứt hợp đồng lao động. Cụ
                    thể như sau:
                </div>

                <div>Bản thỏa thuận chấm dứt Hợp đồng lao động này (Sau đây gọi tắt là “Thỏa thuận”) được lập giữa các bên sau đây:</div>

                <div>
                    <strong>{companyName}</strong>
                </div>

                <div>Địa chỉ: {companyAddress}</div>

                <div>
                    Điện thoại: {companyPhone} Fax: {companyFax}
                </div>

                <div>
                    Người đại diện bởi: <strong>{companyOwner?.toLocaleUpperCase()}</strong>
                </div>

                <div>
                    Quốc tịch: <PrintEditor text="Việt Nam" />
                </div>

                <div>Chức vụ: Giám đốc</div>

                <div>Và</div>

                <div>
                    Ông/Bà: <strong>{fullName?.toLocaleUpperCase()}</strong> (Sau đây gọi tắt là “Người lao động”)
                </div>

                <div>Công việc/ chức danh: Lập trình viên</div>

                <div>
                    Quốc tịch: <PrintEditor text="Việt Nam" />
                </div>

                <div>
                    Sinh ngày: <PrintEditor text={birthday} />
                </div>

                <div>
                    Hộ khẩu thường trú: <PrintEditor text={permanentAddress} />
                </div>

                <div>
                    Số CMND/CCCD: <PrintEditor text={idCardNo} />, Ngày cấp: <PrintEditor text={idCardIssueDate} />, Nơi cấp:{' '}
                    <PrintEditor text={idCardIssuePlace} />
                </div>

                <div>Nội dung thỏa thuận</div>

                {/* Terms */}
                <div className="resignation-terms">{renderTerms(terms)}</div>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div>
                            <b>NGƯỜI LAO ĐỘNG</b>
                        </div>
                        <i>(Ký xác nhận về việc tự nguyện đồng ý)</i>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div>
                            <b>NGƯỜI LÀM CHỨNG</b>
                        </div>
                        <div style={{ marginTop: 80 }}>
                            <PrintEditor text=".........................." />
                        </div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div>
                            <b>GIÁM ĐỐC</b>
                        </div>
                        <div style={{ marginTop: 80, textTransform: 'uppercase' }}>
                            <b>{companyOwner?.toLocaleUpperCase()}</b>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TerminateEmploymentContract;
