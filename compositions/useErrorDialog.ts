import { ref, InjectionKey } from '#imports'

export const useErrorDialog = () => {
  const isErrorDialogOpen = ref<boolean>(false)
  const errorMessage = ref<string>('')

  return {
    isErrorDialogOpen,
    errorMessage,
  }
}

export type ErrorDialogStore = ReturnType<typeof useErrorDialog>
export const ErrorDialogKey: InjectionKey<ErrorDialogStore> =
  Symbol('ErrorDialogStore')
