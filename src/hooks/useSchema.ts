import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface DatabaseSchema {
    // Define schema interfaces based on what's needed for the tree view
    database_name: string;
    tables: {
        table_name: string;
        columns: { name: string; type: string; }[];
    }[];
}

// Since useMockState just had a 'schema' object which was a list of strings or objects, 
// we'll assume the API returns a structured schema.
// For now, let's type it loosely or match the mock if possible.
// MockState schema was: { [db: string]: { [table: string]: string[] } } or similar?
// Let's assume API returns a standard schema structure.

export const useSchema = (instanceId?: string | null) => {
    return useQuery({
        queryKey: ['schema', instanceId],
        queryFn: async () => {
            if (!instanceId) return [];
            const res = await apiClient.get('/schema', { params: { instanceId } });
            // Schema is likely an object { db: [tables] }
            return res.data.data || res.data;
        },
        enabled: !!instanceId,
        initialData: [] // Fallback
    });
};
