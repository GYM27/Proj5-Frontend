import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "../../stores/UserStore";
import api from "../../services/api";
import messageService from "../../services/messageService";

const ChatWindow = ({ selectedUser, onBack }) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const messages = useUserStore((state) => state.messages);
  const myUsername = useUserStore((state) => state.username);

  const chatHistory = messages.filter(
    (m) =>
      m.type === "CHAT" &&
      ((m.sender === myUsername && m.recipient === selectedUser.username) ||
        (m.sender === selectedUser.username && m.recipient === myUsername)),
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const { addMessage, markLocalMessagesAsRead } = useUserStore();

  // Lógica de Marcar como Lido Automático
  useEffect(() => {
    const hasUnread = chatHistory.some(
      (m) => m.sender === selectedUser.username && m.recipient === myUsername && !m.read,
    );

    if (hasUnread) {
      const markRead = async () => {
        try {
          await messageService.markAsRead(selectedUser.username);
          // Atualiza a store global para que toda a app saiba que estas mensagens foram lidas
          markLocalMessagesAsRead(myUsername, selectedUser.username);
        } catch (error) {
          console.error("Erro ao marcar como lidas:", error);
        }
      };
      markRead();
    }
  }, [chatHistory, selectedUser.username, myUsername, markLocalMessagesAsRead]);


  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateDivider = (ts) => {
    if (!ts) return "Data Desconhecida";
    const date = new Date(typeof ts === "number" ? ts : ts);
    if (isNaN(date.getTime())) return "Histórico";

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";
    return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
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
        type: "CHAT",
      };

      await api("/messages", "POST", payload);

      addMessage({
        sender: myUsername,
        recipient: selectedUser.username,
        content: messageContent,
        type: "CHAT",
        timestamp: timestamp,
        read: false,
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  return (
    <div
      className="d-flex flex-column h-100 w-100 border-0 shadow-none"
      style={{ backgroundColor: "#343a40" }}
    >
      {/* Header */}
      <div
        className="px-4 border-bottom border-white border-opacity-10 d-flex align-items-center justify-content-between bg-dark bg-opacity-25 backdrop-blur flex-shrink-0"
        style={{ height: "85px" }}
      >
        <div className="d-flex align-items-center">
          <button
            className="btn d-md-none me-2 border-0 text-white"
            onClick={onBack}
          >
            <i className="bi bi-arrow-left fs-4"></i>
          </button>
          <div className="d-flex align-items-center text-start">
            <div
              className="bg-primary rounded-circle overflow-hidden d-flex align-items-center justify-content-center me-3 shadow-sm border border-white border-opacity-10"
              style={{ width: "42px", height: "42px" }}
            >
              {selectedUser.photoUrl ? (
                <img
                  src={selectedUser.photoUrl}
                  alt={selectedUser.username}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${selectedUser.firstName}+${selectedUser.lastName}&background=random`;
                  }}
                />
              ) : (
                <span
                  className="text-white fw-bold"
                  style={{ fontSize: "0.9rem" }}
                >
                  {selectedUser.firstName?.[0] || selectedUser.username?.[0]}
                  {selectedUser.lastName?.[0] || ""}
                </span>
              )}
            </div>
            <div className="overflow-hidden">
              <h5 className="mb-0 fw-bold text-white text-truncate">
                {selectedUser.firstName} {selectedUser.lastName}
              </h5>
              {selectedUser.online ? (
                <small className="text-success" style={{ fontSize: "0.75rem" }}>
                  <i
                    className="bi bi-circle-fill me-1"
                    style={{ fontSize: "0.5rem" }}
                  ></i>{" "}
                  Ativo agora
                </small>
              ) : (
                <small
                  className="text-white-50"
                  style={{ fontSize: "0.75rem" }}
                >
                  <i
                    className="bi bi-circle-fill me-1 opacity-50"
                    style={{ fontSize: "0.5rem" }}
                  ></i>{" "}
                  Offline
                </small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div
        ref={scrollRef}
        className="flex-grow-1 p-4 overflow-auto d-flex flex-column custom-scrollbar"
        style={{
          backgroundColor: "#2d3238",
          backgroundImage: `
            radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0),
            linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 100%)
          `,
          backgroundSize: "30px 30px, 100% 100%",
          backgroundAttachment: "fixed",
        }}
      >
        {chatHistory.length === 0 ? (
          <div className="my-auto text-center text-white-50 opacity-25">
            <i className="bi bi-chat-heart display-1"></i>
            <p className="mt-3">Diz "Olá" a {selectedUser.firstName}!</p>
          </div>
        ) : (
          chatHistory.map((msg, i) => {
            const isMe = msg.sender === myUsername;

            const showDateDivider =
              i === 0 ||
              new Date(chatHistory[i - 1].timestamp).toDateString() !==
                new Date(msg.timestamp).toDateString();

            return (
              <React.Fragment key={i}>
                {showDateDivider && (
                  <div className="text-center my-4">
                    <span
                      className="badge bg-white bg-opacity-10 text-white-50 px-3 py-2 rounded-pill fw-normal border border-white border-opacity-10"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {formatDateDivider(msg.timestamp)}
                    </span>
                  </div>
                )}

                <div
                  className={`d-flex mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}
                >
                  <div
                    className={`p-2 shadow-sm position-relative animate-fade-in ${
                      isMe
                        ? "text-white rounded-4 rounded-top-right-0 bubble-me"
                        : "text-white rounded-4 rounded-top-left-0 bubble-them"
                    }`}
                    style={{
                      maxWidth: "70%",
                      fontSize: "0.95rem",
                      backgroundColor: isMe
                        ? "rgba(9, 95, 10, 0.66)"
                        : "rgba(96, 99, 99, 0.61)",
                      border: "none",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word"
                    }}
                  >
                    <div className="text-start" style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>

                    <div
                      className={`d-flex align-items-center justify-content-end mt-1 text-white-50`}
                      style={{ fontSize: "0.65rem" }}
                    >
                      <span className="me-1 opacity-75">
                        {formatTime(msg.timestamp)}
                      </span>

                      {isMe && (
                        <span style={{ fontSize: "0.85rem" }}>
                          {msg.read ? (
                            <i className="bi bi-check2-all text-info"></i>
                          ) : (
                            <i className="bi bi-check2"></i>
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
      <div className="p-3 bg-dark bg-opacity-25 border-top border-white border-opacity-10">
        <div className="input-group bg-white bg-opacity-10 rounded-pill p-1 border border-white border-opacity-10">
          <button className="btn text-white-50 border-0 px-3">
            <i className="bi bi-plus-lg"></i>
          </button>
          <input
            type="text"
            className="form-control border-0 bg-transparent text-white shadow-none px-2"
            placeholder="Escrever mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 ms-2 shadow"
            style={{ width: "40px", height: "40px", flexShrink: 0 }}
            onClick={handleSend}
          >
            <i className="bi bi-send-fill text-white"></i>
          </button>
        </div>
      </div>

      <style>{`
        .backdrop-blur { backdrop-filter: blur(10px); }
        .bubble-me { border-bottom-right-radius: 4px !important; }
        .bubble-them { border-bottom-left-radius: 4px !important; }
        .animate-fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ChatWindow;
