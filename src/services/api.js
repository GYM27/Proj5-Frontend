import { useUserStore } from "../stores/UserStore";

/**
 * Ponto de entrada base da API definido no ApplicationConfig do JAX-RS.
 * Este URL deve coincidir com o @ApplicationPath definido no Java.
 */
const BASE_URL = "http://localhost:8080/LuisF-proj5/rest";
export const WS_BASE_URL = "ws://localhost:8080/LuisF-proj5/websocket/chat";


/**
 * FUNÇÃO: apiRequest (INTERCEPTOR PADRÃO)
 * --------------------------------------
 * DESCRIÇÃO: Motor central de comunicação assíncrona (Fetch API).
 * OBJETIVO: Implementar o padrão 'Interceptor' para injetar segurança em todos
 * os pedidos e padronizar o tratamento de exceções vindas do servidor.
 * * @param {string} endpoint - Rota específica (ex: '/leads', '/users/me').
 * @param {string} method - Verbo HTTP (GET, POST, PUT, DELETE).
 * @param {Object} body - Dados a serem enviados no corpo do pedido.
 */
const apiRequest = async (endpoint, method = "GET", body = null) => {
  // 1. GESTÃO DE SESSÃO :
  // Recupera o JWT Token do sessionStorage. Se o utilizador não estiver logado,
  // o token será 'null' e o Backend barrará o acesso via UserVerificationBean.
  const token = sessionStorage.getItem("token");

  // 2. CONFIGURAÇÃO DE CABEÇALHOS (PADRONIZAÇÃO):
  // Define que a comunicação é estritamente baseada em JSON (MIME Types).
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // 3. INJEÇÃO DE SEGURANÇA:
  // Injeta o cabeçalho personalizado 'token' que será validado pelo filtro do Wildfly.
  if (token) {
    headers["token"] = token;
  }

  // 4. CONFIGURAÇÃO ESTRUTURAL DO REQUEST:
  const config = {
    method: method,
    headers: headers,
  };

  // 5. SERIALIZAÇÃO DE DADOS (DATA MAPPING):
  // Converte objetos literais de JavaScript para Strings JSON interpretáveis pelo JAX-RS.
  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    // 6. EXECUÇÃO ASSÍNCRONA (PROMISES):
    // Realiza a chamada ao servidor Wildfly utilizando o URL absoluto.
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // 7. TRATAMENTO DE ERROS DO SERVIDOR (EXCEPTION MAPPING):
    // Se a resposta não for 2xx, processamos o ErrorResponse enviado pelo Backend Java.
    if (!response.ok) {
      // SE O TOKEN EXPIROU (401), EXPULSAMOS O UTILIZADOR IMEDIATAMENTE
      if (response.status === 401) {
        console.warn("Sessão expirada (401). A redirecionar para o login...");
        useUserStore.getState().clearUser();
        sessionStorage.removeItem("token");
        throw new Error("Sessão expirada. Por favor, faça login novamente.");
      }

      const errorData = await response.json();
      // Propaga a mensagem de erro específica definida nas Exceptions do Java.
      throw new Error(
        errorData.message || "Erro na comunicação com o servidor.",
      );
    }

    // 8. GESTÃO DE RESPOSTAS VAZIAS (204 NO CONTENT):
    // Comum em operações de Logout ou Delete onde não há objeto para retornar.
    if (response.status === 204) {
      return true;
    }

   // 9. DESSERIALIZAÇÃO SEGURA :
    const text = await response.text();
    return text ? JSON.parse(text) : null;

  } catch (error) {
    if (error.message === "Failed to fetch") {
      throw new Error("Conexão recusada. Verifique se o servidor Wildfly está ativo.");
    }
    throw error;
  }
};

export default apiRequest;