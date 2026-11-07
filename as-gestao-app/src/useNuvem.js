import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export function useNuvem(chave, valorInicial) {
  const [valor, setValor] = useState(valorInicial)
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    const ref = doc(db, 'asgestao', chave)
    const cancelar = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setValor(JSON.parse(snap.data().json))
        } else {
          const local = localStorage.getItem(`asgestao_${chave}`)
          const inicial = local ? JSON.parse(local) : valorInicial
          setValor(inicial)
          setDoc(ref, { json: JSON.stringify(inicial) }).catch(console.error)
        }
        setCarregado(true)
      },
      (erro) => console.error('Erro ao ler Firestore:', erro)
    )
    return cancelar
  }, [chave])

  const salvar = (novo) => {
    setValor(novo)
    setDoc(doc(db, 'asgestao', chave), { json: JSON.stringify(novo) }).catch(console.error)
  }

  return [valor, salvar, carregado]
}