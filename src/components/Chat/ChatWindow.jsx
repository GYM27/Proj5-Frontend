import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "../../stores/UserStore";
import api from "../../services/api";
import messageService from "../../services/messageService";

const ChatWindow = ({ selectedUser, onBack }) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const messages = useUserStore((state) => state.messages);
  const myUsername = useUserStore((state) => state.username);

  // Filtra as mensagens: apenas as trocadas entre "Eu" e o "Selecionado"
  const chatHistory = messages.filter(
    (m) =>
      m.type === "CHAT" &&
      ((m.sender === myUsername && m.recipient === selectedUser.username) ||
        (m.sender === selectedUser.username && m.recipient === myUsername)),
  );

  // 1. Scroll automático
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // 2. Lógica de marcação de leitura
  useEffect(() => {
    const hasUnread = chatHistory.some(m => m.sender === selectedUser.username && !m.read);
    
    if (hasUnread) {
      const markAsRead = async () => {
        try {
          await messageService.markAsRead(selectedUser.username);
          
          const currentMessages = useUserStore.getState().messages;
          const updatedMessages = currentMessages.map(m => 
            (m.sender === selectedUser.username && m.recipient === myUsername) 
            ? { ...m, read: true } 
            : m
          );
          
          useUserStore.setState({ 
            messages: updatedMessages,
            unreadCount: updatedMessages.filter(m => m.recipient === myUsername && !m.read).length
          });
        } catch (error) {
          console.error("Erro ao marcar como lidas:", error);
        }
      };
      markAsRead();
    }
  }, [chatHistory, selectedUser.username, myUsername]);

  const { addMessage } = useUserStore();
 
  // FORMATADOR DE HORA: HH:mm
  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
 
  // FORMATADOR DE DIVISOR DE DATA: "Hoje", "Ontem" ou "27 abr."
  const formatDateDivider = (ts) => {
    if (!ts) return "Data Desconhecida";
    
    // Converte para data (suporta Number, String ISO, etc)
    const date = new Date(typeof ts === 'number' ? ts : ts);
    
    if (isNaN(date.getTime())) return "Histórico";

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
 
    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";
    
    // Retorna ISO8601 (YYYY-MM-DD) para datas históricas
    return date.toISOString().split('T')[0];
  };
 
  const handleSend = async () => {
    if (!input.trim()) return;
 
    const messageContent = input.trim();
    const timestamp = Date.now();
    setInput(""); 
 
    try {
      const payload = {
        receiver: selectedUser.username,
        content: messageContent,
        type: "CHAT"
      };
 
      await api('/messages', 'POST', payload);
 
      addMessage({
        sender: myUsername,
        recipient: selectedUser.username,
        content: messageContent,
        type: "CHAT",
        timestamp: timestamp,
        read: false
      });
      
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };
 
  return (
    <div className="d-flex flex-column h-100 w-100 bg-white shadow-sm chat-window">
      {/* Header */}
      <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light-subtle">
        <div className="d-flex align-items-center">
          <button className="btn d-md-none me-2 border-0" onClick={onBack}>
            <i className="bi bi-arrow-left fs-4"></i>
          </button>
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center me-2" style={{width: '35px', height: '35px', fontSize: '0.8rem'}}>
              {selectedUser.firstName[0]}{selectedUser.lastName[0]}
            </div>
            <div>
              <h6 className="mb-0 fw-bold text-dark">
                {selectedUser.firstName} {selectedUser.lastName}
              </h6>
              <small className="text-success" style={{ fontSize: "0.75rem" }}> Online agora </small>
            </div>
          </div>
        </div>
      </div>
 
      {/* Área de Mensagens */}
      <div
        ref={scrollRef}
        className="flex-grow-1 p-4 overflow-auto d-flex flex-column"
        style={{ 
          backgroundColor: "#e8eaed", // Fundo mais escuro para destacar as bolhas
          scrollBehavior: "smooth",
          backgroundImage: "radial-gradient(#d1d5db 0.5px, transparent 0.5px)", // Padrão subtil de pontos
          backgroundSize: "20px 20px"
        }}
      >
        {chatHistory.length === 0 ? (
          <div className="my-auto text-center text-muted opacity-50">
            <i className="bi bi-chat-heart fs-1"></i>
            <p className="mt-2">Inicia uma conversa com {selectedUser.firstName}.</p>
          </div>
        ) : (
          chatHistory.map((msg, i) => {
            const isMe = msg.sender === myUsername;
            
            const showDateDivider = i === 0 || 
              new Date(chatHistory[i-1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();
 
            return (
              <React.Fragment key={i}>
                {showDateDivider && (
                  <div className="text-center my-4">
                    <span className="badge bg-white text-muted px-3 py-2 rounded-pill shadow-sm fw-normal" style={{fontSize: '0.75rem', border: '1px solid #dee2e6'}}>
                      {formatDateDivider(msg.timestamp)}
                    </span>
                  </div>
                )}
                
                <div className={`d-flex mb-2 ${isMe ? "justify-content-end" : "justify-content-start"}`}>
                  <div
                    className={`p-2 px-3 shadow-sm position-relative ${
                      isMe
                        ? "text-white rounded-4 rounded-bottom-right-0"
                        : "bg-white text-dark rounded-4 rounded-bottom-left-0"
                    }`}
                    style={{ 
                      maxWidth: "75%", 
                      fontSize: "0.95rem",
                      backgroundColor: isMe ? "#1e2a78" : "#ffffff", // Azul profundo para 'Eu'
                      border: isMe ? "none" : "1px solid #dee2e6"
                    }}
                  >
                    <div className="pe-4">{msg.content}</div>
                    
                    <div 
                      className={`d-flex align-items-center justify-content-end mt-1 ${isMe ? "text-white-50" : "text-muted"}`} 
                      style={{ fontSize: '0.65rem' }}
                    >
                      <span className="me-1">{formatTime(msg.timestamp)}</span>
                      
                      {isMe && (
                        <span style={{ fontSize: '0.9rem' }}>
                          {msg.read ? (
                            <i className="bi bi-check2-all" style={{ color: "#00f2ff" }}></i> // Visto Cyan Elétrico (Muito Visível)
                          ) : (
                            <i className="bi bi-check2 text-white-50"></i> // Enviada (Branco 50%)
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Barra de Input */}
      <div className="p-3 border-top bg-white">
        <div className="input-group">
          <input
            type="text"
            className="form-control border-0 bg-light rounded-start-pill px-4"
            placeholder="Escreve uma mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 ms-2 shadow-sm"
            style={{ width: '45px', height: '45px', flexShrink: 0 }}
            onClick={handleSend}
          >
            <i className="bi bi-send-fill fs-5"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
