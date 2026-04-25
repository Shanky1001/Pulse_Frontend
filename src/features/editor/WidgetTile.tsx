import {
	useEffect,
	useRef,
	useState,
	type KeyboardEvent,
	type MouseEvent,
} from "react";
import {
	Box,
	Chip,
	IconButton,
	InputBase,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import type { Widget } from "@/types/dashboard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	addWidget,
	removeWidget,
	selectWidget,
	setMode,
	updateWidget,
} from "@/store/slices/editorSlice";
import { nanoid } from "@reduxjs/toolkit";
import { getWidgetDefinition } from "../widgets/registry";
import { useWidgetData } from "../widgets/useWidgetData";

type Props = {
	widget: Widget;
};

export default function WidgetTile({ widget }: Props) {
	const dispatch = useAppDispatch();
	const def = getWidgetDefinition(widget.type);
	const { data, isLoading, isFetching, error, refetch } =
		useWidgetData(widget);
	const selected = useAppSelector((s) => s.editor.selectedId === widget.id);
	const editMode = useAppSelector((s) => s.editor.mode === "edit");
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [renaming, setRenaming] = useState(false);
	const [draftTitle, setDraftTitle] = useState(widget.title);
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (!renaming) setDraftTitle(widget.title);
	}, [widget.title, renaming]);

	useEffect(() => {
		if (renaming) {
			const id = window.setTimeout(() => inputRef.current?.select(), 0);
			return () => window.clearTimeout(id);
		}
	}, [renaming]);

	const handleSelect = (e: MouseEvent) => {
		e.stopPropagation();
		if (editMode) dispatch(selectWidget(null));
	};

	const handleEdit = (e: MouseEvent) => {
		e.stopPropagation();
		closeMenu();
		if (!editMode) dispatch(setMode("edit"));
		dispatch(selectWidget(widget.id));
	};

	const startRename = (e?: MouseEvent) => {
		e?.stopPropagation();
		if (!editMode) return;
		setDraftTitle(widget.title);
		setRenaming(true);
	};

	const commitRename = () => {
		const next = draftTitle.trim();
		if (next && next !== widget.title) {
			dispatch(updateWidget({ id: widget.id, patch: { title: next } }));
		} else {
			setDraftTitle(widget.title);
		}
		setRenaming(false);
	};

	const cancelRename = () => {
		setDraftTitle(widget.title);
		setRenaming(false);
	};

	const onTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			commitRename();
		} else if (e.key === "Escape") {
			e.preventDefault();
			cancelRename();
		}
	};

	const openMenu = (e: MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		setAnchor(e.currentTarget);
	};
	const closeMenu = () => setAnchor(null);

	const onDuplicate = (e: MouseEvent) => {
		e.stopPropagation();
		closeMenu();
		dispatch(
			addWidget({
				...widget,
				id: `w_${nanoid(8)}`,
				title: `${widget.title} (copy)`,
				layout: { ...widget.layout, x: 0, y: Number.MAX_SAFE_INTEGER },
			}),
		);
	};

	const onRemove = (e: MouseEvent) => {
		e.stopPropagation();
		closeMenu();
		dispatch(removeWidget(widget.id));
	};

	const onRefresh = (e: MouseEvent) => {
		e.stopPropagation();
		closeMenu();
		refetch();
	};

	const Renderer = def.Renderer;

	return (
		<Paper
			elevation={0}
			onClick={handleSelect}
			sx={(t) => ({
				position: "relative",
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				borderRadius: 2,
				border: "1px solid",
				borderColor: selected ? "primary.main" : "divider",
				boxShadow: selected
					? `0 0 0 2px ${t.palette.primary.main}33`
					: "none",
				bgcolor: "background.paper",
				overflow: "hidden",
				transition: "border-color 120ms, box-shadow 120ms",
				cursor: "default",
				"&:hover .widget-edit-btn": { opacity: 1 },
			})}
		>
			<Stack
				direction="row"
				alignItems="center"
				spacing={0.75}
				sx={{
					px: 1,
					py: 0.75,
					borderBottom: "1px solid",
					borderColor: "divider",
					minHeight: 40,
					bgcolor: "background.paper",
				}}
			>
				{editMode ? (
					<Tooltip title="Drag to move" enterDelay={500}>
						<Box
							className="drag-handle"
							sx={{
								cursor: "grab",
								color: "text.disabled",
								display: "inline-flex",
								"&:active": { cursor: "grabbing" },
							}}
						>
							<DragIndicatorRoundedIcon fontSize="small" />
						</Box>
					</Tooltip>
				) : null}

				{renaming ? (
					<InputBase
						inputRef={inputRef}
						autoFocus
						value={draftTitle}
						onChange={(e) => setDraftTitle(e.target.value)}
						onBlur={commitRename}
						onKeyDown={onTitleKeyDown}
						onClick={(e) => e.stopPropagation()}
						sx={{
							flex: 1,
							minWidth: 0,
							fontWeight: 600,
							fontSize: 14,
							px: 0.5,
							borderRadius: 1,
							bgcolor: (t) => t.palette.action.hover,
						}}
						inputProps={{
							"aria-label": "Widget title",
							maxLength: 80,
						}}
					/>
				) : (
					<Tooltip
						title={editMode ? "Double-click to rename" : ""}
						enterDelay={500}
					>
						<Typography
							variant="body2"
							sx={{
								fontWeight: 600,
								flex: 1,
								minWidth: 0,
								cursor: editMode ? "text" : "inherit",
								userSelect: "none",
							}}
							noWrap
							onDoubleClick={startRename}
						>
							{widget.title}
						</Typography>
					</Tooltip>
				)}

				{selected && editMode && !renaming ? (
					<Chip
						size="small"
						label="Editing"
						color="primary"
						variant="outlined"
						sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
					/>
				) : null}

				{isFetching && !isLoading ? (
					<Typography variant="caption" color="text.secondary">
						Refreshing…
					</Typography>
				) : null}

				<Tooltip
					title={
						editMode
							? "Edit properties"
							: "Edit (switches to Edit mode)"
					}
				>
					<IconButton
						size="small"
						onClick={handleEdit}
						aria-label="Edit widget properties"
						className="widget-edit-btn"
						sx={{
							opacity: { xs: 1, md: selected ? 1 : 0 },
							transition: "opacity 120ms",
							color: selected ? "primary.main" : "text.secondary",
						}}
					>
						<EditRoundedIcon fontSize="small" />
					</IconButton>
				</Tooltip>

				{editMode ? (
					<Tooltip title="More actions">
						<IconButton
							size="small"
							onClick={openMenu}
							aria-label="Widget actions"
						>
							<MoreVertRoundedIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				) : null}

				<Menu
					anchorEl={anchor}
					open={Boolean(anchor)}
					onClose={closeMenu}
					disableScrollLock
					onClick={(e) => e.stopPropagation()}
				>
					<MenuItem onClick={handleEdit}>
						<ListItemIcon>
							<TuneRoundedIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText
							primary="Edit properties"
							secondary="Title, metrics, dimensions, display"
							secondaryTypographyProps={{ fontSize: 11 }}
						/>
					</MenuItem>
					<MenuItem
						onClick={(e) => {
							e.stopPropagation();
							closeMenu();
							startRename();
						}}
					>
						<ListItemIcon>
							<EditRoundedIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Rename</ListItemText>
					</MenuItem>
					<MenuItem onClick={onRefresh}>
						<ListItemIcon>
							<RefreshRoundedIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Refresh data</ListItemText>
					</MenuItem>
					<MenuItem onClick={onDuplicate}>
						<ListItemIcon>
							<ContentCopyRoundedIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Duplicate</ListItemText>
					</MenuItem>
					<MenuItem onClick={onRemove}>
						<ListItemIcon>
							<DeleteOutlineRoundedIcon
								fontSize="small"
								color="error"
							/>
						</ListItemIcon>
						<ListItemText sx={{ color: "error.main" }}>
							Remove
						</ListItemText>
					</MenuItem>
				</Menu>
			</Stack>

			<Box sx={{ flex: 1, minHeight: 0 }}>
				<Renderer
					widget={widget}
					data={data}
					loading={isLoading}
					error={error}
					display={widget.display as any}
				/>
			</Box>
		</Paper>
	);
}
