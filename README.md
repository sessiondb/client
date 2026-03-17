# SessionDB

**The Open Core Gateway for Granular Database Access & Observability**

SessionDB is a modern database management and access control gateway. Built with a powerful Go backend and a scalable React frontend, it provides teams with the ability to safely query, monitor, and manage their databases without compromising security.

---

## 🚀 Features

SessionDB follows an Open Core model. Our Community Edition provides everything a team needs for secure, multi-tenant database access, while our Pro and Enterprise tiers offer advanced observability and governance.

| Feature Category | Community Edition (Free) | Pro / Managed Edition |
| :--- | :--- | :--- |
| **Access Control** | Basic RBAC (Viewer, Maintainer, Admin) | Custom Roles & Identity Provider Sync |
| **Multi-Tenancy** | Bill Splitting & Workspace Separation | Advanced Resource Quotas |
| **Querying** | Secure SQL Query Editor | AI-Powered **Query Insights** & Suggestions |
| **Observability** | Basic Audit Logging | Live **DB Metrics**, Graphing, & Slow-Query Logs |
| **Governance** | Manual Credential Management | **Auto Creds Expiry** & **TTL-based Table Access** |
| **UI Rendering** | Core UI & `FeatureGate` Paywalls | Full access to premium interfaces |

---

## ⚡ Quick Start

**Note:** This repository contains the **React Frontend** for SessionDB. You will also need the Go backend running for the application to function fully.

1. **Clone the React repository:**
   ```bash
   git clone https://github.com/your-org/sessiondb.git
   cd sessiondb
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *This command spins up the React frontend client (usually on port 5173).*

4. **Access the Application:**
   Open your browser and navigate to the URL provided by Vite. Ensure your Go backend is running and configured correctly in your `.env` file so the frontend can authenticate and fetch data.

---

## 🛡️ The Security Model: Developing for SessionDB

SessionDB's frontend is completely decoupled from subscription logic using a scalable "Gate" architecture. If you are contributing to the UI or adding new community features, please utilize these contexts:

*   **`<PermissionGate>`**: Wraps components that require specific Service Level Roles (e.g., `users:write`). If the user lacks the RBAC permission, the component is silently hidden.
    ```tsx
    <PermissionGate required="users:write">
        <CreateUserButton />
    </PermissionGate>
    ```

*   **`<FeatureGate>`**: Wraps features that depend on Platform Level/Billing Plans. If the tenant does not have the feature enabled (e.g., they are on the Community Plan), this gate intercepts the render and displays an "Upgrade" paywall.
    ```tsx
    <FeatureGate featureKey="db_metrics">
        <DBMetricsDashboard />
    </FeatureGate>
    ```

> **Note to Contributors:** All access control rules are strictly enforced by the Go backend middleware. The frontend gates simply provide a seamless UX and Open Core paywall experience.

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for our community standards, and [SECURITY.md](SECURITY.md) for how to report security issues.

---

## ⚖️ License

This project is licensed under the **Business Source License 1.1**. 

It is free for personal use, internal business use, and non-production testing. However, it **cannot be used to provide a competing commercial service** (e.g., you cannot use this code to launch a commercial "Database-as-a-Service" or "Managed Query Environment" that competes with SessionDB). 

After the Change Date (January 1, 2030), the license converts to the open-source **Apache License, Version 2.0**.

Please see the [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE) files in the root directory for full legal terms, permitted uses, and "Competing Use" boundaries.
