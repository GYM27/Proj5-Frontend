import { create } from 'zustand';

/**
 * STORE: useHeaderStore
 * --------------------
 * DESCRIÇÃO: Gere a informação do cabeçalho unificado da aplicação.
 * Permite que cada página (filha do MainLayout) defina o seu próprio título,
 * subtítulo e estatísticas sem causar deslocações no layout.
 */
export const useHeaderStore = create((set) => ({
  title: "",
  subtitle: "",
  stats: [],
  showStats: false,

  /**
   * ACÇÃO: setHeader
   * @param {Object} config - { title, subtitle, stats, showStats }
   */
  setHeader: (config) => set({
    title: config.title || "",
    subtitle: config.subtitle || "",
    stats: config.stats || [],
    showStats: config.showStats || false,
  }),

  /** Limpa o cabeçalho (útil em transições ou logout) */
  clearHeader: () => set({
    title: "",
    subtitle: "",
    stats: [],
    showStats: false,
  }),
}));
