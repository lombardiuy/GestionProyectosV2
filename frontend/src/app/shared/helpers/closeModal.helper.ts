// src/app/shared/helpers/bootstrap-modal.helper.ts

import { Modal } from 'bootstrap';

/**
 * Cierra un modal Bootstrap 5 por ID
 * @param modalId ID del modal (sin '#')
 */
export function closeBootstrapModal(modalId: string): void {
  const modalEl = document.getElementById(modalId);
  if (modalEl) {
    const modalInstance = Modal.getInstance(modalEl) || new Modal(modalEl);
    modalInstance.hide();
  } else {
    console.warn(`No se encontró un modal con el ID "${modalId}"`);
  }
}
