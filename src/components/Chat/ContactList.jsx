import React from 'react';

const ContactList = ({ users, onSelectUser, selectedUserId, allMessages = [], myUsername }) => {
    return (
        <div className="flex-grow-1 overflow-auto" style={{ height: 'calc(100vh - 130px)' }}>
            <div className="list-group list-group-flush">
                {users.length === 0 ? (
                    <div className="p-4 text-center text-muted small">Nenhum contacto encontrado.</div>
                ) : (
                    users.map((user) => {
                        // Calcula quantas mensagens não lidas este utilizador enviou para mim
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
                                        {/* Avatar com iniciais */}
                                        <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" 
                                             style={{ width: '48px', height: '48px', fontSize: '1rem', fontWeight: 'bold' }}>
                                            {user.firstName?.[0] || user.username?.[0] || '?'}{user.lastName?.[0] || ''}
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

                                    {/* Bolinha de Notificação */}
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