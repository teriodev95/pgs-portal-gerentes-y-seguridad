# PGS

## Product

PGS is the operational web application used by XPRESS field and management teams. Its home screen presents role-appropriate actions for the current management unit and week.

## Users

- Gerentes and regional staff operating a management unit.
- Security leadership with explicit per-user access to cash reporting and explicit branch scope.
- Operational staff whose existing home actions must remain unchanged.

## Visual world

- Preserve the incumbent PGS interface: light slate surfaces, compact mobile-first layouts, blue as the primary action color, Lucide outline icons, and direct Spanish copy.
- Prefer lists and clear grouped sections over nested dashboard cards.
- Controls must identify their action visibly; color alone must never be the only signifier.

## Cash report surface

- The home action is named **Efectivo general** with the description **Por sucursal**.
- It appears only when the authenticated user has the `pgs / reporte-efectivo` module permission.
- The backend enforces both the module permission and the user's allowed branches.
- The current report is real time and shows totals per branch, per management unit, and the agency breakdown that composes cash with agents.
- **Evolución de hoy** reads hourly snapshots so a normal value at 09:00 never hides a critical value observed at 07:00. It identifies the daily peak, the change from the previous available snapshot, and leaves missing hours absent instead of interpolating them.
- Conditional colors reproduce the Excel report: green, yellow, pink, and red, with an always-visible legend and textual status.
- A red amount is an explicit contact opportunity. It exposes a **Contactar** control and identifies the responsible manager before offering **WhatsApp** or **Llamar**.
- When no phone exists, contact controls are disabled and the interface says that the number is not registered.
- Loading, empty, retry, refresh, keyboard focus, and responsive mobile/desktop states are required.

## Data truth

- Current values come from Elysia's real-time report endpoint and the official cash-movement views.
- Historical values come only from official snapshots; missing historical snapshots remain `null`, never reconstructed or coerced to zero.
- Dates and operational week calculations use `America/Mexico_City`.
