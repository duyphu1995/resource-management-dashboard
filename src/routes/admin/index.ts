import { IRoute } from '..';
import appendixRoutes from './appendix';
import emailSubscription from './email-subscription';
import roleAndPermissionRoutes from './role-and-permission';

const adminRoutes: IRoute[] = [...roleAndPermissionRoutes,...appendixRoutes, ...emailSubscription];

export default adminRoutes;
