import React, { useState, useEffect } from "react";
import ContactList from "./ContactList";
import ChatWindow from "./ChatWindow";
import { userService } from "../../services/userService";
import messageService from "../../services/messageService";
import { useUserStore } from "../../stores/UserStore";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { username, setMessages, setUnreadCount, users, setUsers } = useUserStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersData = await userService.getAllUsers();
        const filteredUsers = usersData.filter((u) => u.username !== username);
        setUsers(filteredUsers);

        const historyData = await messageService.getHistory();

        const formattedHistory = historyData.map((m) => ({
          sender: m.sender,
          recipient: m.receiver,
          content: m.content,
          type: "CHAT",
          timestamp: m.timestamp,
          read: m.read,
        }));

        setMessages(formattedHistory);
        const unread = formattedHistory.filter(
          (m) => m.recipient === username && !m.read,
        ).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Erro ao carregar dados do Chat:", error);
      }
    };

    if (username) {
      loadData();
    }
  }, [username, setMessages, setUnreadCount, setUsers]);

  // Se o utilizador selecionado mudar de estado (ex: online/offline), 
  // precisamos de garantir que o objeto selectedUser no ChatWindow também é o mais recente da store.
  const currentUserSelected = users.find(u => u.id === selectedUser?.id) || selectedUser;

  return (
    <div
      className="container p-0 shadow-lg rounded-4 overflow-hidden mx-auto border-0"
      style={{
        height: "calc(100vh - 140px)",
        minHeight: "600px",
        maxWidth: "1200px",
        backgroundColor: "#2d3238", // Fundo unificado e escuro
      }}
    >
      <div className="row h-100 g-0">
        {/* COLUNA DA ESQUERDA (ContactList) */}
        <div
          className={`col-12 col-md-4 border-end h-100 d-flex flex-column ${selectedUser ? "d-none d-md-flex" : "d-flex"}`}
          style={{ 
            backgroundColor: "#2d3238", 
            borderColor: "rgba(255,255,255,0.1) !important" 
          }}
        >
          <div 
            className="px-4 border-bottom border-white border-opacity-10 d-flex align-items-center bg-dark bg-opacity-25 backdrop-blur flex-shrink-0" 
            style={{ height: "85px" }}
          >
            <h4 className="mb-0 fw-bold text-white d-flex align-items-center">
              <i className="bi bi-chat-left-text-fill text-primary me-3"></i>
              Mensagens
            </h4>
          </div>
          <ContactList
            users={users}
            onSelectUser={setSelectedUser}
            selectedUserId={selectedUser?.id}
            allMessages={useUserStore((state) => state.messages)}
            myUsername={username}
          />
        </div>

        {/* COLUNA DA DIREITA (ChatWindow) */}
        <div
          className={`col-12 col-md-8 h-100 ${selectedUser ? "d-flex flex-column" : "d-none d-md-flex"}`}
          style={{ backgroundColor: "#343a40" }}
        >
          {selectedUser ? (
            <ChatWindow
              selectedUser={currentUserSelected}
              onBack={() => setSelectedUser(null)}
            />
          ) : (
            <div className="m-auto text-center px-4 animate-fade-in">
              <div className="bg-dark bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow-sm" style={{ width: "120px", height: "120px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <i className="bi bi-chat-square-text text-primary display-4"></i>
              </div>
              <h3 className="fw-bold text-white mb-2">As Suas Conversas</h3>
              <p className="text-white-50 mx-auto" style={{ maxWidth: "300px" }}>
                Selecione um colega da equipa na lista lateral para começar a trocar mensagens em tempo real.
              </p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ChatPage;
