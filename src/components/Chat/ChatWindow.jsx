import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "../../stores/UserStore";

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

  // Faz scroll automático para a última mensagem quando o histórico muda
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Aqui simulamos o envio. No futuro, o teu Hook WebSocket terá uma função sendMessage
    console.log("A enviar para:", selectedUser.username, "Conteúdo:", input);

    setInput("");
  };

  return (
    <div className="d-flex flex-column h-100 bg-white shadow-sm">
      {/* Header: Nome do contacto e botão voltar (Mobile) */}
      <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light-subtle">
        <div className="d-flex align-items-center">
          <button className="btn d-md-none me-2 border-0" onClick={onBack}>
            <i className="bi bi-arrow-left fs-4"></i>
          </button>
          <div>
            <h6 className="mb-0 fw-bold text-dark">
              {selectedUser.firstName} {selectedUser.lastName}
            </h6>
            <small className="text-success" style={{ fontSize: "0.75rem" }}>
              {" "}
              Ativo agora{" "}
            </small>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div
        ref={scrollRef}
        className="flex-grow-1 p-4 overflow-auto d-flex flex-column"
        style={{ backgroundColor: "#f0f2f5", scrollBehavior: "smooth" }}
      >
        {chatHistory.length === 0 ? (
          <div className="my-auto text-center text-muted opacity-50">
            <i className="bi bi-chat-heart fs-1"></i>
            <p className="mt-2">
              Inicia uma conversa com {selectedUser.firstName}.
            </p>
          </div>
        ) : (
          chatHistory.map((msg, i) => {
            const isMe = msg.sender === myUsername;
            return (
              <div
                key={i}
                className={`d-flex mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}
              >
                <div
                  className={`p-2 px-3 rounded-4 shadow-sm ${
                    isMe
                      ? "bg-primary text-white rounded-bottom-right-0"
                      : "bg-white text-dark rounded-bottom-left-0"
                  }`}
                  style={{ maxWidth: "75%", fontSize: "0.95rem" }}
                >
                  {msg.content}
                </div>
              </div>
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
            className="btn btn-primary rounded-end-pill px-4"
            onClick={handleSend}
          >
            <i className="bi bi-send-fill"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
