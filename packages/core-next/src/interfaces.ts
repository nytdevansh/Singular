import { Token } from '@singular/di';
import { ChangeDetectorRef } from './change-detection';

/**
 * Component lifecycle hooks
 */
export interface OnInit {
  ngOnInit(): void;
}

export interface OnDestroy {
  ngOnDestroy(): void;
}

export interface OnChanges {
  ngOnChanges(changes: SimpleChanges): void;
}

export interface AfterViewInit {
  ngAfterViewInit(): void;
}

export interface AfterContentInit {
  ngAfterContentInit(): void;
}

export interface DoCheck {
  ngDoCheck(): void;
}

/**
 * Simple changes object for change detection
 */
export interface SimpleChanges {
  [key: string]: SimpleChange;
}

export interface SimpleChange {
  currentValue: any;
  previousValue: any;
  firstChange: boolean;
}

export interface ElementRef {
  nativeElement: HTMLElement;
}

/**
 * Component instance interface
 */
export interface ComponentRef<T> {
  /**
   * The component instance
   */
  instance: T;

  /**
   * The host element wrapper
   */
  elementRef?: ElementRef;

  /**
   * The host DOM element for this component
   */
  hostElement?: HTMLElement;

  /**
   * The change detector for this component
   */
  changeDetectorRef?: ChangeDetectorRef;

  /**
   * Lifecycle callbacks used by the custom element wrapper.
   */
  destroy?: () => void;
  markForCheck?: () => void;
  isDestroyed?: boolean;
}

/**
 * Base component interface
 */
export interface BaseComponent extends OnInit, OnDestroy, OnChanges, AfterViewInit, AfterContentInit, DoCheck {
  __componentRef?: ComponentRef<this>;
  render?(): void;
}

/**
 * Component configuration options
 */
export interface ComponentOptions {
  /**
   * The tag name to use for the component
   */
  selector: string;
  
  /**
   * Component template (JSX or string template)
   */
  template?: string | (() => JSX.Element);
  
  /**
   * Component styles
   */
  styles?: string[];
  
  /**
   * Providers scoped to this component
   */
  providers?: Token[];
  
  /**
   * View encapsulation mode
   */
  encapsulation?: 'none' | 'emulated' | 'shadow';
  
  /**
   * Change detection strategy
   */
  changeDetection?: 'default' | 'onPush';
}

/**
 * Property decorator configuration
 */
export interface PropOptions {
  /**
   * Property name to bind to if different from field name
   */
  name?: string;
  
  /**
   * Default value
   */
  default?: any;
  
  /**
   * Whether the property is required
   */
  required?: boolean;
  
  /**
   * Transform function to apply to incoming values
   */
  transform?: (value: any) => any;
}