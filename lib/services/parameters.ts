// lib/services/parameters.ts
export const createParameter = async (category: string, type: string, data: any) => {
    const response = await fetch(`/api/${category}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const updateParameter = async (category: string, type: string, id: string, data: any) => {
    const response = await fetch(`/api/${category}/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const deleteParameter = async (category: string, type: string, id: string) => {
    const response = await fetch(`/api/${category}/${type}/${id}`, {
        method: 'DELETE',
    });
    return response.json();
};