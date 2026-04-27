import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import { useModalManager } from "../../Modal/useModalManager";
import { useUserStore } from "../../stores/UserStore"; // <-- 1. IMPORTA A STORE

/**
 * Hook customizado responsável por gerir a lógica de negócio da página de Perfil.
 * Centraliza o carregamento de dados, a edição do formulário, a atualização global
 * de estado (ex: fotografia no Header) e as ações de administração (ativar/desativar/eliminar).
 *
 * @param {string} targetUsername - O username do perfil a ser visualizado (undefined se for o próprio perfil).
 * @param {boolean} isOwnProfile - Flag que indica se o utilizador está a visualizar o seu próprio perfil.
 * @returns {Object} Um objeto contendo os estados e funções necessários para renderizar e interagir com o perfil.
 */
export const useProfileManager = (targetUsername, isOwnProfile) => {
  const navigate = useNavigate();

  // Gestor centralizado de modais de confirmação
  const { modalConfig, openModal, closeModal } = useModalManager();

  // <-- 2. VAI BUSCAR AS FUNÇÕES PARA ATUALIZAR O HEADER EM TEMPO REAL
  const setPhotoUrl = useUserStore((state) => state.setPhotoUrl);
  const setNames = useUserStore((state) => state.setNames);

  /** @type {[Object, Function]} Estado que guarda os dados do perfil atualmente em visualização/edição. */
  const [formData, setFormData] = useState({});

  /** @type {[Object, Function]} Cópia dos dados originais para detetar alterações (Dirty Checking). */
  const [originalData, setOriginalData] = useState({});

  /** @type {[boolean, Function]} Estado que indica se os dados do perfil estão a ser carregados. */
  const [loading, setLoading] = useState(true);

  /**
   * Efeito responsável por carregar os dados do perfil assim que o componente é montado
   * ou quando a rota/utilizador alvo muda.
   */
  useEffect(() => {
    const load = async () => {
      try {
        // Carrega os dados do próprio utilizador ou do utilizador alvo consoante a rota
        const data = isOwnProfile
          ? await userService.getMe()
          : await userService.getUserByUsername(targetUsername);
        setFormData(data);
        setOriginalData(data); // Guarda o estado original para comparação posterior
      } catch (err) {
        console.error("Erro ao carregar dados do perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [targetUsername, isOwnProfile]);

  /**
   * <-- 3. NOVA FUNÇÃO: Atualiza o estado quando o utilizador escreve no formulário
   * Captura os eventos de mudança nos inputs e atualiza o estado local `formData` dinamicamente.
   * * @param {React.ChangeEvent<HTMLInputElement>} e - O evento de alteração do input.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** Calcula se existem alterações pendentes para habilitar/desabilitar o botão de guardar */
  const hasChanges = 
    formData.firstName !== originalData.firstName ||
    formData.lastName !== originalData.lastName ||
    formData.email !== originalData.email ||
    formData.cellphone !== originalData.cellphone ||
    formData.photoUrl !== originalData.photoUrl;

  /**
   * <-- 4. NOVA FUNÇÃO: Guarda na Base de Dados e atualiza o Header
   * Submete as alterações do perfil para a API e atualiza a fotografia de forma global.
   * * @param {React.FormEvent<HTMLFormElement>} e - O evento de submissão do formulário.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges) return; // Salvaguarda adicional

    try {
      setLoading(true);

      // Criar um payload limpo apenas com os campos que o backend espera
      // Isto evita o erro UnrecognizedPropertyException no WildFly (Jackson)
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        cellphone: formData.cellphone,
        photoUrl: formData.photoUrl
        // password removida: a edição de password não é feita neste formulário
      };

      // Chama a API para gravar os dados
      await userService.updateMyProfile(payload);

      // ✨ O NOME E A FOTO MUDAM NOS HEADERS AQUI ✨
      setPhotoUrl(formData.photoUrl);
      setNames(formData.firstName, formData.lastName);

      setOriginalData(formData); // Atualiza o original após sucesso para futuras edições
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      alert("Erro ao guardar o perfil: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Executa as ações críticas de administração após confirmação no modal.
   * Mapeia o tipo de ação guardado no `modalConfig` para a respetiva chamada à API.
   * * @param {Object} data - Os dados adicionais passados para a ação (ex: estado de softDelete do utilizador).
   */
  const handleConfirmAction = async (data) => {
    try {
      const actionMap = {
        // Ação de eliminação permanente (Hard Delete)
        USER_HARD_DELETE: async () => {
          await userService.deleteUserPermanent(formData.id);
          closeModal();
          navigate("/users"); // Redireciona para a listagem após eliminação
        },
        // Ação para ativar/desativar a conta (Soft Delete)
        USER_TOGGLE_STATUS: async () => {
          const action = data.softDelete ? "activate" : "deactivate";
          await userService.toggleUserStatus(formData.id, action);
          closeModal();
          window.location.reload(); // Recarrega para obter os dados frescos
        },
      };

      // Executa a função correspondente ao tipo de modal ativo
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
    hasChanges, // <-- EXPORTA O ESTADO DE ALTERAÇÕES
  };
};
