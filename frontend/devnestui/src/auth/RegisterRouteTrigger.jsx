import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import savedEventsService from "../services/api/savedEvents";

export default function RegisterRouteTrigger() {
  const { openAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state || {};
    const bg = state.background; // { pathname, search }
    const intent = state.intent; // { type, eventId }

    const onSuccess =
      intent?.type === "saveWorkshopSeat" && intent?.eventId
        ? async () => {
            await savedEventsService.toggle(intent.eventId);
          }
        : null;

    openAuthModal("register", onSuccess);

    // return URL back to previous page (no /register in address bar)
    const backTo = bg?.pathname ? `${bg.pathname}${bg.search || ""}` : "/";
    navigate(backTo, { replace: true });
  }, [openAuthModal, location.state, navigate]);

  return null;
}