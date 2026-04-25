import type { WidgetType } from '@/types/dashboard';

export const WIDGET_DND_MIME = 'application/x-widget-type';

let current: WidgetType | null = null;

export function setDraggingType(type: WidgetType | null): void {
  current = type;
}

export function getDraggingType(): WidgetType | null {
  return current;
}
