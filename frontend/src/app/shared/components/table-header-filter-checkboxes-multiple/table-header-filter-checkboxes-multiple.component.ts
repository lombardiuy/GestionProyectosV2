import { Component, Input, EventEmitter, Output, HostListener, ElementRef } from '@angular/core';




@Component({
  selector: 'table-header-filter-checkboxes-multiple',
  templateUrl: './table-header-filter-checkboxes-multiple.component.html',
  styleUrls: ['./table-header-filter-checkboxes-multiple.component.scss'],
  standalone:false
})



export class TableHeaderFilterCheckboxesMultipleComponent {
  
  @Input() options: any[] = [];
  @Input() selected: string[] = [];
  @Output() selectedChange = new EventEmitter<string[]>();

  constructor(private elRef: ElementRef) {

  }

  showFilter = false;

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

onCheckboxChange(option: string, checked: boolean) {
  this.selected = checked
    ? [...this.selected, option]
    : this.selected.filter(o => o !== option);

  this.selectedChange.emit(this.selected);
}


  clear() {
    this.selected = [];
    this.selectedChange.emit(this.selected);
  }

@HostListener('document:click', ['$event'])
handleClickOutside(event: Event) {
  if (!this.elRef.nativeElement.contains(event.target)) {
    this.showFilter = false;
  }
}

toggleOption(option: any, event: Event) {
  event.stopPropagation(); // evita toggle doble
  const checked = this.selected.includes(option);
  this.onCheckboxChange(option, !checked);
}




}