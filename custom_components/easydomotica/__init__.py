"""Easydomotica - Pannello di gestione avanzato per Home Assistant."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta

import voluptuous as vol
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.event import async_track_time_interval
from aiohttp.web import json_response, Response

_LOGGER = logging.getLogger(__name__)

DOMAIN = "easydomotica"
ALLOWED_USERNAME = "easydomotica"   # unico utente HA autorizzato (case-insensitive)
CONF_SMARTTHINGS_ENTRY_ID = "smartthings_entry_id"
RELOAD_INTERVAL = timedelta(minutes=10)

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {
                vol.Optional(CONF_SMARTTHINGS_ENTRY_ID, default=""): cv.string,
            }
        )
    },
    extra=vol.ALLOW_EXTRA,
)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Easydomotica integration."""
    conf = config.get(DOMAIN, {})
    smartthings_entry_id = conf.get(CONF_SMARTTHINGS_ENTRY_ID, "")

    hass.data[DOMAIN] = {
        "smartthings_entry_id": smartthings_entry_id,
        "reload_active": False,
        "last_reload": None,
    }

    # Pannello laterale — visibile a tutti ma il contenuto è protetto lato API
    hass.components.frontend.async_register_built_in_panel(
        component_name="custom",
        sidebar_title="Easydomotica",
        sidebar_icon="mdi:home-automation",
        frontend_url_path="easydomotica",
        config={
            "_panel_custom": {
                "name": "easydomotica-panel",
                "js_url": "/easydomotica/panel.js",
            }
        },
        require_admin=False,
    )

    # API — tutte con requires_auth=True: HA verifica il token automaticamente
    hass.http.register_view(EasydomoticaWhoAmIView(hass))
    hass.http.register_view(EasydomoticaConfigView(hass))
    hass.http.register_view(EasydomoticaReloadView(hass))
    hass.http.register_view(EasydomoticaStatusView(hass))

    # File statici del pannello
    hass.http.register_static_path(
        "/easydomotica",
        hass.config.path("custom_components/easydomotica/frontend"),
        cache_headers=False,
    )

    if smartthings_entry_id:
        await _start_smartthings_reload(hass, smartthings_entry_id)

    _LOGGER.info("Easydomotica: avviato. Accesso riservato all'utente '%s'", ALLOWED_USERNAME)
    return True


def _is_authorized(request) -> bool:
    """Controlla che l'utente HA loggato sia 'easydomotica'."""
    user = request.get("hass_user")
    if not user:
        return False
    return user.name.lower() == ALLOWED_USERNAME.lower()


def _user_name(request) -> str:
    """Ritorna il nome utente dalla richiesta HA."""
    user = request.get("hass_user")
    return user.name if user else "sconosciuto"


async def _start_smartthings_reload(hass: HomeAssistant, entry_id: str) -> None:
    """Avvia il timer di reload automatico SmartThings."""

    async def _reload_smartthings(now=None):
        data = hass.data[DOMAIN]
        current_id = data.get("smartthings_entry_id")
        if not current_id:
            return
        try:
            entry = hass.config_entries.async_get_entry(current_id)
            if entry:
                await hass.config_entries.async_reload(current_id)
                data["last_reload"] = datetime.now().isoformat()
                _LOGGER.info("Easydomotica: SmartThings ricaricato con successo")
            else:
                _LOGGER.warning(
                    "Easydomotica: entry SmartThings '%s' non trovata", current_id
                )
        except Exception as err:
            _LOGGER.error("Easydomotica: errore reload SmartThings: %s", err)

    hass.data[DOMAIN]["reload_active"] = True
    async_track_time_interval(hass, _reload_smartthings, RELOAD_INTERVAL)
    _LOGGER.info(
        "Easydomotica: reload automatico SmartThings ogni 10 min (ID: %s)", entry_id
    )


class EasydomoticaWhoAmIView(HomeAssistantView):
    """Ritorna info sull'utente corrente e se è autorizzato."""

    url = "/api/easydomotica/whoami"
    name = "api:easydomotica:whoami"
    requires_auth = True   # HA valida il token Bearer automaticamente

    def __init__(self, hass: HomeAssistant):
        self.hass = hass

    async def get(self, request):
        user = request.get("hass_user")
        if not user:
            return json_response({"authorized": False, "username": None}, status=401)

        authorized = user.name.lower() == ALLOWED_USERNAME.lower()
        return json_response(
            {
                "authorized": authorized,
                "username": user.name,
                "allowed_user": ALLOWED_USERNAME,
            }
        )


class EasydomoticaConfigView(HomeAssistantView):
    """Configurazione SmartThings — solo utente easydomotica."""

    url = "/api/easydomotica/config"
    name = "api:easydomotica:config"
    requires_auth = True

    def __init__(self, hass: HomeAssistant):
        self.hass = hass

    async def get(self, request):
        if not _is_authorized(request):
            _LOGGER.warning(
                "Easydomotica: accesso negato a /config per utente '%s'",
                _user_name(request),
            )
            return json_response(
                {"error": "Accesso negato. Richiesto utente 'easydomotica'."}, status=403
            )

        data = self.hass.data.get(DOMAIN, {})
        return json_response(
            {
                "smartthings_entry_id": data.get("smartthings_entry_id", ""),
                "reload_active": data.get("reload_active", False),
                "last_reload": data.get("last_reload"),
                "reload_interval_minutes": 10,
            }
        )

    async def post(self, request):
        if not _is_authorized(request):
            return json_response(
                {"error": "Accesso negato. Richiesto utente 'easydomotica'."}, status=403
            )

        try:
            body = await request.json()
        except Exception:
            return json_response({"success": False, "error": "Dati non validi"}, status=400)

        entry_id = body.get("smartthings_entry_id", "").strip()
        data = self.hass.data.get(DOMAIN, {})
        data["smartthings_entry_id"] = entry_id

        if entry_id and not data.get("reload_active"):
            await _start_smartthings_reload(self.hass, entry_id)

        if not entry_id:
            data["reload_active"] = False

        _LOGGER.info(
            "Easydomotica: configurazione aggiornata da '%s' — SmartThings ID: '%s'",
            _user_name(request),
            entry_id,
        )
        return json_response({"success": True, "smartthings_entry_id": entry_id})


class EasydomoticaReloadView(HomeAssistantView):
    """Reload manuale SmartThings."""

    url = "/api/easydomotica/reload"
    name = "api:easydomotica:reload"
    requires_auth = True

    def __init__(self, hass: HomeAssistant):
        self.hass = hass

    async def post(self, request):
        if not _is_authorized(request):
            return json_response(
                {"error": "Accesso negato. Richiesto utente 'easydomotica'."}, status=403
            )

        data = self.hass.data.get(DOMAIN, {})
        entry_id = data.get("smartthings_entry_id", "")

        if not entry_id:
            return json_response(
                {"success": False, "error": "Nessun ID SmartThings configurato"}, status=400
            )

        try:
            entry = self.hass.config_entries.async_get_entry(entry_id)
            if not entry:
                return json_response(
                    {"success": False, "error": f"Entry '{entry_id}' non trovata"}, status=404
                )

            await self.hass.config_entries.async_reload(entry_id)
            data["last_reload"] = datetime.now().isoformat()
            _LOGGER.info(
                "Easydomotica: reload manuale eseguito da '%s'", _user_name(request)
            )
            return json_response({"success": True, "last_reload": data["last_reload"]})
        except Exception as err:
            return json_response({"success": False, "error": str(err)}, status=500)


class EasydomoticaStatusView(HomeAssistantView):
    """Stato sistema."""

    url = "/api/easydomotica/status"
    name = "api:easydomotica:status"
    requires_auth = True

    def __init__(self, hass: HomeAssistant):
        self.hass = hass

    async def get(self, request):
        if not _is_authorized(request):
            return json_response(
                {"error": "Accesso negato. Richiesto utente 'easydomotica'."}, status=403
            )

        data = self.hass.data.get(DOMAIN, {})
        entry_id = data.get("smartthings_entry_id", "")
        entry_found = False

        if entry_id:
            entry = self.hass.config_entries.async_get_entry(entry_id)
            entry_found = entry is not None

        return json_response(
            {
                "smartthings_entry_id": entry_id,
                "entry_found": entry_found,
                "reload_active": data.get("reload_active", False),
                "last_reload": data.get("last_reload"),
            }
        )
