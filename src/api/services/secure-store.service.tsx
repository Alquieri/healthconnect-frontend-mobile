import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = "com.healthconnect.auth.token";

export const saveToken = async (token: string): Promise<void> => {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
        throw new Error('Não foi possível salvar a sessão.');
    }
};

export const getToken = async (): Promise<string | null> => {
    try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        return token;
    } catch (error) {
        throw new Error('Não foi possível recuperar a sessão.');
    }
};

export const deleteToken = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('SecureStore: Erro ao deletar o token.', error);
    }
};