import React from 'react';

/**
 * COMPONENTE: GenericHeader
 * -------------------------
 * DESCRIÇÃO: Molde universal para os cabeçalhos de todas as páginas (Leads, Clientes, Users).
 * Garante que o layout é idêntico, mudando apenas o conteúdo interno.
 */
const GenericHeader = ({ title, subtitle, stats = [], showStats = true, isTrash = false, children }) => {
    return (
        <div className={`generic-header-unified border-bottom bg-white shadow-sm px-4 py-3 ${isTrash ? 'border-top border-4 border-danger' : ''}`} style={{ minHeight: "100px" }}>
            <div className="d-flex justify-content-between align-items-center">
                {/* LADO ESQUERDO: Identidade da Página */}
                <div className="header-info">
                    <h2 className="m-0 fw-bold d-flex align-items-center gap-2">
                        {isTrash && <i className="bi bi-trash3-fill text-danger"></i>}
                        {title}
                    </h2>
                    {subtitle && <p className="text-muted small m-0 mt-1">{subtitle}</p>}
                </div>

                {/* LADO DIREITO: Controlos e Acções (Teletransportados das páginas) */}
                <div className="header-actions d-flex align-items-center gap-3">
                    <div id="header-actions-portal" className="d-flex align-items-center gap-2"></div>
                    {children}
                </div>
            </div>

            {/* BARRA DE ESTATÍSTICAS (OPCIONAL) */}
            {showStats && stats.length > 0 && (
                <div className="row g-3 mt-2 border-top pt-3">
                    {stats.map((stat, index) => (
                        <div key={index} className="col-auto">
                            <div className="d-flex align-items-center gap-2">
                                <span className="small text-muted">{stat.label}:</span>
                                <span className="fw-bold">{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GenericHeader;
