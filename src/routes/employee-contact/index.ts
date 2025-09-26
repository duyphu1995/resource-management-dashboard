import { IRoute } from '..';
import contactSearchRoutes from './contact-search';
import myProfileRoutes from './my-profile';
import updateIdCardRoutes from './update-id-card';

const employeeContactRouter: IRoute[] = [...contactSearchRoutes, ...updateIdCardRoutes, ...myProfileRoutes];

export default employeeContactRouter;
