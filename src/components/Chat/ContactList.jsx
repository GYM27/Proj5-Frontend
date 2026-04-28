import React from 'react';

const ContactList = ({ users, onSelectUser, selectedUserId, allMessages = [], myUsername }) => {
    
    // 1. Lógica de Ordenação: Encontra a última interação com cada utilizador
    const sortedUsers = [...users].sort((a, b) => {
        const lastMsgA = allMessages
            .filter(m => (m.sender === a.username && m.recipient === myUsername) || (m.sender === myUsername && m.recipient === a.username))
            .reduce((max, m) => Math.max(max, m.timestamp || 0), 0);
            
        const lastMsgB = allMessages
            .filter(m => (m.sender === b.username && m.recipient === myUsername) || (m.sender === myUsername && m.recipient === b.username))
            .reduce((max, m) => Math.max(max, m.timestamp || 0), 0);

        // Critério 1: Quem falou mais recentemente fica no topo
        if (lastMsgA !== lastMsgB) return lastMsgB - lastMsgA;
        
        // Critério 2: Ordem alfabética se não houver mensagens
        return (a.firstName || a.username).localeCompare(b.firstName || b.username);
    });

    return (
        <div className="flex-grow-1 overflow-auto" style={{ height: 'calc(100vh - 130px)' }}>
            <div className="list-group list-group-flush">
                {sortedUsers.length === 0 ? (
                    <div className="p-4 text-center text-muted small">Nenhum contacto encontrado.</div>
                ) : (
                    sortedUsers.map((user) => {
                        // Calcula notificações para este utilizador específico
                        const unreadCount = allMessages.filter(
                            m => m.sender === user.username && m.recipient === myUsername && !m.read
                        ).length;

                        return (
                            <button
                                key={user.id}
                                onClick={() => onSelectUser(user)}
                                className={`list-group-item list-group-item-action p-3 border-0 border-bottom transition-all ${
                                    selectedUserId === user.id ? 'bg-primary-subtle border-start border-primary border-4' : ''
                                }`}
                            >
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center overflow-hidden">
                                        <div className="rounded-circle overflow-hidden flex-shrink-0 shadow-sm d-flex align-items-center justify-content-center bg-light border" 
                                             style={{ width: '48px', height: '48px' }}>
                                            {user.photoUrl ? (
                                                <img 
                                                    src={user.photoUrl} 
                                                    alt={user.username} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null; 
                                                        e.target.src = "https://ui-avatars.com/api/?name=" + (user.firstName || user.username) + "&background=random";
                                                    }}
                                                />
                                            ) : (
                                                <span className="fw-bold text-secondary" style={{ fontSize: '1rem' }}>
                                                    {user.firstName?.[0] || user.username?.[0] || '?'}{user.lastName?.[0] || ''}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="ms-3 overflow-hidden">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="mb-0 text-truncate text-dark fw-semibold">
                                                    {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}` : user.username}
                                                </h6>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <span className={`badge rounded-circle p-1 me-2 ${user.online ? 'bg-success' : 'bg-secondary'}`} style={{ width: '8px', height: '8px', display: 'inline-block' }}></span>
                                                <small className="text-muted text-truncate">{user.userRole}</small>
                                            </div>
                                        </div>
                                    </div>

                                    {unreadCount > 0 && (
                                        <span className="badge rounded-pill bg-danger shadow-sm bounce-in">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ContactList;