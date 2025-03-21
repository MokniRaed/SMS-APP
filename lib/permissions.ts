export const canEditOrder = (user: any, orderStatus: string): boolean => {
    if (user?.role === 'admin') {
        return "67b164ea14c46c093c5f3f74" === orderStatus;
    }
    if (['CLIENT', 'COLLABORATEUR'].includes(user?.role)) {
        return orderStatus === 'VALIDATED';
    }
    return false;
};

export const canViewOrderLine = (user: any, line: any): boolean => {
    return user?.role === 'client' || line.quantite_valid > 0;
};
