import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  useLazyGetDashboardQuery,
  useSaveDashboardMutation,
} from '@/store/api/dashboardsApi';
import { loadDashboard } from '@/store/slices/editorSlice';
import {
  buildDefaultDashboard,
  dashboardIdForProperty,
} from '@/fixtures/defaultDashboard';
import { setLastPropertyId } from '@/lib/lastProperty';

export function useTenantSwitch() {
  const dispatch = useAppDispatch();
  const editor = useAppSelector((s) => s.editor);
  const [fetchDashboard] = useLazyGetDashboardQuery();
  const [saveDashboard] = useSaveDashboardMutation();

  return useCallback(
    async (nextPropertyId: string) => {
      if (!nextPropertyId || nextPropertyId === editor.propertyId) return;

      // Auto-save the outgoing tenant's dashboard if it has unsaved changes.
      if (editor.dirty && editor.dashboardId) {
        try {
          await saveDashboard({
            id: editor.dashboardId,
            name: editor.name,
            propertyId: editor.propertyId,
            widgets: editor.widgets,
            updatedAt: new Date().toISOString(),
          }).unwrap();
        } catch {
          // best-effort; don't block the switch
        }
      }

      const id = dashboardIdForProperty(nextPropertyId);
      const incoming = await fetchDashboard(id).unwrap().catch(() => null);
      dispatch(loadDashboard(incoming ?? buildDefaultDashboard(nextPropertyId)));
      setLastPropertyId(nextPropertyId);
    },
    [dispatch, editor, fetchDashboard, saveDashboard],
  );
}
