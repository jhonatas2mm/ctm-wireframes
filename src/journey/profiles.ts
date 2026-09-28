import { useJsonFile } from '@/lib/json-file'

// Perfis de acesso ficam em profiles.json (editável pela casca em dev).
// Jornadas referenciam o perfil pelo nome.
export type ProfileDef = { name: string; color: string }

export const profileColors = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#0284c7', '#7c3aed', '#db2777']
export const unknownProfile = (name: string): ProfileDef => ({ name, color: '#737373' })

export const useProfiles = () => useJsonFile<ProfileDef[]>('profiles.json', [])
