import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Divider,
	Stack,
	Typography,
} from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import Logo from "@/components/Logo";
import GoogleIcon from "@/components/GoogleIcon";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { googleLoginUrl } from "@/store/api/authApi";
import { connect } from "@/store/slices/authSlice";
import { getLocalTestUser, setLocalTestSession } from "@/lib/localTestSession";

const FEATURE_BULLETS = [
	{
		icon: <DragIndicatorRoundedIcon fontSize="small" />,
		text: "Drag-and-drop dashboard builder",
	},
	{
		icon: <TuneRoundedIcon fontSize="small" />,
		text: "Per-widget metrics, dimensions and date range",
	},
	{
		icon: <BoltRoundedIcon fontSize="small" />,
		text: "Live data via the GA4 Data API",
	},
];

type LocationState = { from?: string } | null;

export default function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useAppDispatch();
	const connected = useAppSelector((s) => s.auth.connected);
	const [submitting, setSubmitting] = useState(false);

	const redirectTo = (location.state as LocationState)?.from ?? "/dashboard";

	const errorMessage = useMemo(() => {
		const err = new URLSearchParams(location.search).get("error");
		if (!err) return null;
		switch (err) {
			case "access_denied":
				return "Google sign-in was cancelled.";
			case "state_mismatch":
				return "Sign-in expired or was tampered with. Please try again.";
			case "no_refresh_token":
				return "Google did not return a refresh token. Try again, or remove the app from your Google account permissions.";
			default:
				return `Sign-in failed: ${err}`;
		}
	}, [location.search]);

	useEffect(() => {
		if (connected) navigate(redirectTo, { replace: true });
	}, [connected, navigate, redirectTo]);

	const handleConnect = () => {
		setSubmitting(true);
		setLocalTestSession(false);
		window.location.href = googleLoginUrl;
	};

	const handleTestLogin = async () => {
		setSubmitting(true);
		setLocalTestSession(false);

		// If the backend is reachable, use server-side dummy mode (keeps cookie/JWT flow intact).
		// If not, fall back to a purely local dummy session.
		try {
			const controller = new AbortController();
			const t = window.setTimeout(() => controller.abort(), 800);
			const resp = await fetch("/api/health", {
				method: "GET",
				credentials: "include",
				signal: controller.signal,
				cache: "no-store",
			});
			window.clearTimeout(t);
			if (resp.ok) {
				window.location.href = `${googleLoginUrl}?mode=test`;
				return;
			}
		} catch {
			// ignore
		}

		// Local fallback: enable local test session and log in.
		setLocalTestSession(true);
		dispatch(connect({ user: getLocalTestUser() }));
		window.location.href = redirectTo;
	};

	return (
		<Box
			sx={(t) => ({
				minHeight: "100vh",
				display: "grid",
				placeItems: "center",
				p: 2,
				background: `radial-gradient(1200px 600px at 10% -10%, ${t.palette.primary.light}33 0%, transparent 50%), radial-gradient(900px 500px at 100% 110%, ${t.palette.primary.main}22 0%, transparent 60%), ${t.palette.background.default}`,
			})}
		>
			<Card
				elevation={0}
				sx={{
					width: "100%",
					maxWidth: 460,
					borderRadius: 3,
					border: "1px solid",
					borderColor: "divider",
					backdropFilter: "blur(8px)",
				}}
			>
				<CardContent sx={{ p: 4 }}>
					<Stack spacing={3}>
						<Stack
							direction="row"
							alignItems="center"
							justifyContent="space-between"
						>
							<Logo />
							<Chip
								size="small"
								label="Sign in"
								color="primary"
								variant="outlined"
								sx={{ fontWeight: 500 }}
							/>
						</Stack>

						<Box>
							<Typography
								variant="h5"
								sx={{ fontWeight: 700, lineHeight: 1.2 }}
							>
								Build your Firebase Analytics dashboard
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ mt: 1 }}
							>
								Connect your Google account to pick a GA4
								property and start composing widgets. Read-only
								access to <code>analytics.readonly</code>.
							</Typography>
						</Box>

						{errorMessage ? (
							<Alert
								severity="error"
								sx={{ alignItems: "center" }}
							>
								{errorMessage}
							</Alert>
						) : null}

						<Stack spacing={1.25}>
							{FEATURE_BULLETS.map((b) => (
								<Stack
									key={b.text}
									direction="row"
									spacing={1.25}
									alignItems="center"
									sx={{ color: "text.secondary" }}
								>
									<Box
										sx={{
											width: 28,
											height: 28,
											display: "grid",
											placeItems: "center",
											borderRadius: 1,
											bgcolor: "action.hover",
											color: "primary.main",
										}}
									>
										{b.icon}
									</Box>
									<Typography variant="body2">
										{b.text}
									</Typography>
								</Stack>
							))}
						</Stack>

						<Button
							size="large"
							variant="contained"
							disableElevation
							onClick={handleConnect}
							disabled={submitting}
							startIcon={
								submitting ? (
									<CircularProgress
										size={16}
										color="inherit"
									/>
								) : (
									<Box
										sx={{
											bgcolor: "#fff",
											borderRadius: 0.5,
											width: 22,
											height: 22,
											display: "grid",
											placeItems: "center",
										}}
									>
										<GoogleIcon />
									</Box>
								)
							}
							sx={{ py: 1.25, fontWeight: 600 }}
						>
							{submitting ? "Connecting…" : "Connect with Google"}
						</Button>

						<Divider flexItem />

						<Stack
							direction="row"
							spacing={1}
							alignItems="center"
							sx={{ color: "text.secondary" }}
						>
							<LockRoundedIcon fontSize="small" />
							<Typography variant="caption">
								We only request read-only access (
								<code>analytics.readonly</code>) and never see
								your password.
							</Typography>
						</Stack>

						<Box sx={{ pt: 0.5 }}>
							<Button
								fullWidth
								variant="text"
								color="inherit"
								onClick={handleTestLogin}
								disabled={submitting}
								sx={{
									textTransform: "none",
									color: "text.secondary",
								}}
							>
								Use test data (no Google sign-in)
							</Button>
						</Box>
					</Stack>
				</CardContent>
			</Card>
		</Box>
	);
}
