import { IRoute } from '../..';
import companyAppendixRoutes from './company-appendix';
import employeeAppendixRoutes from './employee-appendix';
import groupManagementAppendixRoutes from './group-management-appendix';

const appendixRoutes: IRoute[] = [...companyAppendixRoutes, ...employeeAppendixRoutes,...groupManagementAppendixRoutes];

export default appendixRoutes;
