import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import { useModalManager } from "../../Modal/useModalManager";
import { useUserStore } from "../../stores/UserStore"; 

/**
 * Hook customizado responsável por gerir a lógica de negócio da página de Perfil.
 * @param {string} targetUsername - O username do perfil a ser visualizado.
 * @param {boolean} isOwnProfile - Flag que indica se o utilizador está a visualizar o seu próprio perfil.
 */
export const useProfileManager = (targetUsername, isOwnProfile) => {
  const navigate = useNavigate();
  const { modalConfig, openModal, closeModal } = useModalManager();

  const setPhotoUrl = useUserStore((state) => state.setPhotoUrl);
  const setNames = useUserStore((state) => state.setNames);

  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = isOwnProfile
          ? await userService.getMe()
          : await userService.getUserByUsername(targetUsername);
        setFormData(data);
        setOriginalData(data); 
      } catch (err) {
        console.error("Erro ao carregar dados do perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [targetUsername, isOwnProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const hasChanges = 
    formData.firstName !== originalData.firstName ||
    formData.lastName !== originalData.lastName ||
    formData.email !== originalData.email ||
    formData.cellphone !== originalData.cellphone ||
    formData.photoUrl !== originalData.photoUrl;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;

    try {
      setLoading(true);
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        cellphone: formData.cellphone,
        photoUrl: formData.photoUrl
      };

      if (isOwnProfile) {
        await userService.updateMyProfile(payload);
        // Atualiza o Header global apenas se for o meu perfil
        setPhotoUrl(formData.photoUrl);
        setNames(formData.firstName, formData.lastName);
      } else {
        // Admin atualiza outro utilizador pelo ID
        await userService.updateUserProfile(formData.id, payload);
      }

      setOriginalData(formData);
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      alert("Erro ao guardar o perfil: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (data) => {
    try {
      const actionMap = {
        USER_HARD_DELETE: async () => {
          await userService.deleteUserPermanent(formData.id);
          closeModal();
          navigate("/users");
        },
        USER_TOGGLE_STATUS: async () => {
          const action = data.softDelete ? "activate" : "deactivate";
          await userService.toggleUserStatus(formData.id, action);
          closeModal();
          window.location.reload();
        },
      };

      if (actionMap[modalConfig.type]) {
        await actionMap[modalConfig.type]();
      }
    } catch (err) {
      alert("Erro na operação de administração.");
    }
  };

  return {
    formData,
    loading,
    modalConfig,
    openModal,
    closeModal,
    handleConfirmAction,
    handleChange,
    handleSubmit,
    hasChanges,
  };
};
