export interface IExternalCertificateSummaryReport {
    dgName: string;
    headcount: number;
    totalCertificates: number;
    dgId: number;
    certificateTypeIds?: string;
}

export interface IExternalCertificateOverview {
    totalHeadCount: number;
    totalPercentageHeadcount: number;
    totalCertificates: number;
    totalPercentageCertificate: number;
}

export interface IExternalCertificateStatistic {
    certificateCatName: string;
    totalCertificate: number;
}
