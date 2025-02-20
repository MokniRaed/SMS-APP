import api from "../axios";

// lib/services/parameters.ts
export const createParameter = async (category: string, type: string, data: any) => {
    const lowerType = type.toLocaleLowerCase()
    const lowerCategory = category.toLocaleLowerCase()
    const response = await api.post(`/${lowerCategory}/${lowerType}`, data);
    return response.data;
};

export const updateParameter = async (category: string, type: string, id: string, data: any) => {
    const response = await api.patch(`/${category}/${type}/${id}`, data);
    return response.data;
};

export const deleteParameter = async (category: string, type: string, id: string) => {
    const response = await api.delete(`/${category}/${type}/${id}`,);
    return response.data;
};