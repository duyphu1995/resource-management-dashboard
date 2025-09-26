import { IResponse } from '@/types/common';
import { IBaselineHeadcount, IBaselineHeadcountList, IExportBaselineHeadcount } from '@/types/reports/headcount-baseline-report';
import axiosClient from '../axios-client';

const apiURL = '/report';

const headcountBaselineService = {
    getHeadcountBaselineList: (params: IBaselineHeadcount, moduleName?: string): Promise<IResponse<IBaselineHeadcountList[]>> => {
        const url = apiURL + `/baselineHeadcount?year=${params.year}&week=${params.week}&unitTypeLevel=${params.unitTypeLevel}`;
        return axiosClient.get(url, { moduleName });
    },
    export: (params: IExportBaselineHeadcount, moduleName?: string): Promise<IResponse> => {
        const url = apiURL + `/baselineHeadcount/export?from=${params.from}&to=${params.to}&unitTypeLevel=${params.unitTypeLevel}`;
        return axiosClient.post(url, params, { responseType: 'blob', moduleName });
    }
};

export default headcountBaselineService;
