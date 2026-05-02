import React, { useState } from "react";

const ContactList = ({
  users,
  onSelectUser,
  selectedUserId,
  allMessages = [],
  myUsername,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Lógica de Filtragem e Ordenação
  const filteredUsers = users.filter((u) =>
    (
      (u.firstName || "") +
      " " +
      (u.lastName || "") +
      " " +
      u.username
    )
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const lastMsgA = allMessages
      .filter(
        (m) =>
          (m.sender === a.username && m.recipient === myUsername) ||
          (m.sender === myUsername && m.recipient === a.username)
      )
      .reduce((max, m) => Math.max(max, m.timestamp || 0), 0);

    const lastMsgB = allMessages
      .filter(
        (m) =>
          (m.sender === b.username && m.recipient === myUsername) ||
          (m.sender === myUsername && m.recipient === b.username)
      )
      .reduce((max, m) => Math.max(max, m.timestamp || 0), 0);

    if (lastMsgA !== lastMsgB) return lastMsgB - lastMsgA;
    return (a.firstName || a.username).localeCompare(b.firstName || b.username);
  });

  return (
    <div className="d-flex flex-column h-100 bg-transparent">
      {/* Search Bar */}
      <div className="px-4 py-3 bg-dark bg-opacity-10 border-bottom border-white border-opacity-10">
        <div className="input-group input-group-sm bg-white bg-opacity-10 rounded-pill px-3 py-1 border-0">
          <span className="input-group-text border-0 bg-transparent text-white-50">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 bg-transparent shadow-none text-white placeholder-white-50"
            placeholder="Pesquisar contactos..."
            style={{ color: 'white' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto custom-scrollbar">
        <div className="list-group list-group-flush">
          {sortedUsers.length === 0 ? (
            <div className="p-5 text-center text-white-50 opacity-50">
              <i className="bi bi-person-x fs-1 d-block mb-2"></i>
              <small>Nenhum contacto encontrado.</small>
            </div>
          ) : (
            sortedUsers.map((user) => {
              const unreadCount = allMessages.filter(
                (m) =>
                  m.sender === user.username &&
                  m.recipient === myUsername &&
                  !m.read
              ).length;

              const isSelected = selectedUserId === user.id;

              return (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`list-group-item list-group-item-action p-3 border-0 d-flex align-items-center transition-all bg-transparent text-white ${
                    isSelected ? "bg-white bg-opacity-10" : ""
                  }`}
                  style={{
                    borderLeft: isSelected ? "4px solid #0d6efd" : "4px solid transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div className="position-relative flex-shrink-0">
                    <div
                      className="rounded-circle overflow-hidden shadow-sm d-flex align-items-center justify-content-center bg-dark bg-opacity-50 border border-white border-opacity-10"
                      style={{ width: "52px", height: "52px" }}
                    >
                      {user.photoUrl ? (
                        <img
                          src={user.photoUrl}
                          alt={user.username}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://ui-avatars.com/api/?name=" +
                              (user.firstName || user.username) +
                              "&background=random";
                          }}
                        />
                      ) : (
                        <span
                          className="fw-bold text-white-50"
                          style={{ fontSize: "1.1rem" }}
                        >
                          {user.firstName?.[0] || user.username?.[0] || "?"}
                          {user.lastName?.[0] || ""}
                        </span>
                      )}
                    </div>
                    {/* Online Status Dot */}
                    <span
                      className={`position-absolute bottom-0 end-0 border border-2 border-dark rounded-circle p-1 ${
                        user.online ? "bg-success" : "bg-secondary"
                      }`}
                      style={{ width: "14px", height: "14px" }}
                    ></span>
                  </div>

                  <div className="ms-3 overflow-hidden flex-grow-1 text-start">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className={`mb-0 text-truncate ${isSelected ? "text-primary fw-bold" : "text-white fw-semibold"}`}>
                        {user.firstName || user.lastName
                          ? `${user.firstName || ""} ${user.lastName || ""}`
                          : user.username}
                      </h6>
                      {unreadCount > 0 && (
                        <span className="badge rounded-pill bg-danger shadow-sm">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="d-flex align-items-center mt-1">
                      <small className="text-white-50 text-truncate" style={{ fontSize: "0.8rem" }}>
                        {user.userRole}
                      </small>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
      
      <style>{`
        .list-group-item-action:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
          color: white !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .placeholder-white-50::placeholder {
          color: rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default ContactList;
