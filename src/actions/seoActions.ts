
'use server';

import { revalidatePath } from 'next/cache';

export async function revalidatePage(path: string) {
    if (!path.startsWith('/')) {
        return { success: false, error: 'O caminho deve começar com /' };
    }
    
    try {
        revalidatePath(path);
        console.log(`Revalidated: ${path}`);
        return { success: true, error: null };
    } catch (error) {
        console.error(`Error revalidating path ${path}:`, error);
        return { success: false, error: 'Falha ao revalidar a página.' };
    }
}
