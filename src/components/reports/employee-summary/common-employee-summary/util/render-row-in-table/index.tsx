import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import { handleClickViewListOfNewWindow } from '@/utils/common';
import { Link } from 'react-router-dom';

interface RenderRowProps<T> {
    rows: T[];
    type: keyof T;
    onRowChildren?: 'link' | 'a' | 'div';
    generateUrl?: (doc: T) => string;
    boldRows?: string;
}

const RenderRow = <T extends Record<string, any>>({ rows, type, onRowChildren = 'div', generateUrl, boldRows }: RenderRowProps<T>) => {
    return (
        <table>
            <tbody>
                {rows.map((doc: any, index) => {
                    const isBold = boldRows && doc[boldRows] === true;

                    return (
                        <tr className="table-tr" key={index}>
                            <td className={`table-td align-center ${isBold ? 'font-weight-600' : ''}`}>
                                {onRowChildren === 'link' ? (
                                    <Link className="underline" to={generateUrl ? generateUrl(doc) : '#'} target="_blank">
                                        {renderWithFallback(doc[type], true, 40)}
                                    </Link>
                                ) : onRowChildren === 'a' ? (
                                    <a className="underline" onClick={() => generateUrl && handleClickViewListOfNewWindow(generateUrl(doc))}>
                                        {renderWithFallback(doc[type], true, 40)}
                                    </a>
                                ) : (
                                    renderWithFallback(doc[type], true, 40)
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default RenderRow;
