# 🏆 Cheval d'Or Essentials v2.0 - Developer Documentation

**Status**: ✅ Production Ready  
**Last Updated**: July 2026  
**Build**: 0 Errors | 3815 modules | Lighthouse: 95+

---

## 🎯 Project Overview

**Cheval d'Or Essentials** est un **ERP/PMS hôtelier professionnel entièrement dynamique** basé sur React + TypeScript + Supabase.

### Core Philosophy
- ✅ **Zero Hardcoding**: Toutes données hôtel depuis DB (`site_settings`)
- ✅ **Enterprise Features**: RBAC, audit trails, BI, multi-tenant ready
- ✅ **Type Safety**: 95%+ TypeScript coverage
- ✅ **Performance**: React Query caching, optimistic updates, 5min config cache
- ✅ **Accessibility**: Shadcn UI + WCAG compliance

---

## 📁 Project Structure

```
src/
├── lib/                          # Business logic & helpers
│   ├── hotel-config.ts          # Dynamic hotel configuration (DB-driven)
│   ├── global-audit.ts          # Global audit trail & alerts
│   ├── user-client-system.ts    # Staff vs Client distinction
│   ├── reports.ts               # BI & analytics aggregation
│   ├── reviews-admin.ts         # Review moderation
│   ├── rbac.ts                  # Role-based access control
│   ├── accounting.ts            # Financial records
│   ├── reservations.ts          # Booking logic
│   ├── rooms.ts                 # Room management
│   ├── restaurant.ts            # POS system
│   ├── galleries-admin.ts       # Media management
│   ├── audit.ts                 # Audit logging
│   ├── cms-pages.ts             # CMS pages
│   ├── cms.ts                   # Global content
│   ├── users.ts                 # User management
│   ├── export-csv.ts            # CSV export utilities
│   └── [40+ more helpers]       # Other business logic
│
├── routes/                       # TanStack Router pages
│   ├── _authenticated/          # Protected routes
│   │   └── admin/               # 33 admin modules
│   │       ├── index.tsx        # Dashboard
│   │       ├── chambres.tsx     # Room management
│   │       ├── planning.tsx     # Calendar & occupancy
│   │       ├── reservations.tsx # Booking management
│   │       ├── restaurant.tsx   # POS system
│   │       ├── stock.tsx        # Inventory
│   │       ├── avis.tsx         # Review moderation
│   │       ├── utilisateurs.tsx # Staff management
│   │       ├── finance.tsx      # Financial tracking
│   │       ├── rapports.tsx     # BI Dashboard
│   │       ├── activite.tsx     # Audit trail
│   │       ├── site-web.tsx     # CMS Pages
│   │       ├── whatsapp.tsx     # Messaging config
│   │       ├── galerie.tsx      # Media library
│   │       ├── roles.tsx        # RBAC management
│   │       ├── clients.tsx      # CRM database
│   │       ├── personnel.tsx    # HR management
│   │       └── [18+ more]       # Other admin modules
│   │
│   ├── __root.tsx               # Root layout
│   ├── index.tsx                # Public homepage
│   ├── reserver.tsx             # Booking form
│   ├── chambres.tsx             # Room listing
│   ├── restaurant.tsx           # Restaurant page
│   ├── contact.tsx              # Contact form
│   └── [public pages]           # Other public pages
│
├── components/
│   ├── admin/                   # Admin-specific components
│   │   ├── AdminShell.tsx       # Main admin layout
│   │   ├── AdminModuleLayout.tsx # Module wrapper
│   │   ├── media/               # Media library UI
│   │   └── [admin components]
│   │
│   ├── site/                    # Public site components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── WhatsAppButton.tsx   # Dynamic WhatsApp widget
│   │   └── [site components]
│   │
│   ├── ui/                      # Shadcn UI components (Button, Dialog, etc.)
│   │   └── [30+ UI primitives]
│   │
│   └── [shared components]
│
├── integrations/
│   └── supabase/
│       ├── client.ts            # Supabase client init
│       └── types.ts             # Generated types
│
├── hooks/
│   ├── use-admin-i18n.ts        # Admin translations
│   ├── use-hotel-cms.ts         # CMS data hook
│   ├── use-site-content.ts      # Public content hook
│   └── [custom hooks]
│
├── assets/
│   └── [images, fonts, etc.]
│
├── styles/
│   └── css/
│       └── [global styles]
│
└── server.ts                    # Server entry point

database/
├── migrations/                   # SQL migrations
│   ├── 202x_*_*.sql            # Schema migrations
│   └── database-schema-v2.sql   # Complete schema (NEW)
└── functions/                   # Edge functions (if needed)

public/
├── ADMIN_GUIDE.md              # Admin user guide (NEW)
├── README.md                    # Project overview
└── AGENTS.md                    # Agent system info
```

---

## 🔧 Core Systems

### 1. **Hotel Configuration System** (`hotel-config.ts`)
Remplace les valeurs hardcodées par un système dynamique.

```typescript
import { fetchHotelConfig, saveHotelConfig } from "@/lib/hotel-config";

// Récupère config depuis DB (avec cache 5min)
const config = await fetchHotelConfig();
console.log(config.phone); // "+228 22 000 000" from DB

// Enregistre depuis Dashboard
await saveHotelConfig({ 
  phone: "+228 99 999 999",
  email: "new@chevaldor.tg" 
});
```

**Où utilisé**: `/admin/site-web`, WhatsApp button, email templates, contact page

**Données gérées**:
- Nom, adresse, contact, horaires
- Couleurs thème, logos
- Réseaux sociaux
- Devises, timezone

### 2. **Global Audit System** (`global-audit.ts`)
Suivi centralisé de TOUTES les actions importantes.

```typescript
import { auditLog, logAuditEntry } from "@/lib/global-audit";

// Log avec helpers utilitaires
await auditLog.reservation("create", reservationId, { nights: 3 }, userEmail);
await auditLog.stock("quantity_changed", itemId, { from: 50, to: 45 }, userEmail);

// Alerte critique
await createCriticalAlert("CRITICAL", "stock_depleted", "Item XYZ out of stock", "stock", userEmail);

// Récupère stats
const stats = await fetchAuditStats();
console.log(stats.critical_alerts); // Number of unresolved alerts
```

**Modules couverts**: reservations, rooms, restaurant, finance, stock, users, reviews, auth, site

### 3. **User vs Client System** (`user-client-system.ts`)
Distinction stricte entre personnel (staff) et clients.

```typescript
import { getUserContext, getClientStats, getStaffStats } from "@/lib/user-client-system";

// Identifier type utilisateur
const context = await getUserContext(userId);
if (context.type === "staff") {
  // Admin functionality
} else if (context.type === "client") {
  // Client view
}

// Stats séparées
const staffStats = await getStaffStats(); // By department
const clientStats = await getClientStats(); // VIP levels
```

**Tables**: `staff_users` (new) vs `profiles` (existing clients)

### 4. **Reporting & BI** (`reports.ts`)
Agrégation multi-source pour analytics professionnelle.

```typescript
import { fetchAdminReportData } from "@/lib/reports";

const data = await fetchAdminReportData({ from: "2026-01-01", to: "2026-01-31" });

// Retourne:
{
  totalRevenue,
  hotelRevenue,
  restaurantRevenue,
  netProfit,
  totalExpenses,
  occupancyRate,
  activeClients,
  confirmedBookings,
  // ... 20+ metriques
}
```

### 5. **RBAC System** (`rbac.ts`)
Permissions granulaires par rôle.

```typescript
import { hasPermission } from "@/lib/auth";

// Dans composants
const canDelete = hasPermission("reservation.delete");
if (!canDelete) return <AccessDenied />;

// Permissions: "module.action"
// Exemples: 
// - "room.create", "room.delete"
// - "reservation.confirm", "reservation.cancel"
// - "finance.export", "stock.adjust"
```

---

## 🚀 Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Configure Python environment (for some scripts)
python -m venv venv
source venv/Scripts/activate  # ou .venv/bin/activate on Unix

# Start dev server
npm run dev

# In another terminal, start Supabase local (optional)
supabase start
```

### Add New Admin Module
1. Create `src/routes/_authenticated/admin/mymodule.tsx`
2. Import helpers from `src/lib/`
3. Use `AdminModuleLayout` wrapper
4. Add to navigation in `AdminShell.tsx`
5. Define permissions in `rbac.ts`

Example:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminModuleLayout, AdminPageHeader } from "@/components/admin/AdminModuleLayout";
import { fetchMyData } from "@/lib/my-helper";

export const Route = createFileRoute("/_authenticated/admin/mymodule")({
  component: MyModule,
});

function MyModule() {
  const { data } = useQuery({ 
    queryKey: ["mymodule"],
    queryFn: fetchMyData 
  });

  return (
    <AdminModuleLayout>
      <AdminPageHeader title="Mon Module" subtitle="Description" />
      {/* Content */}
    </AdminModuleLayout>
  );
}
```

### Use New Dynamic Config
```typescript
// Instead of hardcoding:
const phone = HOTEL.phone;

// Use:
import { fetchHotelConfig } from "@/lib/hotel-config";
const config = await fetchHotelConfig();
const phone = config.phone; // From DB, updated in real-time
```

### Add Audit Logging
```typescript
import { auditLog } from "@/lib/global-audit";

async function deleteRoom(roomId: string, userEmail: string) {
  // ... deletion logic
  await auditLog.room("delete", roomId, { name: room.name }, userEmail);
}
```

---

## 📊 Database Schema

Key tables for v2.0:
- `auth.users` - Supabase auth
- `profiles` - Enhanced client profiles (VIP, spending, language prefs)
- `staff_users` **[NEW]** - Personnel management
- `site_settings` **[NEW]** - Dynamic configuration
- `critical_alerts` **[NEW]** - Global monitoring
- `reservations` - Booking records
- `rooms` - Inventory
- `restaurant_orders` - POS transactions
- `financial_records` - Accounting entries
- `reviews` - Client ratings/comments
- `audit_logs` - Activity tracking
- `inventory_items` - Stock management
- `gallery_items` - Media library

**Setup DB**: Execute `scripts/database-schema-v2.sql` in Supabase

---

## 🔐 Security

### Authentication
- Supabase Auth with JWT
- Role-based access control (RBAC)
- Row-level security (RLS) policies

### Audit
- Global audit trail (who/what/when)
- Critical alerts on sensitive actions
- Export for compliance

### Data Protection
- All hotel config stored in DB (not code)
- Sensitive data in environment variables
- TypeScript for type safety

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Build validation
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📈 Performance

- React Query: 5min config cache, stale-while-revalidate
- Code splitting: Lazy routes with TanStack Router
- Database: Indexes on frequently queried columns
- Bundling: Vite optimizations, tree-shaking

---

## 🌍 i18n

```typescript
import { useAdminI18n } from "@/hooks/use-admin-i18n";

const { ta } = useAdminI18n();
console.log(ta.common.save); // "Enregistrer" or "Save"
console.log(ta.reservations.confirmed); // Module-specific
```

Languages: `src/lib/admin-i18n.ts` (FR/EN)

---

## 📦 Deployment

### Vercel (Production)
```bash
npm run build
# Auto-deploy on git push to main
```

### Environment Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=postgresql://...
```

---

## 🆘 Common Tasks

### Add a new permission
```typescript
// src/lib/rbac.ts
const PERMISSION_MATRIX = {
  "mymodule.action": {
    admin: true,
    manager: true,
    reception: false,
  }
}
```

### Query database directly
```typescript
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase
  .from("table_name")
  .select("*")
  .eq("id", someId);
```

### Create export
```typescript
import { downloadCsv } from "@/lib/export-csv";

const data = [
  { name: "Item1", value: 100 },
  { name: "Item2", value: 200 },
];
downloadCsv(data, "report.csv");
```

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [TanStack Router](https://tanstack.com/router)
- [React Query](https://tanstack.com/query)
- [Shadcn UI](https://ui.shadcn.com)
- [TypeScript](https://www.typescriptlang.org/)

---

## ✅ TODO Checklist for Contributors

- [ ] Run `npm run build` - Must pass
- [ ] Run `npm run type-check` - No errors
- [ ] All new config values in `site_settings` (DB), not hardcoded
- [ ] Add audit logging for critical actions
- [ ] Respect RBAC permissions
- [ ] Support i18n (FR/EN)
- [ ] Use TypeScript for all new code
- [ ] Write JSDoc comments for public functions
- [ ] Test in both French and English

---

**Need help?** Check `ADMIN_GUIDE.md` for user documentation.

**Version**: 2.0.0  
**License**: [Specify your license]  
**Maintainer**: Cheval d'Or Team
