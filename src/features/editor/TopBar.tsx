import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Avatar,
	Badge,
	Box,
	Button,
	Chip,
	CircularProgress,
	Divider,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import Logo from "@/components/Logo";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { disconnect } from "@/store/slices/authSlice";
import {
	markClean,
	setMode,
	setName,
	togglePalette,
	type EditorMode,
} from "@/store/slices/editorSlice";
import { useListPropertiesQuery } from "@/store/api/propertiesApi";
import { useSaveDashboardMutation } from "@/store/api/dashboardsApi";
import { useDisconnectMutation } from "@/store/api/authApi";
import { baseApi } from "@/store/api/baseApi";
import { setLocalTestSession } from "@/lib/localTestSession";
import { useTenantSwitch } from "./useTenantSwitch";

export default function TopBar() {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const editor = useAppSelector((s) => s.editor);
	const user = useAppSelector((s) => s.auth.user);
	const { data: properties = [], isLoading: loadingProps } =
		useListPropertiesQuery();
	const [saveDashboard, saveState] = useSaveDashboardMutation();
	const [disconnectAction] = useDisconnectMutation();
	const switchTenant = useTenantSwitch();
	const [userMenu, setUserMenu] = useState<HTMLElement | null>(null);
	const [overflowMenu, setOverflowMenu] = useState<HTMLElement | null>(null);

	const theme = useTheme();
	const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
	const isTablet = useMediaQuery(theme.breakpoints.up("sm"));
	const isCompact = useMediaQuery(theme.breakpoints.down("sm"));

	const handleSave = async () => {
		await saveDashboard({
			id: editor.dashboardId,
			name: editor.name,
			propertyId: editor.propertyId,
			widgets: editor.widgets,
			updatedAt: new Date().toISOString(),
		}).unwrap();
		dispatch(markClean());
	};

	const handleRefresh = () => {
		dispatch(baseApi.util.invalidateTags(["Query"]));
		setOverflowMenu(null);
	};

	const handleLogout = async () => {
		setUserMenu(null);
		setLocalTestSession(false);
		try {
			await disconnectAction().unwrap();
		} catch {
			// even if revoke fails, clear local session and continue
		}
		dispatch(disconnect());
		navigate("/login", { replace: true });
	};

	const handleSetMode = (m: EditorMode) => {
		dispatch(setMode(m));
		setOverflowMenu(null);
	};

	const selectedProperty = properties.find(
		(p) => p.propertyId === editor.propertyId,
	);

	return (
		<Box
			component="header"
			sx={{ flexShrink: 0, zIndex: 2, px: { xs: 1, sm: 2 }, py: 1.25 }}
		>
			<Box
				sx={(t) => ({
					width: "100%",
					minHeight: 64,
					display: "flex",
					alignItems: "center",
					gap: { xs: 1, sm: 1.5 },
					px: { xs: 1, sm: 1.5 },
					py: 1,
					borderRadius: 3,
					border: "1px solid",
					borderColor: "divider",
					bgcolor: t.palette.background.paper,
					boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
					overflow: "hidden",
				})}
			>
				<Tooltip
					title={
						editor.paletteOpen
							? "Hide widgets panel"
							: "Show widgets panel"
					}
				>
					<IconButton
						size="small"
						onClick={() => dispatch(togglePalette())}
						aria-label="Toggle widgets panel"
						sx={{ flexShrink: 0 }}
					>
						{editor.paletteOpen && isDesktop ? (
							<ChevronRightRoundedIcon />
						) : (
							<MenuRoundedIcon />
						)}
					</IconButton>
				</Tooltip>

				<Stack
					direction="row"
					alignItems="center"
					spacing={1}
					sx={{ minWidth: 0, flexShrink: 0 }}
				>
					{isTablet ? <Logo /> : <Logo showWordmark={false} />}
				</Stack>

				<Divider
					orientation="vertical"
					flexItem
					sx={{ height: 34, mx: 0.5 }}
				/>

				<Stack
					direction="row"
					alignItems="center"
					spacing={1}
					sx={{ minWidth: 0, flex: 1 }}
				>
					<GridViewRoundedIcon fontSize="small" color="action" />
					<TextField
						variant="standard"
						value={editor.name}
						onChange={(e) => dispatch(setName(e.target.value))}
						InputProps={{
							disableUnderline: true,
							sx: {
								fontWeight: 650,
								fontSize: { xs: 14, sm: 16 },
								lineHeight: 1.2,
							},
						}}
						sx={{
							minWidth: 0,
							flex: 1,
							maxWidth: { xs: 140, sm: 260, md: 360 },
						}}
					/>

					{isTablet ? (
						editor.dirty ? (
							<Chip
								size="small"
								label="Unsaved"
								color="warning"
								variant="outlined"
							/>
						) : (
							<Chip
								size="small"
								label="Saved"
								color="success"
								variant="outlined"
								icon={<CheckCircleRoundedIcon />}
							/>
						)
					) : editor.dirty ? (
						<Box
							aria-label="Unsaved changes"
							sx={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								bgcolor: "warning.main",
								flexShrink: 0,
							}}
						/>
					) : (
						<Box
							aria-label="Saved"
							sx={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								bgcolor: "success.main",
								flexShrink: 0,
							}}
						/>
					)}
				</Stack>

				<Box sx={{ flex: 1, display: { xs: "none", md: "block" } }} />

				{!isCompact ? (
					<TextField
						select
						size="small"
						label="Property"
						value={editor.propertyId}
						onChange={(e) => void switchTenant(e.target.value)}
						disabled={loadingProps}
						sx={{
							minWidth: { sm: 220, md: 300 },
							maxWidth: { sm: 300, md: 360 },
							"& .MuiInputBase-input": {
								py: { xs: 0.75, sm: 1 },
								fontSize: { xs: 13, sm: 14 },
								fontWeight: 600,
							},
							"& .MuiOutlinedInput-root": {
								borderRadius: 999,
								bgcolor: "background.default",
							},
						}}
						SelectProps={{
							renderValue: (val) => {
								const p = properties.find(
									(x) => x.propertyId === val,
								);
								return (
									<Stack
										direction="row"
										spacing={1}
										alignItems="center"
										sx={{ minWidth: 0 }}
									>
										<BarChartRoundedIcon
											fontSize="small"
											color="action"
										/>
										<Typography
											variant="body2"
											noWrap
											sx={{
												fontWeight: 600,
												minWidth: 0,
											}}
										>
											{p?.propertyName ??
												"Select property"}
										</Typography>
									</Stack>
								);
							},
							MenuProps: {
								disableScrollLock: true,
								PaperProps: { sx: { maxHeight: 320 } },
							},
						}}
					>
						{properties.map((p) => (
							<MenuItem
								key={p.propertyId}
								value={p.propertyId}
								dense
								sx={{ py: 0.75 }}
							>
								<Box sx={{ minWidth: 0 }}>
									<Typography
										variant="body2"
										noWrap
										sx={{
											fontWeight: 500,
											lineHeight: 1.3,
										}}
									>
										{p.propertyName}
									</Typography>
									<Typography
										variant="caption"
										color="text.secondary"
										noWrap
										sx={{ lineHeight: 1.2 }}
									>
										{p.accountName} · {p.propertyId}
									</Typography>
								</Box>
							</MenuItem>
						))}
					</TextField>
				) : null}

				{isDesktop || isTablet ? (
					<Tooltip title="Refresh all widgets">
						<IconButton onClick={handleRefresh} size="small">
							<RefreshRoundedIcon />
						</IconButton>
					</Tooltip>
				) : null}

				{isDesktop ? (
					<ToggleButtonGroup
						size="small"
						exclusive
						value={editor.mode}
						onChange={(_, v: EditorMode | null) =>
							v && dispatch(setMode(v))
						}
						sx={{
							borderRadius: 999,
							bgcolor: "background.default",
							"& .MuiToggleButton-root": {
								px: 1.5,
								border: "none",
								borderRadius: 999,
								textTransform: "none",
								fontWeight: 650,
							},
						}}
					>
						<ToggleButton value="edit" sx={{ px: 1.5 }}>
							<EditRoundedIcon
								fontSize="small"
								sx={{ mr: 0.5 }}
							/>
							Edit
						</ToggleButton>
						<ToggleButton value="view" sx={{ px: 1.5 }}>
							<VisibilityRoundedIcon
								fontSize="small"
								sx={{ mr: 0.5 }}
							/>
							View
						</ToggleButton>
					</ToggleButtonGroup>
				) : null}

				{isDesktop ? (
					<Button
						variant="contained"
						disableElevation
						onClick={handleSave}
						disabled={!editor.dirty || saveState.isLoading}
						startIcon={
							saveState.isLoading ? (
								<CircularProgress size={14} color="inherit" />
							) : undefined
						}
						sx={{
							borderRadius: 999,
							px: 2,
							bgcolor: "#0b132b",
							"&:hover": { bgcolor: "#111c3a" },
							textTransform: "none",
							fontWeight: 700,
						}}
					>
						Save
					</Button>
				) : (
					<Tooltip title="Save dashboard">
						<span>
							<IconButton
								onClick={handleSave}
								disabled={!editor.dirty || saveState.isLoading}
								color="primary"
								size="small"
							>
								{saveState.isLoading ? (
									<CircularProgress
										size={18}
										color="inherit"
									/>
								) : (
									<SaveRoundedIcon />
								)}
							</IconButton>
						</span>
					</Tooltip>
				)}

				{!isDesktop ? (
					<Tooltip title="More actions">
						<IconButton
							size="small"
							onClick={(e) => setOverflowMenu(e.currentTarget)}
							aria-label="More actions"
						>
							<MoreVertRoundedIcon />
						</IconButton>
					</Tooltip>
				) : null}

				<Tooltip title={user?.email ?? "Account"}>
					<IconButton
						onClick={(e) => setUserMenu(e.currentTarget)}
						size="small"
					>
						<Badge
							overlap="circular"
							variant="dot"
							color="success"
							anchorOrigin={{
								vertical: "bottom",
								horizontal: "right",
							}}
							sx={{
								"& .MuiBadge-badge": {
									boxShadow: (t) =>
										`0 0 0 2px ${t.palette.background.paper}`,
								},
							}}
						>
							<Avatar
								sx={{
									width: 34,
									height: 34,
									bgcolor: "primary.main",
									fontSize: 14,
									fontWeight: 700,
								}}
							>
								{(user?.name ?? "U").slice(0, 1).toUpperCase()}
							</Avatar>
						</Badge>
					</IconButton>
				</Tooltip>
			</Box>

			<Menu
				anchorEl={overflowMenu}
				open={Boolean(overflowMenu)}
				onClose={() => setOverflowMenu(null)}
				disableScrollLock
			>
				<MenuItem onClick={handleRefresh}>
					<ListItemIcon>
						<RefreshRoundedIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Refresh widgets</ListItemText>
				</MenuItem>
				<Divider />
				<MenuItem
					onClick={() => handleSetMode("edit")}
					selected={editor.mode === "edit"}
				>
					<ListItemIcon>
						<EditRoundedIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Edit mode</ListItemText>
				</MenuItem>
				<MenuItem
					onClick={() => handleSetMode("view")}
					selected={editor.mode === "view"}
				>
					<ListItemIcon>
						<VisibilityRoundedIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>View mode</ListItemText>
				</MenuItem>
				{!isTablet ? (
					<>
						<Divider />
						<Box sx={{ px: 2, py: 1 }}>
							<Typography
								variant="caption"
								color="text.secondary"
								display="block"
								sx={{ mb: 0.75 }}
							>
								Switch property
							</Typography>
							{properties.map((p) => (
								<MenuItem
									key={p.propertyId}
									dense
									selected={
										p.propertyId === editor.propertyId
									}
									onClick={() => {
										void switchTenant(p.propertyId);
										setOverflowMenu(null);
									}}
									sx={{
										borderRadius: 1.5,
										mx: -1,
										my: 0.25,
									}}
								>
									<Box sx={{ minWidth: 0 }}>
										<Typography
											variant="body2"
											noWrap
											sx={{
												fontWeight: 600,
												lineHeight: 1.3,
											}}
										>
											{p.propertyName}
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
											noWrap
											sx={{ lineHeight: 1.2 }}
										>
											{p.accountName}
										</Typography>
									</Box>
								</MenuItem>
							))}
						</Box>
					</>
				) : selectedProperty ? (
					<>
						<Divider />
						<Box sx={{ px: 2, py: 1, maxWidth: 260 }}>
							<Typography
								variant="caption"
								color="text.secondary"
								display="block"
							>
								Property
							</Typography>
							<Typography
								variant="body2"
								noWrap
								sx={{ fontWeight: 600 }}
							>
								{selectedProperty.propertyName}
							</Typography>
							<Typography
								variant="caption"
								color="text.secondary"
								noWrap
							>
								{selectedProperty.accountName}
							</Typography>
						</Box>
					</>
				) : null}
			</Menu>

			<Menu
				anchorEl={userMenu}
				open={Boolean(userMenu)}
				onClose={() => setUserMenu(null)}
				disableScrollLock
			>
				<Box sx={{ px: 2, py: 1 }}>
					<Typography variant="body2" sx={{ fontWeight: 600 }}>
						{user?.name}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{user?.email}
					</Typography>
				</Box>
				<Divider />
				<MenuItem onClick={handleLogout}>
					<ListItemIcon>
						<LogoutRoundedIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Sign out</ListItemText>
				</MenuItem>
			</Menu>
		</Box>
	);
}
