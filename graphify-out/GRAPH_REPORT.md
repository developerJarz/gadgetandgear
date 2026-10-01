# Graph Report - noors-elegance-main  (2026-10-02)

## Corpus Check
- 206 files · ~159,607 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .ico 1, .css 1)

## Summary
- 1101 nodes · 2208 edges · 71 communities (62 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.83)
- Token cost: 238,234 input · 0 output

## Community Hubs (Navigation)
- UI Primitives & Package Manifest
- Runtime Dependencies
- Sidebar & Sheet Components
- Admin Pages (Icons & React)
- cn() Utility & Menus
- Orders, Returns & Audit APIs
- Buttons, Carousel & Pagination
- LocalStorage Store Layer
- Admin Reports & CSV Export
- Admin Content & Toasts
- Auth & User APIs
- Admin Shell & Theming
- Catalog & Finance APIs
- Storefront Static Site Data
- Settings, Warehouses & Seeding
- Cart-Driven Storefront Pages
- Cart Context & Header
- Notifications & Audit Models
- Command & Dialog UI
- Shop Listing & Filters
- shadcn components.json
- Badges, Alerts & Toggles
- TypeScript Config
- Menubar Component
- Brands API & Token Verify
- Form Components
- Category Product Photos
- Admin ERP Feature Docs
- Cart, Checkout & Payments Docs
- Platform Stack Docs
- Staff API & Model
- Brand Identity Icons
- Chart Component
- Dev Dependencies & Scripts
- OTP Email Flow
- Coupons API & Model
- Navigation Menu Component
- Select Component
- Breadcrumb Component
- Drawer Component
- Fulfillment & Notification Docs
- Reviews API & Model
- Floating & Studio Photos
- UI Theming Docs
- OTP Input Component
- API Keys & Webhooks Page
- Admin Products Page
- Admin Returns Page
- Admin Staff Page
- Auth & RBAC Docs
- Accordion Component
- Tabs Component
- Abandoned Carts Page
- Admin AI Tools Page
- ApiKey Model
- BlogPost Model
- Campaign Model
- CMSPage Model
- SEORedirect Model
- Shipment Model
- Supplier Model
- Webhook Model
- PostCSS Config
- Product Detail Docs
- Next.js Env Types
- Shop Filtering Docs
- Gaming Monitor Photo
- Search Modal Doc
- Wishlist Doc
- Category Carousel Doc

## God Nodes (most connected - your core abstractions)
1. `cn()` - 220 edges
2. `connectDB()` - 93 edges
3. `react` - 92 edges
4. `lucide-react` - 72 edges
5. `next` - 62 edges
6. `sonner` - 33 edges
7. `mongoose` - 29 edges
8. `useCart()` - 23 edges
9. `getAuthFromCookie()` - 18 edges
10. `logAudit()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Multi-role RBAC (Admin, Manager, Staff, Customer)` --semantically_similar_to--> `Role-Based Access Control (RBAC)`  [AMBIGUOUS] [semantically similar]
  README.md → PROJECT_OVERVIEW.md
- `Admin Dashboard (/admin)` --semantically_similar_to--> `Admin & ERP Management Suite`  [INFERRED] [semantically similar]
  README.md → PROJECT_OVERVIEW.md
- `Gadget & Gear G-Mark Icon (Next.js app apple-icon)` --semantically_similar_to--> `Gadget & Gear G-Mark Icon`  [INFERRED] [semantically similar]
  src/app/apple-icon.png → public/icon.png
- `Gadget & Gear G-Mark Icon (Next.js app icon)` --semantically_similar_to--> `Gadget & Gear G-Mark Icon`  [INFERRED] [semantically similar]
  src/app/icon.png → public/icon.png
- `Gadget & Gear G-Mark Icon (assets fabiconG)` --semantically_similar_to--> `Gadget & Gear G-Mark Icon`  [INFERRED] [semantically similar]
  src/assets/fabiconG.png → public/icon.png

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Order Fulfillment Flow (checkout to delivery/return)** — project_overview_streamlined_checkout, project_overview_order_lifecycle, project_overview_shipments_courier_integration, project_overview_invoice_generation, project_overview_return_refund_system, project_overview_email_notifications [INFERRED 0.85]
- **Bangladesh Checkout Payment Methods** — readme_bkash, readme_nagad, readme_rocket, readme_sslcommerz, readme_cash_on_delivery [EXTRACTED 1.00]
- **Authentication & Security Stack** — project_overview_jwt_authentication, project_overview_bcrypt_js, project_overview_zod_validation, project_overview_role_based_access_control, project_overview_audit_logs [INFERRED 0.85]
- **Gadget & Gear G-Mark Favicon/App Icon Set** — public_icon_gadget_gear_g_mark_icon, public_apple_icon_gadget_gear_g_mark_icon, public_fabicong_gadget_gear_g_mark_icon, public_favicon_gadget_gear_g_mark_icon, src_app_icon_gadget_gear_g_mark_icon, src_app_apple_icon_gadget_gear_g_mark_icon, src_assets_fabicong_gadget_gear_g_mark_icon, public_favicon_gg_lightning_svg_favicon [INFERRED 0.85]
- **Gadget & Gear BD Brand Identity Assets** — public_logo_gadget_gear_bd_brand, public_logo_gadget_gear_bd_wordmark_logo, src_assets_logo_gadget_gear_bd_wordmark_logo, public_icon_gadget_gear_g_mark_icon [INFERRED 0.85]
- **GadgetHub Product Category Tile Image Set** — src_assets_gh_drone_drone_product_photo, src_assets_gh_earbuds_wireless_earbuds_product_photo, src_assets_gh_headphones_over_ear_headphones_product_photo, src_assets_gh_keyboard_rgb_mechanical_keyboard_product_photo, src_assets_gh_laptop_laptop_product_photo [INFERRED 0.85]
- **Hero Banner Featured Gadget Lineup** — src_assets_gh_hero_gadget_hero_banner, src_assets_gh_hero_smartphone, src_assets_gh_hero_smartwatch, src_assets_gh_laptop_laptops_category, src_assets_gh_earbuds_earbuds_category [EXTRACTED 1.00]
- **Audio Gadgets Group** — src_assets_gh_earbuds_wireless_earbuds_product_photo, src_assets_gh_headphones_over_ear_headphones_product_photo, src_assets_gh_earbuds_earbuds_category, src_assets_gh_headphones_headphones_category [INFERRED 0.75]
- **GadgetHub Product Category Image Set (blue-themed tiles/placeholders)** — src_assets_gh_monitor_curved_gaming_monitor_product_photo, src_assets_gh_phone_smartphone_product_photo, src_assets_gh_powerbank_power_bank_product_photo, src_assets_gh_speaker_bluetooth_speaker_product_photo, src_assets_gh_tablet_tablet_with_stylus_product_photo, src_assets_gh_watch_smartwatch_product_photo [INFERRED 0.95]
- **Floating Levitation Product Shots** — src_assets_gh_phone_smartphone_product_photo, src_assets_gh_watch_smartwatch_product_photo, src_assets_gh_phone_floating_product_on_blue_gradient_style [INFERRED 0.85]
- **Minimal Tabletop Studio Shots** — src_assets_gh_speaker_bluetooth_speaker_product_photo, src_assets_gh_tablet_tablet_with_stylus_product_photo, src_assets_gh_powerbank_power_bank_product_photo, src_assets_gh_speaker_minimal_blue_studio_backdrop_style [INFERRED 0.85]

## Communities (71 total, 9 thin omitted)

### Community 0 - "UI Primitives & Package Manifest"
Cohesion: 0.04
Nodes (45): name, private, version, bcryptjs, clsx, date-fns, @hookform/resolvers, jsonwebtoken (+37 more)

### Community 1 - "Runtime Dependencies"
Cohesion: 0.04
Nodes (57): dependencies, bcryptjs, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, @hookform/resolvers (+49 more)

### Community 2 - "Sidebar & Sheet Components"
Cohesion: 0.06
Nodes (46): @radix-ui/react-separator, @radix-ui/react-tooltip, Input, Separator, src_components_ui_sheet_sheet, SheetContent, SheetContentProps, SheetDescription (+38 more)

### Community 3 - "Admin Pages (Icons & React)"
Cohesion: 0.06
Nodes (17): lucide-react, react, backupHistory, BrandItem, CategoryItem, CouponItem, CourierConfig, couriers (+9 more)

### Community 4 - "cn() Utility & Menus"
Cohesion: 0.08
Nodes (40): @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, Avatar, AvatarFallback, AvatarImage, Card, CardContent (+32 more)

### Community 5 - "Orders, Returns & Audit APIs"
Cohesion: 0.13
Nodes (31): POST(), GET(), POST(), PUT(), POST(), PUT(), POST(), clearAuthCookie() (+23 more)

### Community 6 - "Buttons, Carousel & Pagination"
Cohesion: 0.07
Nodes (37): embla-carousel-react, @radix-ui/react-alert-dialog, react-day-picker, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter() (+29 more)

### Community 7 - "LocalStorage Store Layer"
Cohesion: 0.10
Nodes (35): addProduct(), addStaffMember(), adminLogin(), AppUser, AuthUser, DEFAULT_SETTINGS, deleteProduct(), genId() (+27 more)

### Community 8 - "Admin Reports & CSV Export"
Cohesion: 0.09
Nodes (27): recharts, AnalyticsData, AnalyticsPage(), COLORS, ACTION_COLORS, auditLogs, AuditLogsPage(), MODULE_ICONS (+19 more)

### Community 9 - "Admin Content & Toasts"
Cohesion: 0.06
Nodes (21): sonner, BlogPost, demoPosts, STATUS_COLORS, Campaign, demoCampaigns, seasonTemplates, STATUS_COLORS (+13 more)

### Community 10 - "Auth & User APIs"
Cohesion: 0.14
Nodes (22): POST(), POST(), POST(), POST(), GET(), GET(), PUT(), comparePassword() (+14 more)

### Community 11 - "Admin Shell & Theming"
Cohesion: 0.09
Nodes (25): AdminLayout(), AuthUser, NAV_GROUPS, NavGroup, NavItem, SidebarGroup(), src_app_globals, inter (+17 more)

### Community 12 - "Catalog & Finance APIs"
Cohesion: 0.10
Nodes (23): GET(), DELETE(), PUT(), GET(), POST(), GET(), POST(), GET() (+15 more)

### Community 13 - "Storefront Static Site Data"
Cohesion: 0.09
Nodes (23): metadata, src_assets_gh_drone, src_assets_gh_earbuds, src_assets_gh_headphones, src_assets_gh_hero, src_assets_gh_keyboard, src_assets_gh_laptop, src_assets_gh_monitor (+15 more)

### Community 14 - "Settings, Warehouses & Seeding"
Cohesion: 0.11
Nodes (17): POST(), GET(), PUT(), GET(), POST(), CourierConfig, CourierConfigSchema, ICourierConfig (+9 more)

### Community 15 - "Cart-Driven Storefront Pages"
Cohesion: 0.16
Nodes (14): BD_DIVISIONS, CustomerAccountPage(), CustomerProfile, OrderRecord, CartPage(), CheckoutPage(), DELIVERY_ZONES, PAYMENT_METHODS (+6 more)

### Community 16 - "Cart Context & Header"
Cohesion: 0.17
Nodes (14): StorefrontLayout(), CartDrawer(), Footer(), Header(), SearchModal(), ProductListViewProps, TAG_STYLES, ProductQuickViewProps (+6 more)

### Community 17 - "Notifications & Audit Models"
Cohesion: 0.10
Nodes (16): mongoose, GET(), GET(), PUT(), AuditLog, AuditLogSchema, IAuditLog, INotification (+8 more)

### Community 18 - "Command & Dialog UI"
Cohesion: 0.13
Nodes (18): cmdk, @radix-ui/react-dialog, Command, CommandDialog(), CommandEmpty, CommandGroup, CommandInput, CommandItem (+10 more)

### Community 19 - "Shop Listing & Filters"
Cohesion: 0.16
Nodes (17): Shop(), ShopContent(), SortOption, SORTS, ViewMode, CategoryShowcase(), CategoryShowcaseProps, ICON_MAP (+9 more)

### Community 20 - "shadcn components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 21 - "Badges, Alerts & Toggles"
Cohesion: 0.14
Nodes (15): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, Alert, AlertDescription, AlertTitle, alertVariants, Badge() (+7 more)

### Community 22 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 23 - "Menubar Component"
Cohesion: 0.11
Nodes (12): @radix-ui/react-menubar, Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator (+4 more)

### Community 24 - "Brands API & Token Verify"
Cohesion: 0.15
Nodes (12): nextConfig, next, GET(), DELETE(), PUT(), GET(), POST(), verifyToken() (+4 more)

### Community 25 - "Form Components"
Cohesion: 0.18
Nodes (14): @radix-ui/react-label, react-hook-form, FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext (+6 more)

### Community 26 - "Category Product Photos"
Cohesion: 0.16
Nodes (15): Drone Product Photo (gh-drone.jpg), Drones Category, Soft Gradient Studio Product Photography Style, TWS Earbuds Category, Wireless Earbuds Product Photo (gh-earbuds.jpg), Headphones Category, Over-Ear Headphones Product Photo (gh-headphones.jpg), Dark Neon Floating-Gadget Composition Style (+7 more)

### Community 27 - "Admin ERP Feature Docs"
Cohesion: 0.15
Nodes (14): Admin & ERP Management Suite, Top Announcement Bar & Header, API Key & Webhook Management, Audit Logs, Blog & Content Management (CMS), Campaign & Flash Sale Builder, Full Catalog Management (Variants, Tags, Brands), Automated Database Backups & Health Checks (+6 more)

### Community 28 - "Cart, Checkout & Payments Docs"
Cohesion: 0.17
Nodes (13): Abandoned Cart Recovery, CartContext, Coupon & Promo Code Engine, Slide-out Cart Drawer, Streamlined Checkout, bKash, Cash on Delivery (COD), Drawer Slide-out Cart with Coupon Engine (+5 more)

### Community 29 - "Platform Stack Docs"
Cohesion: 0.21
Nodes (13): Gadget & Gear BD Platform, MongoDB, Mongoose ODM, Next.js 15 (App Router), React 19, SEO & URL Redirect Manager, Next.js Serverless Route Handlers (REST APIs), TypeScript 5.8 (+5 more)

### Community 30 - "Staff API & Model"
Cohesion: 0.20
Nodes (9): DELETE(), PUT(), GET(), POST(), ILoginRecord, IStaff, LoginRecordSchema, Staff (+1 more)

### Community 31 - "Brand Identity Icons"
Cohesion: 0.22
Nodes (11): Gadget & Gear G-Mark Icon (Apple Touch Icon, public), Gadget & Gear G-Mark Icon (fabiconG, public), Gadget & Gear G-Mark Icon (favicon.png, public), GG Lightning SVG Favicon, Gadget & Gear G-Mark Icon, Gadget & Gear BD Brand Identity, Gadget & Gear BD Wordmark Logo, Gadget & Gear G-Mark Icon (Next.js app apple-icon) (+3 more)

### Community 32 - "Chart Component"
Cohesion: 0.27
Nodes (10): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent, getPayloadConfigFromPayload() (+2 more)

### Community 33 - "Dev Dependencies & Scripts"
Cohesion: 0.18
Nodes (10): devDependencies, @types/node, @types/react, @types/react-dom, typescript, scripts, build, dev (+2 more)

### Community 34 - "OTP Email Flow"
Cohesion: 0.27
Nodes (7): nodemailer, POST(), sendOTPEmail(), transporter, IOTP, OTP, OTPSchema

### Community 35 - "Coupons API & Model"
Cohesion: 0.24
Nodes (7): DELETE(), PUT(), GET(), POST(), Coupon, CouponSchema, ICoupon

### Community 36 - "Navigation Menu Component"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 37 - "Select Component"
Cohesion: 0.28
Nodes (8): @radix-ui/react-select, SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 38 - "Breadcrumb Component"
Cohesion: 0.22
Nodes (8): @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 39 - "Drawer Component"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 40 - "Fulfillment & Notification Docs"
Cohesion: 0.25
Nodes (8): Customer Dashboard, Email & Notifications (Order Confirmations, OTP), Invoice Generation (PDF Invoices & Packing Slips), Nodemailer, Order Lifecycle Tracking, Resend, Return & Refund System, Shipments & Courier Integration

### Community 41 - "Reviews API & Model"
Cohesion: 0.33
Nodes (5): GET(), PUT(), IReview, Review, ReviewSchema

### Community 42 - "Floating & Studio Photos"
Cohesion: 0.38
Nodes (7): Floating Product on Blue Gradient Style, Smartphone Product Photo, Power Bank Product Photo, Portable Bluetooth Speaker Product Photo, Minimal Pastel Blue Studio Backdrop Style, Tablet with Stylus Product Photo, Smartwatch Product Photo

### Community 43 - "UI Theming Docs"
Cohesion: 0.33
Nodes (6): Dark / Light Mode Toggle, Lucide Icons, Radix UI Primitives, Tailwind CSS v4, ThemeProvider, Dark/Glassmorphic Responsive UI

### Community 44 - "OTP Input Component"
Cohesion: 0.33
Nodes (5): input-otp, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 45 - "API Keys & Webhooks Page"
Cohesion: 0.33
Nodes (4): ApiKeyItem, demoApiKeys, demoWebhooks, WebhookItem

### Community 46 - "Admin Products Page"
Cohesion: 0.33
Nodes (4): BrandItem, CategoryItem, ProductItem, TAGS

### Community 47 - "Admin Returns Page"
Cohesion: 0.33
Nodes (4): demoReturns, ReturnItem, STATUS_COLORS, TYPE_ICONS

### Community 48 - "Admin Staff Page"
Cohesion: 0.33
Nodes (4): ROLE_COLORS, ROLES, StaffMember, StaffRole

### Community 49 - "Auth & RBAC Docs"
Cohesion: 0.40
Nodes (5): Bcrypt.js, JWT Authentication, Role-Based Access Control (RBAC), Admin Dashboard (/admin), Multi-role RBAC (Admin, Manager, Staff, Customer)

### Community 50 - "Accordion Component"
Cohesion: 0.40
Nodes (4): @radix-ui/react-accordion, AccordionContent, AccordionItem, AccordionTrigger

### Community 51 - "Tabs Component"
Cohesion: 0.40
Nodes (4): @radix-ui/react-tabs, TabsContent, TabsList, TabsTrigger

### Community 52 - "Abandoned Carts Page"
Cohesion: 0.40
Nodes (3): AbandonedCart, demoCarts, STATUS_COLORS

### Community 54 - "ApiKey Model"
Cohesion: 0.50
Nodes (3): ApiKey, ApiKeySchema, IApiKey

### Community 55 - "BlogPost Model"
Cohesion: 0.50
Nodes (3): BlogPost, BlogPostSchema, IBlogPost

### Community 56 - "Campaign Model"
Cohesion: 0.50
Nodes (3): Campaign, CampaignSchema, ICampaign

### Community 57 - "CMSPage Model"
Cohesion: 0.50
Nodes (3): CMSPage, CMSPageSchema, ICMSPage

### Community 58 - "SEORedirect Model"
Cohesion: 0.50
Nodes (3): ISEORedirect, SEORedirect, SEORedirectSchema

### Community 59 - "Shipment Model"
Cohesion: 0.50
Nodes (3): IShipment, Shipment, ShipmentSchema

### Community 60 - "Supplier Model"
Cohesion: 0.50
Nodes (3): ISupplier, Supplier, SupplierSchema

### Community 61 - "Webhook Model"
Cohesion: 0.50
Nodes (3): IWebhook, Webhook, WebhookSchema

### Community 63 - "Product Detail Docs"
Cohesion: 0.67
Nodes (3): Rich Product Detail Pages, 0% EMI Breakdown, Multiple View Modes (Grid / Compact / List)

## Ambiguous Edges - Review These
- `Role-Based Access Control (RBAC)` → `Multi-role RBAC (Admin, Manager, Staff, Customer)`  [AMBIGUOUS]
  README.md · relation: semantically_similar_to

## Knowledge Gaps
- **387 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `css` (+382 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 454 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Role-Based Access Control (RBAC)` and `Multi-role RBAC (Admin, Manager, Staff, Customer)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `react` connect `Admin Pages (Icons & React)` to `UI Primitives & Package Manifest`, `Sidebar & Sheet Components`, `cn() Utility & Menus`, `Buttons, Carousel & Pagination`, `Admin Reports & CSV Export`, `Admin Content & Toasts`, `Admin Shell & Theming`, `Storefront Static Site Data`, `Cart-Driven Storefront Pages`, `Cart Context & Header`, `Command & Dialog UI`, `Shop Listing & Filters`, `Badges, Alerts & Toggles`, `Menubar Component`, `Form Components`, `Chart Component`, `Navigation Menu Component`, `Select Component`, `Breadcrumb Component`, `Drawer Component`, `OTP Input Component`, `API Keys & Webhooks Page`, `Admin Products Page`, `Admin Returns Page`, `Admin Staff Page`, `Accordion Component`, `Tabs Component`, `Abandoned Carts Page`, `Admin AI Tools Page`?**
  _High betweenness centrality (0.277) - this node is a cross-community bridge._
- **Why does `next` connect `Brands API & Token Verify` to `UI Primitives & Package Manifest`, `OTP Email Flow`, `Admin Pages (Icons & React)`, `Coupons API & Model`, `Orders, Returns & Audit APIs`, `Admin Reports & CSV Export`, `Reviews API & Model`, `Auth & User APIs`, `Admin Shell & Theming`, `Catalog & Finance APIs`, `Storefront Static Site Data`, `Settings, Warehouses & Seeding`, `Cart-Driven Storefront Pages`, `Cart Context & Header`, `Notifications & Audit Models`, `Shop Listing & Filters`, `Staff API & Model`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Admin Pages (Icons & React)` to `UI Primitives & Package Manifest`, `Sidebar & Sheet Components`, `cn() Utility & Menus`, `Buttons, Carousel & Pagination`, `Admin Reports & CSV Export`, `Admin Content & Toasts`, `Admin Shell & Theming`, `Storefront Static Site Data`, `Cart-Driven Storefront Pages`, `Cart Context & Header`, `Command & Dialog UI`, `Shop Listing & Filters`, `Menubar Component`, `Navigation Menu Component`, `Select Component`, `Breadcrumb Component`, `OTP Input Component`, `API Keys & Webhooks Page`, `Admin Products Page`, `Admin Returns Page`, `Admin Staff Page`, `Accordion Component`, `Abandoned Carts Page`, `Admin AI Tools Page`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _387 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Primitives & Package Manifest` be split into smaller, more focused modules?**
  _Cohesion score 0.0411373260738052 - nodes in this community are weakly interconnected._
- **Should `Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03508771929824561 - nodes in this community are weakly interconnected._