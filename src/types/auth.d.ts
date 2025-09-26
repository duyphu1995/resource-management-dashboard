export interface ICurrentUser {
    badgeId: string;
    workEmail: string;
    userName: string;
    employeeImageUrl: string;
    employeeId: number;
    firstName: string;
    jwToken: string;
    lastName: string;
    positionName: string;
    project: string;
    roles: string[];
    userName: string;
    projectId: string;
    loginCASUrl?: string;
    logoutCASUrl?:string;
}

export interface Auth {
    loading: boolean;
    currentUser: ICurrentUser | null;
    expiredToken: boolean;
}

export interface Login {
    email: string;
    password: string;
    isRemember?: boolean;
}

export interface IPermission {
    id: number;
    name: string;
    children: IPermission[];
    subMenus?: IPermission[];
    sections: ISection[];
}

export interface IMenuList {
    menus: IPermission[],
    roleName: string,
    roleGroupId: number,
}


export interface ISection {
    id: number;
    isDataLimit: boolean;
    isShowRestrictData: boolean;
    isShowSensitiveData: boolean
    name: string;
}


