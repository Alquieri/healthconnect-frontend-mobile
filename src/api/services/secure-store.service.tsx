import * as SecureStore from 'expo-secure-store';
import { logout } from './auth';
const TOKEN_KEY = "com.healthconnect.auth.token";

export const saveToken = async (token: string): Promise<void> => {
    try {
        console.log('[SecureStore] 💾 Salvando token...');
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        console.log('[SecureStore] ✅ Token salvo com sucesso');
    } catch (error) {
        console.error('[SecureStore] ❌ Erro ao salvar token:', error);
        throw new Error('Não foi possível salvar a sessão.');
    }
};

export const getToken = async (): Promise<string | null> => {
    try {
        console.log('[SecureStore] 🔍 Buscando token...');
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
            console.log('[SecureStore] ✅ Token encontrado');
            return token;
        } else {
            console.log('[SecureStore] ❌ Nenhum token encontrado');
            return null;
        }
    } catch (error) {
        console.error('[SecureStore] ❌ Erro ao recuperar token:', error);
        return null;
    }
};

export const deleteToken = async (): Promise<void> => {
    try {
        console.log('[SecureStore] 🗑️ Deletando token...');
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        console.log('[SecureStore] ✅ Token deletado com sucesso');
    } catch (error) {
        console.error('[SecureStore] ❌ Erro ao deletar token:', error);
    }
};

export const hasToken = async (): Promise<boolean> => {
    try {
        const token = await getToken();
        return !!token;
    } catch (error) {
        console.error('[SecureStore] ❌ Erro ao verificar token:', error);
        return false;
    }
};