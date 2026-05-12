const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Upload une image vers Cloudinary (gratuit, pas de Firebase Storage requis).
 * @param {File}   file    - fichier image
 * @param {string} folder  - dossier Cloudinary (ex: "thumbnails")
 * @returns {Promise<string>} URL sécurisée de l'image
 */
export async function uploadImage(file, folder = 'xamxam') {
  if (!CLOUD_NAME || CLOUD_NAME === 'votre_cloud_name') {
    throw new Error('Cloudinary non configuré. Ajoutez VITE_CLOUDINARY_CLOUD_NAME dans .env')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Erreur upload (${res.status})`)
  }

  const data = await res.json()
  return data.secure_url
}
