/**
 * ファイル選択時に読み込む
 * @param event
 * @returns
 */
export const onSelectFile = (event: Event): Promise<File | undefined> => {
  return new Promise((resolve) => {
    if (!(event.target instanceof HTMLInputElement)) {
      resolve(undefined)
      return
    }
    const files = event.target.files
    if (files === null || files.length === 0) {
      resolve(undefined)
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(files[0])

    reader.addEventListener('load', () => {
      resolve(files[0])
    })
  })
}
