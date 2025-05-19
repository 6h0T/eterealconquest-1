"use client"

import { AlertTriangle, X } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message }: DeleteConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-bunker-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center border-b border-bunker-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 bg-red-900/30 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-gray-300">{message}</p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 border border-bunker-700 rounded-md hover:bg-bunker-800"
            >
              Cancelar
            </button>
            <button onClick={onConfirm} className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
