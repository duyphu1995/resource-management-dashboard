import DefaultLayout, { DefaultLayoutProps } from '@/components/common/layout/default-layout';
import Home from '@/pages';
import NotFoundPage from '@/pages/404';
import LoginPage from '@/pages/login';
import pathnames from '@/pathnames';
import adminRoutes from './admin';
import employeeContactRouter from './employee-contact';
import groupManagementRoutes from './group-management';
import hrManagementRoutes from './hr-management';
import reportsRoutes from './reports';
import transferEmployeeRoutes from './transfer-employee';
import resourcePlanRoutes from './resource-plan';

export interface IRoute {
    name: string;
    path: string;
    layout?: (props: DefaultLayoutProps) => JSX.Element;
    requiredLogin?: boolean; // Default: true
    element: <T>(props?: T) => JSX.Element | null;
    permission?: string;
}

const homeRoute: IRoute = {
    name: pathnames.home.name,
    path: pathnames.home.path,
    layout: DefaultLayout,
    element: Home
};

const loginRoute: IRoute = {
    name: pathnames.login.name,
    path: pathnames.login.path,
    requiredLogin: false,
    element: LoginPage
};

const notFoundRoute: IRoute = {
    name: pathnames.notFound.name,
    path: '*',
    requiredLogin: false,
    element: NotFoundPage
};

const routes: IRoute[] = [
    homeRoute,
    ...employeeContactRouter,
    ...hrManagementRoutes,
    ...transferEmployeeRoutes,
    ...groupManagementRoutes,
    ...adminRoutes,
    ...reportsRoutes,
    ...resourcePlanRoutes,
    notFoundRoute,
    loginRoute
];

export default routes;
