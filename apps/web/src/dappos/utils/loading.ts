export const loadingInitialized = (defaultValue?: boolean) => {
  let loading = defaultValue ?? false
  const startLoading = () => {
    loading = true
  }
  const endLoading = () => {
    loading = false
  }
  return {
    loading,
    startLoading,
    endLoading,
  }
}
