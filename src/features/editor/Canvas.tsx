import { useCallback, useMemo, useState } from "react";
import { Box } from "@mui/material";
import GridLayout, { WidthProvider, type Layout } from "react-grid-layout";
import { nanoid } from "@reduxjs/toolkit";

import type { Widget } from "@/types/dashboard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	addWidget,
	selectWidget,
	updateLayout,
	type LayoutUpdate,
} from "@/store/slices/editorSlice";
import { useSaveDashboardMutation } from "@/store/api/dashboardsApi";
import { getWidgetDefinition } from "../widgets/registry";
import EmptyState from "@/components/EmptyState";
import WidgetTile from "./WidgetTile";
import { getDraggingType, setDraggingType } from "./dragState";

const ReactGridLayout = WidthProvider(GridLayout);
const COLS = 12;
const ROW_HEIGHT = 64;
const DROPPING_KEY = "__dropping__";

function collides(a: Layout, b: Layout): boolean {
	if (a.i === b.i) return false;
	return !(
		a.x + a.w <= b.x ||
		a.x >= b.x + b.w ||
		a.y + a.h <= b.y ||
		a.y >= b.y + b.h
	);
}

function compactVertical(input: Layout[], cols: number): Layout[] {
	const items = input
		.filter((l) => l.i !== DROPPING_KEY)
		.map((l) => ({ ...l }));

	items.sort((a, b) => a.y - b.y || a.x - b.x || a.i.localeCompare(b.i));

	const placed: Layout[] = [];
	for (const item of items) {
		const maxX = Math.max(0, cols - item.w);
		item.x = Math.max(0, Math.min(item.x, maxX));
		item.y = Math.max(0, item.y);

		while (item.y > 0) {
			const candidate = { ...item, y: item.y - 1 };
			if (placed.some((p) => collides(candidate, p))) break;
			item.y -= 1;
		}

		placed.push(item);
	}

	const byId = new Map(placed.map((p) => [p.i, p] as const));
	return input.map((l) => (l.i === DROPPING_KEY ? l : (byId.get(l.i) ?? l)));
}

export default function Canvas() {
	const dispatch = useAppDispatch();
	const widgets = useAppSelector((s) => s.editor.widgets);
	const dashboardId = useAppSelector((s) => s.editor.dashboardId);
	const dashboardName = useAppSelector((s) => s.editor.name);
	const propertyId = useAppSelector((s) => s.editor.propertyId);
	const editMode = useAppSelector((s) => s.editor.mode === "edit");
	const [, forceUpdate] = useState(0);
	const [saveDashboard] = useSaveDashboardMutation();

	const layout = useMemo((): Layout[] => {
		return widgets.map((w) => ({
			i: w.id,
			x: w.layout.x,
			y: w.layout.y,
			w: w.layout.w,
			h: w.layout.h,
			minW: 2,
			minH: 2,
		}));
	}, [widgets]);

	const applyLayoutUpdates = useCallback(
		(updates: LayoutUpdate[]): Widget[] => {
			if (updates.length === 0) return widgets;
			const byId = new Map(updates.map((u) => [u.id, u.layout] as const));
			return widgets.map((w) => {
				const next = byId.get(w.id);
				return next ? { ...w, layout: next } : w;
			});
		},
		[widgets],
	);

	const persistLayout = useCallback(
		(current: Layout[]) => {
			const updates: LayoutUpdate[] = current
				.filter((l) => l.i !== DROPPING_KEY)
				.map((l) => ({
					id: l.i,
					layout: { x: l.x, y: l.y, w: l.w, h: l.h },
				}));
			if (updates.length === 0) return;
			const same = updates.every((u) => {
				const w = widgets.find((x) => x.id === u.id);
				return (
					!!w &&
					w.layout.x === u.layout.x &&
					w.layout.y === u.layout.y &&
					w.layout.w === u.layout.w &&
					w.layout.h === u.layout.h
				);
			});
			if (same) return;

			dispatch(updateLayout(updates));

			// Persist layout/resize changes immediately so they survive reload.
			if (!dashboardId) return;
			const nextWidgets = applyLayoutUpdates(updates);
			void saveDashboard({
				id: dashboardId,
				name: dashboardName,
				propertyId,
				widgets: nextWidgets,
				updatedAt: new Date().toISOString(),
			});
		},
		[
			applyLayoutUpdates,
			dashboardId,
			dashboardName,
			dispatch,
			propertyId,
			saveDashboard,
			widgets,
		],
	);

	const handleDragStop = useCallback(
		(current: Layout[]) => {
			persistLayout(compactVertical(current, COLS));
		},
		[persistLayout],
	);

	const handleResizeStop = useCallback(
		(current: Layout[]) => {
			persistLayout(compactVertical(current, COLS));
		},
		[persistLayout],
	);

	const handleDrop = useCallback(
		(_layout: Layout[], item: Layout) => {
			const type = getDraggingType();
			setDraggingType(null);
			if (!type) return;
			const def = getWidgetDefinition(type);
			const widget: Widget = {
				id: `w_${nanoid(8)}`,
				type,
				title: def.label,
				query: { ...def.defaultQuery, propertyId },
				display: { ...def.defaultDisplay },
				layout: {
					x: item.x,
					y: item.y,
					w: def.defaultLayout.w,
					h: def.defaultLayout.h,
				},
			};
			dispatch(addWidget(widget));
		},
		[dispatch, propertyId],
	);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		if (getDraggingType()) {
			e.preventDefault();
			forceUpdate((n) => n + 1);
		}
	}, []);

	const droppingType = getDraggingType();
	const droppingItem = useMemo(() => {
		if (!droppingType) return { i: DROPPING_KEY, w: 4, h: 3 };
		const def = getWidgetDefinition(droppingType);
		return {
			i: DROPPING_KEY,
			w: def.defaultLayout.w,
			h: def.defaultLayout.h,
		};
	}, [droppingType]);

	return (
		<Box
			onDragOver={handleDragOver}
			onClick={() => dispatch(selectWidget(null))}
			sx={(t) => ({
				position: "relative",
				flex: 1,
				minWidth: 0,
				minHeight: 0,
				overflowY: "auto",
				p: 2,
				bgcolor: t.palette.background.default,
				"& .react-grid-item.react-grid-placeholder": {
					background: `${t.palette.primary.main}33`,
					borderRadius: 8,
					border: `2px dashed ${t.palette.primary.main}`,
					opacity: 1,
				},
				"& .react-grid-item .react-resizable-handle": {
					opacity: 0,
					transition: "opacity 120ms",
					pointerEvents: editMode ? "auto" : "none",
				},
				"& .react-grid-item:hover .react-resizable-handle": {
					opacity: editMode ? 0.8 : 0,
				},
			})}
		>
			<ReactGridLayout
				className="layout"
				layout={layout}
				cols={COLS}
				rowHeight={ROW_HEIGHT}
				margin={[16, 16]}
				containerPadding={[0, 0]}
				isDraggable={editMode}
				isResizable={editMode}
				isDroppable={editMode}
				resizeHandles={["s", "w", "e", "n", "sw", "nw", "se", "ne"]}
				draggableHandle=".drag-handle"
				onDrop={handleDrop}
				onDragStop={handleDragStop}
				onResizeStop={handleResizeStop}
				droppingItem={droppingItem}
				compactType={editMode ? "vertical" : null}
				preventCollision={false}
				measureBeforeMount={false}
				useCSSTransforms
				style={{ minHeight: widgets.length === 0 ? "60vh" : undefined }}
			>
				{widgets.map((w) => (
					<div key={w.id}>
						<WidgetTile widget={w} />
					</div>
				))}
			</ReactGridLayout>
			{widgets.length === 0 ? (
				<Box
					sx={{
						position: "absolute",
						inset: 0,
						pointerEvents: "none",
						display: "grid",
						placeItems: "center",
					}}
				>
					<EmptyState />
				</Box>
			) : null}
		</Box>
	);
}
