import { useEffect, useRef } from 'react';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadDashboard, selectWidget, setPaletteOpen } from '@/store/slices/editorSlice';
import {
  buildDefaultDashboard,
  dashboardIdForProperty,
} from '@/fixtures/defaultDashboard';
import { useLazyGetDashboardQuery } from '@/store/api/dashboardsApi';
import { useListPropertiesQuery } from '@/store/api/propertiesApi';
import { getLastPropertyId, setLastPropertyId } from '@/lib/lastProperty';

import TopBar from './TopBar';
import WidgetPalette from './WidgetPalette';
import Canvas from './Canvas';
import ConfigPanel from './ConfigPanel';

export default function DashboardEditorPage() {
  const dispatch = useAppDispatch();
  const editorReady = useAppSelector((s) => Boolean(s.editor.dashboardId));
  const paletteOpen = useAppSelector((s) => s.editor.paletteOpen);
  const selectedId = useAppSelector((s) => s.editor.selectedId);

  const { data: properties } = useListPropertiesQuery();
  const [fetchDashboard] = useLazyGetDashboardQuery();
  const initRef = useRef(false);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    if (editorReady) return;
    if (initRef.current) return;
    if (!properties || properties.length === 0) return;

    initRef.current = true;
    void (async () => {
      const remembered = getLastPropertyId();
      const valid = remembered && properties.some((p) => p.propertyId === remembered);
      const propertyId = valid ? remembered : properties[0].propertyId;

      const id = dashboardIdForProperty(propertyId);
      const saved = await fetchDashboard(id).unwrap().catch(() => null);
      dispatch(loadDashboard(saved ?? buildDefaultDashboard(propertyId)));
      setLastPropertyId(propertyId);
    })();
  }, [dispatch, editorReady, properties, fetchDashboard]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <TopBar />
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {isDesktop && paletteOpen ? <WidgetPalette /> : null}
        <Canvas />
        {isDesktop ? <ConfigPanel /> : null}
      </Box>

      {!isDesktop ? (
        <Drawer
          anchor="left"
          open={paletteOpen}
          onClose={() => dispatch(setPaletteOpen(false))}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { width: 'min(85vw, 320px)' } }}
        >
          <WidgetPalette
            variant="drawer"
            onItemAdded={() => dispatch(setPaletteOpen(false))}
          />
        </Drawer>
      ) : null}

      {!isDesktop ? (
        <Drawer
          anchor="right"
          open={Boolean(selectedId)}
          onClose={() => dispatch(selectWidget(null))}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { width: 'min(90vw, 360px)' } }}
        >
          <ConfigPanel />
        </Drawer>
      ) : null}
    </Box>
  );
}
