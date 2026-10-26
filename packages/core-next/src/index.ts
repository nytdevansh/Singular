export { Component } from './component';
export { Input, Output, EventEmitter } from './decorators';
export { ChangeDetector, createChangeDetectorRef } from './change-detection';
export { registerCustomElement } from './dom/custom-elements';

export type {
  BaseComponent,
  ComponentOptions,
  ComponentRef,
  AfterContentInit,
  AfterViewInit,
  DoCheck,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  PropOptions,
  SimpleChange,
  SimpleChanges
} from './interfaces';
