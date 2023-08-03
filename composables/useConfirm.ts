import { useState } from '#app'

export const useConfirm = () => {
  const isConfirmDialogOpen = useState<boolean>(
    'isConfirmDialogOpen',
    () => false
  )
  const _resolve = useState<(answer: boolean) => void>(
    'resolve',
    () => () => {}
  )

  const onConfirm = () => {
    return new Promise<boolean>((resolve) => {
      isConfirmDialogOpen.value = true
      _resolve.value = resolve
    })
  }

  const close = () => {
    isConfirmDialogOpen.value = false
    _resolve.value = () => {}
  }

  const onOK = () => {
    _resolve.value(true)
    close()
  }
  const onCancel = () => {
    _resolve.value(false)
    close()
  }

  return {
    isConfirmDialogOpen,
    onConfirm,
    onCancel,
    onOK,
    close,
  }
}
