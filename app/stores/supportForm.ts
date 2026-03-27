export const useSupportFormStore = defineStore('supportForm', {
  state: () => ({
    activeTab: 'faq' as string,
    selectedSubject: '' as string,
    customSubject: '' as string,
    message: '' as string,
  }),
})
