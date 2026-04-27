import React, { useState, useEffect } from "react";
import ContactList from "./ContactList"; // Importa o filho 1
import ChatWindow from "./ChatWindow"; // Importa o filho 2
import { userService } from "../../services/userService";
import messageService from "../../services/messageService";
import { useUserStore } from "../../stores/UserStore";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]); // Aqui guardas os users que vêm do Java
  const { username, resetUnread, setMessages, setUnreadCount } = useUserStore();

  // 1. Lógica para carregar os utilizadores REAIS e o HISTÓRICO
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carrega Contactos
        const usersData = await userService.getAllUsers();
        const filteredUsers = usersData.filter(u => u.username !== username);
        setUsers(filteredUsers);

        // Carrega Histórico de Mensagens da Base de Dados
        const historyData = await messageService.getHistory();
        
        // Mapeamos para o formato que a Store espera
        const formattedHistory = historyData.map(m => ({
          sender: m.sender,
          recipient: m.receiver,
          content: m.content,
          type: "CHAT",
          timestamp: m.timestamp,
          read: m.read
        }));
        
        setMessages(formattedHistory);

        // Calcula notificações (mensagens onde sou o destinatário e estão como não lidas)
        const unread = formattedHistory.filter(m => m.recipient === username && !m.read).length;
        setUnreadCount(unread);

      } catch (error) {
        console.error("Erro ao carregar dados do Chat:", error);
      }
    };

    if (username) {
      loadData();
    }
  }, [username, setMessages, setUnreadCount]);

  return (
    <div
      className="container p-0 shadow rounded-4 overflow-hidden mx-auto bg-white border"
      style={{ 
        height: "calc(100vh - 240px)", 
        minHeight: "500px",
        maxWidth: "1100px" 
      }}
    >
      <div className="row h-100 g-0">
        {/* COLUNA DA ESQUERDA (ContactList) */}
        <div
          className={`col-12 col-md-4 border-end h-100 ${selectedUser ? "d-none d-md-block" : "d-block"}`}
        >
          <div className="p-3 border-bottom bg-light">
            <h5 className="mb-0 fw-bold">Mensagens</h5>
          </div>
          <ContactList
            users={users}
            onSelectUser={setSelectedUser}
            selectedUserId={selectedUser?.id}
            allMessages={useUserStore(state => state.messages)}
            myUsername={username}
          />
        </div>

       {/* COLUNA DA DIREITA (ChatWindow) */}
<div className={`col-12 col-md-8 h-100 ${selectedUser ? "d-flex" : "d-none d-md-flex"}`}>
  {selectedUser ? (
    <ChatWindow
      selectedUser={selectedUser} // OBRIGATÓRIO: Passar o user selecionado
      onBack={() => setSelectedUser(null)} 
    />
  ) : (
    <div className="m-auto text-center text-muted">
      <i className="bi bi-chat-dots fs-1 d-block mb-2"></i>
      <p>Selecione um contacto para iniciar a conversa.</p>
    </div>
  )}
</div>
      </div>
    </div>
  );
};

export default ChatPage;
