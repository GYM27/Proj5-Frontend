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
  const updateLocale = useUserStore((state) => state.updateLocale);

  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [stats, setStats] = useState(null); // Novo estado para as estatísticas
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = isOwnProfile
          ? await userService.getMe()
          : await userService.getUserByUsername(targetUsername);
        setFormData(data);
        setOriginalData(data); 

        // Buscar estatísticas do utilizador
        if (data && data.id) {
          try {
            // Usamos o serviço de Dashboard importando a API genérica (ou podíamos adicionar ao userService)
            // Assumindo que userService tem um api() exportado ou algo similar.
            // Para ser seguro, vou importar api do ficheiro correto.
            const statsData = await userService.getStatsForUser(data.id);
            setStats(statsData);
          } catch (e) {
            console.warn("Não foi possível carregar as estatísticas:", e);
          }
        }
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
    formData.photoUrl !== originalData.photoUrl ||
    formData.language !== originalData.language;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;
    
    // Validação de confirmação de password
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("A nova password e a confirmação não coincidem!");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        cellphone: formData.cellphone || "", // Garante que não vai null
        photoUrl: formData.photoUrl || "",
        language: formData.language || "pt"
      };

      if (isOwnProfile) {
        await userService.updateMyProfile(payload);
        // Atualiza o Header global apenas se for o meu perfil
        setPhotoUrl(formData.photoUrl);
        setNames(formData.firstName, formData.lastName);
        updateLocale(formData.language || "pt"); // Muda o idioma da UI na hora!
      } else {
        // Admin atualiza outro utilizador pelo ID
        await userService.updateUserProfile(formData.id, payload);
      }

      setOriginalData(formData);
      // Limpar campos de password após sucesso
      setFormData(prev => ({ ...prev, password: "", currentPassword: "", confirmPassword: "" }));
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("ERRO DETALHADO NA ATUALIZAÇÃO:", err);
      alert("Erro ao guardar o perfil: " + (err.message || "Erro desconhecido"));
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
        CHANGE_PASSWORD: async () => {
          // data aqui contém { currentPassword, password } enviados pelo modal
          // Enviamos apenas os campos que o UserUpdateDTO.java conhece
          const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            cellphone: formData.cellphone,
            photoUrl: formData.photoUrl,
            language: formData.language,
            password: data.password,
            currentPassword: data.currentPassword
          };
          await userService.updateMyProfile(payload);
          closeModal();
          alert("Password alterada com sucesso!");
        }
      };

      if (actionMap[modalConfig.type]) {
        await actionMap[modalConfig.type]();
      }
    } catch (err) {
      console.error("ERRO NA OPERAÇÃO:", err);
      alert(err.message || "Erro ao realizar a operação.");
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
    stats, // Retornamos as estatísticas
  };
};
