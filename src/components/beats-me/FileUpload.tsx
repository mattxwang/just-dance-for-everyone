interface Props {
  loadSong: (file: string, name?: string) => void
}

export default function FileUpload ({ loadSong }: Props): JSX.Element {
  function handleUpload (event: React.FormEvent<HTMLInputElement>): void {
    // TODO: error handling
    const target = event.currentTarget
    if (target?.files != null && target.files.length > 0) {
      const [file] = target.files
      const path = window.URL.createObjectURL(file)
      loadSong(path, file.name)
    }
  }

  return (
  <label
    className="flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white"
  >
    <svg
      className="w-8 h-8"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z"
      />
    </svg>
    <span className="mt-2 text-base leading-normal">select a file</span>
    <input
      className="hidden"
      type="file"
      id="audio-file"
      accept="audio/mpeg, audio/ogg, audio/*"
      onChange={handleUpload}
    />
  </label>
  )
}
