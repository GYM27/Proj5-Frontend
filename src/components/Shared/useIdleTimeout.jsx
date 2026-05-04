import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/UserStore';
import api from '../../services/api';

/**
 * HOOK: useIdleTimeout
 * -------------------
 * DESCRIÇÃO: Monitoriza a inatividade do utilizador através de eventos do browser.
 * FUNCIONALIDADE: Após X minutos de inatividade, executa o logout automático no
 * frontend e notifica o backend para invalidar o token (Segurança).
 * 
 * @param {number} timeoutMinutes - Tempo limite em minutos antes do logout (Default: 15).
 */
const useIdleTimeout = (timeoutMinutes = 15) => {
    const navigate = useNavigate();
    const { isAuthenticated, clearUser } = useUserStore();
    const timeoutRef = useRef(null);

    const handleLogout = useCallback(async () => {
        console.warn("Inatividade detetada. A terminar sessão...");
        try {
            // Se existir rota no backend para logout, avisamos a API para invalidar o token
            await api('/auth/logout', 'POST');
        } catch (e) {
            console.warn("Logout no backend falhou (provavelmente token já expirado ou rota inexistente).");
        } finally {
            clearUser();
            sessionStorage.removeItem("token");
            navigate('/login');
        }
    }, [clearUser, navigate]);

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        if (isAuthenticated) {
            timeoutRef.current = setTimeout(handleLogout, timeoutMinutes * 60 * 1000);
        }
    }, [isAuthenticated, handleLogout, timeoutMinutes]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];

        if (isAuthenticated) {
            resetTimer(); // Inicia o timer
            
            // Adiciona listeners para detetar atividade
            events.forEach(event => {
                window.addEventListener(event, resetTimer);
            });
        }

        // Limpeza ao desmontar ou se o user fizer logout manualmente
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [isAuthenticated, resetTimer]);
};

export default useIdleTimeout;
