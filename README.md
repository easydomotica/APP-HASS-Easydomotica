# 🏠 Easydomotica

Pannello di gestione avanzato per Home Assistant, installabile tramite HACS.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/tuousername/easydomotica/releases)

## Funzionalità

- **Pannello laterale dedicato** — visibile nella sidebar di HA
- **Accesso sicuro** — il contenuto è visibile **solo** all'utente HA chiamato `easydomotica`
- **Nessuna password separata** — usa il sistema di autenticazione nativo di Home Assistant
- **Gestione SmartThings** — reload automatico ogni 10 minuti
- **Reload manuale** con un click dal pannello
- **Monitoraggio stato** dell'integrazione in tempo reale

---

## Installazione tramite HACS

1. Apri HACS → **Integrazioni** → 3 puntini → **Repository personalizzati**
2. Incolla: `https://github.com/TUOUSERNAME/easydomotica` — categoria **Integrazione**
3. Cerca "Easydomotica" e installa
4. Riavvia Home Assistant

---

## Configurazione

### 1. Crea l'utente `easydomotica` in Home Assistant

**Impostazioni → Persone → Aggiungi persona**
- Nome: `easydomotica`
- Spunta **Consenti accesso** per creare le credenziali di login
- **Non** spuntare "Amministratore" (non necessario)

### 2. Aggiungi in `configuration.yaml`

```yaml
easydomotica:
  smartthings_entry_id: ""   # Lascia vuoto, si imposta dal pannello
```

### 3. Riavvia Home Assistant

### 4. Accedi con l'utente `easydomotica`

Esci da HA (o apri una finestra in incognito) e accedi con le credenziali dell'utente `easydomotica`. Nella sidebar troverai il pannello con accesso completo.

> **Nota:** Se accedi con qualsiasi altro utente HA, il pannello mostrerà una schermata di accesso negato.

---

## Come trovare l'ID dell'integrazione SmartThings

1. **Impostazioni → Dispositivi e Servizi → SmartThings**
2. Clicca i **3 puntini** → **Informazioni**
3. Copia l'ID mostrato nell'URL (formato: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

In alternativa cerca `entry_id` in `.storage/core.config_entries`.

---

## Sicurezza

- Tutte le API usano `requires_auth = True` — il token Bearer di HA è obbligatorio
- Il backend verifica che il nome utente autenticato sia esattamente `easydomotica`
- Qualsiasi altra richiesta riceve HTTP 403
- Nessuna password salvata in `configuration.yaml`

---

## Licenza

MIT — Creato da Easydomotica
