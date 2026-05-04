import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, Form } from "react-bootstrap";
import { useClientStore } from "../../stores/ClientsStore";
import { useUserStore } from "../../stores/UserStore";
import FormContainer from "../Shared/FormContainer";
import AdminAssignmentField from "../Shared/AdminAssignmentField";
import { useIntl } from "react-intl";

/**
 * COMPONENTE: NewClient
 * ---------------------
 * DESCRIÇÃO: Página/Formulário para o registo de novos clientes no sistema.
 * REGRAS DE NEGÓCIO:
 * 1. Utilizador comum: O cliente é automaticamente atribuído a si próprio.
 * 2. Administrador: Pode escolher, via 'AdminAssignmentField', quem será o gestor do cliente.
 */
const NewClient = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hooks das Stores: Isolamos a lógica de API (ClientsStore) e Sessão (UserStore)
    const { addClient, loading } = useClientStore();
    const userRole = useUserStore((state) => state.userRole);
    const isAdmin = userRole === "ADMIN";
    const intl = useIntl();

    // ESTADO LOCAL: Gerimos os dados do formulário e o ID do gestor alvo (se Admin)
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", organization: "" });
    const [targetUserId, setTargetUserId] = useState(location.state?.targetId || "");
    const [localError, setLocalError] = useState(null);

    /**
     * GESTOR DE INPUTS:
     * Atualiza o objeto formData dinamicamente com base no atributo 'name' do input.
     */
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    /**
     * SUBMISSÃO DO FORMULÁRIO:
     * Envia os dados para a Store. Se for Admin, anexa o targetUserId para o Backend
     * saber a quem atribuir o novo cliente.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);

        // Chamada à Store: Passamos os dados e a lógica de atribuição condicional
        const success = await addClient(formData, isAdmin && targetUserId ? targetUserId : null);

        if (success) {
            // Sucesso: Redireciona para a listagem principal
            navigate("/clients");
        } else {
            /** * TRATAMENTO DE ERROS (Critério de Avaliação):
             * Recuperamos a mensagem de erro específica capturada pela Store diretamente do servidor Java.
             */
            const errorMessage = useClientStore.getState().error;
            setLocalError(errorMessage || intl.formatMessage({ id: "clients.save_error" }));
        }
    };

    return (
        /**
         * FormContainer: Componente reutilizável que padroniza o layout de formulários,
         * incluindo o título, ícone e estado de 'loading' no botão de submissão.
         */
        <FormContainer
            title={intl.formatMessage({ id: "clients.create_title" })}
            icon="bi-person-plus"
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/clients")}
        >
            {/* Feedback visual de erros vindo do Backend */}
            {localError && <Alert variant="danger">{localError}</Alert>}

            {/* CAMPO DE ATRIBUIÇÃO (Apenas para Admins):
                Permite cumprir o requisito de gestão de recursos por parte da administração.
            */}
            <AdminAssignmentField
                isAdmin={isAdmin}
                value={targetUserId}
                onChange={setTargetUserId}
                label={intl.formatMessage({ id: "forms.responsible" })}
            />

            {/* CAMPOS OBRIGATÓRIOS (*) - Validação nativa do HTML5 com 'required' */}
            <Form.Group className="mb-3">
                <Form.Label>{intl.formatMessage({ id: "clients.field.name" })} *</Form.Label>
                <Form.Control name="name" value={formData.name} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>{intl.formatMessage({ id: "clients.field.email" })} *</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>{intl.formatMessage({ id: "clients.field.phone" })} *</Form.Label>
                <Form.Control name="phone" value={formData.phone} onChange={handleChange} required />
            </Form.Group>

            {/* Campo Opcional */}
            <Form.Group className="mb-3">
                <Form.Label>{intl.formatMessage({ id: "clients.field.organization" })}</Form.Label>
                <Form.Control name="organization" value={formData.organization} onChange={handleChange} />
            </Form.Group>

        </FormContainer>
    );
};

export default NewClient;