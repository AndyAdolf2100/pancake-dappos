import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from 'state'

export const useDappOSInstitution = () => {
  const institutionAccount = useSelector((state: AppState) => state.dappOSInstitution.institutionAccount)
  const institutionAccountId = useSelector((state: AppState) => state.dappOSInstitution.institutionAccountId)

  const isSwapModeNormal = useSelector((state: AppState) => state.dappOSInstitution.isSwapModeNormal)

  const isInstitutionSigner = false

  //   const isInstitutionSigner = useMemo(() => {
  //     return !isSwapModeNormal.value && institutionRole.value === 'signer';
  //   }, []);

  return {
    isSwapModeNormal,
    isInstitutionSigner,
    institutionAccount,
    institutionAccountId,
  }
}
