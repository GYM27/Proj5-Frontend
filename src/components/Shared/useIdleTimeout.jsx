import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/UserStore';
import api from '../../services/api';

const useIdleTimeout = (timeoutMinutes = 15) => {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useUserStore();
    const timeoutRef = useRef(null);

    const handleLogout = useCallback(async () => {
        try {
            // Se existir rota no backend para logout, avisamos a API para invalidar o token
            await api('/auth/logout', 'POST');
        } catch (e) {
            console.warn("Logout no backend falhou (provavelmente token já expirado).");
        } finally {
            logout();
            sessionStorage.clear();
            navigate('/login');
        }
    }, [logout, navigate]);

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
