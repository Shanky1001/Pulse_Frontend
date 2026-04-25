import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Dashboard, Widget, WidgetLayout } from '@/types/dashboard';

export type EditorMode = 'edit' | 'view';

export type EditorState = {
  dashboardId: string;
  name: string;
  propertyId: string;
  widgets: Widget[];
  selectedId: string | null;
  mode: EditorMode;
  dirty: boolean;
  paletteOpen: boolean;
};

const initialPaletteOpen =
  typeof window !== 'undefined' ? window.innerWidth >= 900 : true;

const initialState: EditorState = {
  dashboardId: '',
  name: '',
  propertyId: '',
  widgets: [],
  selectedId: null,
  mode: 'edit',
  dirty: false,
  paletteOpen: initialPaletteOpen,
};

export type LayoutUpdate = Pick<Widget, 'id'> & { layout: WidgetLayout };

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    loadDashboard(state, action: PayloadAction<Dashboard>) {
      const { id, name, propertyId, widgets } = action.payload;
      state.dashboardId = id;
      state.name = name;
      state.propertyId = propertyId;
      state.widgets = widgets;
      state.selectedId = null;
      state.mode = 'edit';
      state.dirty = false;
    },
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
      state.dirty = true;
    },
    setPropertyId(state, action: PayloadAction<string>) {
      if (state.propertyId === action.payload) return;
      state.propertyId = action.payload;
      for (const widget of state.widgets) {
        widget.query.propertyId = action.payload;
      }
      state.dirty = true;
    },
    addWidget(state, action: PayloadAction<Widget>) {
      state.widgets.push(action.payload);
      state.selectedId = action.payload.id;
      state.dirty = true;
    },
    removeWidget(state, action: PayloadAction<string>) {
      state.widgets = state.widgets.filter((w) => w.id !== action.payload);
      if (state.selectedId === action.payload) {
        state.selectedId = null;
      }
      state.dirty = true;
    },
    selectWidget(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
    updateLayout(state, action: PayloadAction<LayoutUpdate[]>) {
      const byId = new Map(action.payload.map((u) => [u.id, u.layout]));
      for (const widget of state.widgets) {
        const next = byId.get(widget.id);
        if (next) widget.layout = next;
      }
      state.dirty = true;
    },
    updateWidget(
      state,
      action: PayloadAction<{
        id: string;
        patch: {
          title?: Widget['title'];
          type?: Widget['type'];
          layout?: Widget['layout'];
          display?: Partial<Widget['display']>;
          query?: Partial<Widget['query']>;
        };
      }>,
    ) {
      const { id, patch } = action.payload;
      const widget = state.widgets.find((w) => w.id === id);
      if (!widget) return;
      if (patch.title !== undefined) widget.title = patch.title;
      if (patch.type !== undefined) widget.type = patch.type;
      if (patch.layout !== undefined) widget.layout = patch.layout;
      if (patch.display !== undefined) {
        widget.display = { ...widget.display, ...patch.display };
      }
      if (patch.query !== undefined) {
        widget.query = { ...widget.query, ...patch.query };
      }
      state.dirty = true;
    },
    setMode(state, action: PayloadAction<EditorMode>) {
      state.mode = action.payload;
    },
    markClean(state) {
      state.dirty = false;
    },
    setPaletteOpen(state, action: PayloadAction<boolean>) {
      state.paletteOpen = action.payload;
    },
    togglePalette(state) {
      state.paletteOpen = !state.paletteOpen;
    },
  },
});

export const {
  loadDashboard,
  setName,
  setPropertyId,
  addWidget,
  removeWidget,
  selectWidget,
  updateLayout,
  updateWidget,
  setMode,
  markClean,
  setPaletteOpen,
  togglePalette,
} = editorSlice.actions;

export default editorSlice.reducer;
