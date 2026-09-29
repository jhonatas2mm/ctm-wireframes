import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'

// Nome do usuário do perfil ativo (para o histórico das telas).
export const useAutor = () => profileOf(useProfile()).user?.nome ?? 'Usuário'
