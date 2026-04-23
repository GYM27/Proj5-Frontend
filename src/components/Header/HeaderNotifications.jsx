import React from "react";
import { useUserStore } from "react";


const NotificationIcon = () => { 

    const { unreadCount, resetUnreadCount } = useUserStore();

    const handleClick = () => {

        resetUnreadCount();
        console.log("Notificações lidas!");
    };

  return (
        <div className="relative cursor-pointer p-2" onClick={handleClick}>
            {/* Ícone do Sino */}
            <Bell className="w-6 h-6 text-gray-600 hover:text-blue-500 transition-colors" />

            {/* O Badge (Bolinha Vermelha) - Só aparece se houver notificações */}
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </div>
    );
};

export default NotificationIcon;