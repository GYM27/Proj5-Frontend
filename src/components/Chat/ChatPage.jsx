import React, { useState, useEffect } from "react";
import ContactList from "./ContactList"; // Importa o filho 1
import ChatWindow from "./ChatWindow"; // Importa o filho 2
import { userService } from "../../services/userService"; // Ajusta o caminho conforme a tua pasta

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]); // Aqui guardas os users que vêm do Java

  // 1. Lógica para carregar os utilizadores REAIS do Java
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // AGORA SIM: Chamamos o serviço que estava "sem uso"
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Erro ao carregar utilizadores:", error);

        // Opcional: Se o Java falhar, manter os fictícios para não ficar vazio no teste
        setUsers([
          {
            id: 1,
            username: "admin",
            firstName: "Admin",
            lastName: "Sistema",
            userRole: "ADMIN",
          },
          {
            id: 2,
            username: "gestor",
            firstName: "Luis",
            lastName: "Silva",
            userRole: "MANAGER",
          },
        ]);
      }
    };

    loadUsers();
  }, []);

  return (
    <div
      className="container-fluid bg-white"
      style={{ height: "calc(100vh - 70px)" }}
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
