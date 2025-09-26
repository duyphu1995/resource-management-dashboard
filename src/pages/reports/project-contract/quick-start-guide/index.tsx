import projectContractReport from '@/pathnames/reports/project-contract';
import './index.scss';
import { Link } from 'react-router-dom';
import { downloadFile } from '@/utils/common';
import employeeService from '@/services/hr-management/employee-management';
import useNotify from '@/utils/hook/useNotify';

export const QuickStartGuide = () => {
    const { showNotification } = useNotify();

    const handleDownload = async () => {
        try {
            const response = await employeeService.downloadSkipperRecord('Contracts_Information_Import.xlsx');
            downloadFile(response, 'Quick_Start_Guide.xlsx');
            showNotification(true, 'Export Successfully');
        } catch (error) {
            showNotification(false, 'Export failed. Please try again later');
        }
    };

    return (
        <div className="quick-start-guide">
            <header className="quick-start-guide__header">
                <Link to="/" className="header__logo">
                    <img className="header__logo-img" src="/media/logo.png" height={32} alt="TMA Solutions - HRM Tool" />
                    HRM TOOL
                </Link>
            </header>
            <main className="quick-start-guide__body">
                <h1>{projectContractReport.quickStartGuide.name}</h1>
                <section className="project-info">
                    <h3>Project Contract Information:</h3>
                    <ul className="project-info__list">
                        <li>Import files are required</li>
                        <li>Upload valid file formats (.xlsx or .xls)</li>
                        <li>Do not change the column order</li>
                        <li>Do not change the sheet name</li>
                        <li>All date fields should be in dd-MM-YY format (27-Jun-17)</li>
                        <li>
                            Sample Contract Information Import Excel file:
                            <button className="download-btn" onClick={handleDownload}>
                                Download
                            </button>
                        </li>
                    </ul>
                </section>
            </main>
            <footer className="quick-start-guide__footer">
                TMA Solutions HRM Tool | For questions, suggestions or bug reports please send email to pmo_tools@tma.com.vn or call extension 5753
            </footer>
        </div>
    );
};
