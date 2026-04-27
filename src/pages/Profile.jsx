import React from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Card, Spinner, Row, Col } from "react-bootstrap";
import { useUserStore } from "../stores/UserStore";
import { useHeaderStore } from "../stores/HeaderStore"; // Novo
import { useEffect } from "react";

// O TEU HOOK CÉREBRO (Lógica de Negócio isolada)
import { useProfileManager } from "../components/Profile/useProfileManager.jsx";

// COMPONENTES SHARED
import DynamicModal from "../Modal/DynamicModal.jsx";
import ConfirmActionContent from "../Modal/ConfirmActionContent.jsx";

// COMPONENTES DE PERFIL
import ProfilePhoto from "../components/Profile/ProfilePhoto";
import ProfileForm from "../components/Profile/ProfileForm";
import AdminActions from "../components/Profile/AdminActions";

/**
 * COMPONENTE: Profile
 * -------------------
 * DESCRIÇÃO: Página de visualização e gestão de perfis de utilizador.
 */
const Profile = () => {
  const [searchParams] = useSearchParams();


  // LÓGICA DE CONTEXTO:
  const targetUserId = searchParams.get("userId");
  const isOwnProfile = !targetUserId;

  const { userRole } = useUserStore();
  const isAdmin = userRole === "ADMIN";

  // ✨ A MÁGICA ACONTECE AQUI:
  // Extraímos todas as variáveis e funções diretamente do nosso Hook!
  const {
    formData,
    loading,
    modalConfig,
    openModal,
    closeModal,
    handleConfirmAction,
    handleChange,    
    handleSubmit,     
    hasChanges     // <-- EXTRAÍDO AQUI
  } = useProfileManager(targetUserId, isOwnProfile);

  const { setHeader } = useHeaderStore();

  // ATUALIZA O CABEÇALHO GLOBAL
  useEffect(() => {
    setHeader({
      title: isOwnProfile ? "O Meu Perfil" : `Perfil de ${formData?.firstName}`,
      subtitle: formData?.email || "Dados do utilizador",
      showStats: false
    });
  }, [isOwnProfile, formData?.firstName, formData?.email, setHeader]);

  // FEEDBACK VISUAL DE CARREGAMENTO MELHORADO
  if (loading) {
    return (
        <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <Spinner animation="grow" variant="primary" className="mb-3" />
          <h5 className="text-muted fw-light">A preparar o perfil...</h5>
        </Container>
    );
  }

  return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={7}>
            {/* CARD PRINCIPAL: Adicionado arredondamento moderno (rounded-4) e sombra suave */}
            <Card className="shadow border-0 rounded-4 overflow-hidden">

              {/* CABEÇALHO DO PERFIL: Movido para o layout unificado */}
              <div className="bg-light pt-3 pb-4 px-4 text-center border-bottom">
                <ProfilePhoto photoUrl={formData?.photoUrl} firstName={formData?.firstName} lastName={formData?.lastName} />
                
                {/* ALERTA DE ESTADO (REGRA A9): Badge em forma de pílula (rounded-pill) */}
                {formData?.softDelete && (
                    <span className="badge bg-danger bg-gradient rounded-pill px-4 py-2 mt-3 shadow-sm">
                         <i className="bi bi-exclamation-triangle-fill me-2"></i> CONTA DESATIVADA
                      </span>
                )}
              </div>

              <Card.Body className="p-4 p-md-5">

                {/* FORMULÁRIO: Recebe as funções que extraímos no topo */}
                <ProfileForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    isOwnProfile={isOwnProfile}
                    loading={loading}
                    hasChanges={hasChanges} // <-- PASSADO PARA O FORM
                />

                {/* PAINEL DE ADMINISTRAÇÃO: "Danger Zone" */}
                {!isOwnProfile && isAdmin && (
                    <div className="mt-5 p-4 bg-light border rounded-4">
                      <h5 className="text-danger fw-bold mb-3 d-flex align-items-center">
                        <i className="bi bi-shield-lock-fill me-2"></i> Área de Administração
                      </h5>
                      <p className="text-muted small mb-4">
                        Tem cuidado. As ações abaixo afetam as permissões de acesso deste utilizador no sistema.
                      </p>
                      <AdminActions
                          isDeleted={formData?.softDelete}
                          onToggleStatus={() => openModal("USER_TOGGLE_STATUS", "Alterar Estado da Conta", formData)}
                          onHardDelete={() => openModal("USER_HARD_DELETE", "Eliminação Permanente de Utilizador", formData)}
                      />
                    </div>
                )}

              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* MODAL DE CONFIRMAÇÃO */}
        <DynamicModal show={modalConfig.show} onHide={closeModal} title={modalConfig.title}>
          <ConfirmActionContent
              type={modalConfig.type}
              data={modalConfig.data}
              onCancel={closeModal}
              onConfirm={handleConfirmAction}
          />
        </DynamicModal>
      </Container>
  );
};

export default Profile;