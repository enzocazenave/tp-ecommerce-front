import { useEffect, useState } from "react"

export const useModal = ({ defaultState = false, callback = () => {} }) => {
  const [isModalOpen, setIsModalOpen] = useState(defaultState)

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => { 
    setIsModalOpen(false)
    callback()
  }

  useEffect(() => {
    if (!isModalOpen) return

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        handleCloseModal()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isModalOpen])

  return {
    handleOpenModal,
    handleCloseModal,
    isModalOpen
  }
}