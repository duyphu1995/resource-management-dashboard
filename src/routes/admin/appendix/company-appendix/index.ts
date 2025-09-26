import { IRoute } from '@/routes';
import companyRoutes from './company';
import contractSalaryRoutes from './contract-salary';

const companyAppendixRoutes: IRoute[] = [...companyRoutes, ...contractSalaryRoutes];

export default companyAppendixRoutes;
