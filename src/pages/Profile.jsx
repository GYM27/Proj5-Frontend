import React from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Spinner, Row, Col } from "react-bootstrap";
import { useIntl, FormattedMessage } from "react-intl";
import { useUserStore } from "../stores/UserStore";
import { useHeaderStore } from "../stores/HeaderStore"; // Novo
import { useEffect } from "react";

// O TEU HOOK CÉREBRO (Lógica de Negócio isolada)
import { useProfileManager } from "../components/Profile/useProfileManager.jsx";

// COMPONENTES SHARED
import DynamicModal from "../Modal/DynamicModal.jsx";
import ConfirmActionContent from "../Modal/ConfirmActionContent.jsx";

import ProfilePhoto from "../components/Profile/ProfilePhoto";
import ProfileForm from "../components/Profile/ProfileForm";
import AdminActions from "../components/Profile/AdminActions";
import ProfileStats from "../components/Profile/ProfileStats";

/**
 * COMPONENTE: Profile
 * -------------------
 * DESCRIÇÃO: Página de visualização e gestão de perfis de utilizador.
 */
const Profile = () => {
  const intl = useIntl();
  const { username: targetUsername } = useParams();

  // LÓGICA DE CONTEXTO:
  const { userRole, username: currentUsername } = useUserStore();
  
  // Se não houver targetUsername na URL, é o /profile.
  // Se houver, verificamos se bate certo com o nosso username na sessão.
  const isOwnProfile = !targetUsername || targetUsername === currentUsername;

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
    hasChanges,
    stats
  } = useProfileManager(targetUsername, isOwnProfile);

  const { setHeader } = useHeaderStore();

  // ATUALIZA O CABEÇALHO GLOBAL
  useEffect(() => {
    const title = isOwnProfile 
      ? intl.formatMessage({ id: "profile.my_profile" }) 
      : intl.formatMessage({ id: "profile.profile_of" }, { name: formData?.firstName });

    setHeader({
      title,
      subtitle: formData?.email || intl.formatMessage({ id: "profile.user_data" }),
      showStats: false
    });
  }, [isOwnProfile, formData?.firstName, formData?.email, setHeader, intl]);

  // FEEDBACK VISUAL DE CARREGAMENTO MELHORADO
  if (loading) {
    return (
        <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <Spinner animation="grow" variant="primary" className="mb-3" />
          <h5 className="text-muted fw-light">
            {intl.formatMessage({ id: "profile.preparing" })}
          </h5>
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
                         <i className="bi bi-exclamation-triangle-fill me-2"></i> 
                         <FormattedMessage id="profile.account_deactivated" />
                      </span>
                )}
              </div>

              <Card.Body className="p-4 p-md-5">

                {/* ESTATÍSTICAS DO UTILIZADOR */}
                <ProfileStats stats={stats} />
                
                <hr className="my-4 text-light-subtle" />

                {/* FORMULÁRIO: Recebe as funções que extraímos no topo */}
                <ProfileForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    isOwnProfile={isOwnProfile}
                    isAdmin={isAdmin}
                    loading={loading}
                    hasChanges={hasChanges} 
                    openModal={openModal} // <-- PASSADO AQUI
                />

                {/* PAINEL DE ADMINISTRAÇÃO: "Danger Zone" */}
                {!isOwnProfile && isAdmin && (
                    <div className="mt-5 p-4 bg-light border rounded-4">
                      <h5 className="text-danger fw-bold mb-3 d-flex align-items-center">
                        <i className="bi bi-shield-lock-fill me-2"></i> 
                        <FormattedMessage id="profile.admin_area" />
                      </h5>
                      <p className="text-muted small mb-4">
                        <FormattedMessage id="profile.admin_warning" />
                      </p>
                      <AdminActions
                          isDeleted={formData?.softDelete}
                          onToggleStatus={() => openModal("USER_TOGGLE_STATUS", intl.formatMessage({ id: "profile.toggle_status_title" }), formData)}
                          onHardDelete={() => openModal("USER_HARD_DELETE", intl.formatMessage({ id: "profile.hard_delete_title" }), formData)}
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