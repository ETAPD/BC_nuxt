// Store pre stav support formulara
export const useSupportFormStore = defineStore("supportForm", () => {
  const activeTab = ref("faq");
  const selectedSubject = ref("");
  const customSubject = ref("");
  const message = ref("");

  return { activeTab, selectedSubject, customSubject, message };
});
