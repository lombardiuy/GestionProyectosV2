import { Injectable } from '@angular/core';
import { Modal } from 'bootstrap';

@Injectable({ providedIn: 'root' })
export class ModalService {

  private get(id: string): Modal {
    const el = document.getElementById(id)!;
    return Modal.getOrCreateInstance(el, { backdrop: 'static' });
  }

  open(id: string) {
    this.get(id).show();
  }

  close(id: string) {
    this.get(id).hide();
  }

  switch(fromId: string, toId: string) {
    const from = this.get(fromId);
    const fromEl = document.getElementById(fromId)!;

    from.hide();

    fromEl.addEventListener('hidden.bs.modal', () => {
      this.open(toId);
    }, { once: true });
  }
}
