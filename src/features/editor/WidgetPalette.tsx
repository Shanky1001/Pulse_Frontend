import type { DragEvent } from 'react';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import type { WidgetType } from '@/types/dashboard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addWidget, setPaletteOpen } from '@/store/slices/editorSlice';
import { nanoid } from '@reduxjs/toolkit';

import { WIDGET_REGISTRY, WIDGET_TYPES, getWidgetDefinition } from '../widgets/registry';
import { WIDGET_DND_MIME, setDraggingType } from './dragState';

type Props = {
  variant?: 'sidebar' | 'drawer';
  onItemAdded?: () => void;
};

export default function WidgetPalette({ variant = 'sidebar', onItemAdded }: Props) {
  const dispatch = useAppDispatch();
  const propertyId = useAppSelector((s) => s.editor.propertyId);
  const editMode = useAppSelector((s) => s.editor.mode === 'edit');

  const handleDragStart = (type: WidgetType) => (e: DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData(WIDGET_DND_MIME, type);
    e.dataTransfer.setData('text/plain', type);
    setDraggingType(type);
  };

  const handleDragEnd = () => setDraggingType(null);

  const addByClick = (type: WidgetType) => {
    const def = getWidgetDefinition(type);
    dispatch(
      addWidget({
        id: `w_${nanoid(8)}`,
        type,
        title: def.label,
        query: { ...def.defaultQuery, propertyId },
        display: { ...def.defaultDisplay },
        layout: {
          x: 0,
          y: Number.MAX_SAFE_INTEGER,
          w: def.defaultLayout.w,
          h: def.defaultLayout.h,
        },
      }),
    );
    onItemAdded?.();
  };

  return (
    <Box
      component="aside"
      sx={(t) => ({
        width: variant === 'drawer' ? 280 : 248,
        height: '100%',
        flexShrink: 0,
        borderRight: variant === 'sidebar' ? '1px solid' : 'none',
        borderColor: 'divider',
        bgcolor: t.palette.background.paper,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, pt: 2, pb: 0.5 }}
      >
        <Typography variant="overline" color="text.secondary">
          Widgets
        </Typography>
        {variant === 'sidebar' ? (
          <Tooltip title="Hide widgets panel">
            <IconButton size="small" onClick={() => dispatch(setPaletteOpen(false))} aria-label="Hide widgets">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 1.5 }}>
        {editMode ? 'Drag onto the canvas, or tap to append.' : 'Switch to Edit mode to add widgets.'}
      </Typography>
      <Stack spacing={1} sx={{ px: 1.5, pb: 2 }}>
        {WIDGET_TYPES.map((type) => {
          const def = WIDGET_REGISTRY[type];
          const Icon = def.icon;
          return (
            <Box
              key={type}
              draggable={editMode}
              onDragStart={handleDragStart(type)}
              onDragEnd={handleDragEnd}
              onClick={() => editMode && addByClick(type)}
              sx={(t) => ({
                p: 1.25,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                cursor: editMode ? 'grab' : 'not-allowed',
                opacity: editMode ? 1 : 0.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                transition: 'border-color 120ms, background-color 120ms',
                '&:hover': editMode
                  ? {
                      borderColor: 'primary.main',
                      bgcolor: t.palette.action.hover,
                    }
                  : undefined,
                '&:active': editMode ? { cursor: 'grabbing' } : undefined,
              })}
            >
              <Box
                sx={(t) => ({
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: t.palette.action.hover,
                  color: 'primary.main',
                  flexShrink: 0,
                })}
              >
                <Icon />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {def.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {def.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
