import { createRouter, createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { DashboardLayout } from '@/app/routes/dashboard-layout';
import { DashboardPage } from '@/features/dashboard/components/DashboardPage';
import { VehiclesPage } from '@/features/vehicles/components/VehiclesPage';
import { DriversPage } from '@/features/drivers/components/DriversPage';
import { BookingsPage } from '@/features/bookings/components/BookingsPage';
import { ApprovalsPage } from '@/features/approvals/components/ApprovalsPage';
import { ReportsPage } from '@/features/reports/components/ReportsPage';
import { UsersPage } from '@/features/users/components/UsersPage';
import { FuelLogsPage } from '@/features/fuel-logs/components/FuelLogsPage';
import { ServiceSchedulesPage } from '@/features/service-schedules/components/ServiceSchedulesPage';

// Root route
const rootRoute = createRootRoute({
    component: () => <Outlet />,
});

// Public routes
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: LoginForm,
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: () => {
        throw redirect({ to: '/login' });
    },
});

// Protected layout route
const dashboardLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'dashboard-layout',
    component: DashboardLayout,
    beforeLoad: () => {
        const authData = localStorage.getItem('auth-storage');
        if (!authData) {
            throw redirect({ to: '/login' });
        }
        const parsed = JSON.parse(authData);
        if (!parsed.state?.isAuthenticated) {
            throw redirect({ to: '/login' });
        }
    },
});

// Dashboard routes
const dashboardRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: '/dashboard',
    component: DashboardPage,
});

const vehiclesRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: '/vehicles',
    component: VehiclesPage,
});

import { VehicleDetailPage } from '@/features/vehicles/components/VehicleDetailPage';

import { DriverDetailPage } from '@/features/drivers/components/DriverDetailPage';

const vehicleDetailRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: '/vehicles/$id',
    component: VehicleDetailPage,
});

const driverDetailRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: '/drivers/$id',
    component: DriverDetailPage,
});

const driversRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: '/drivers',
    component: DriversPage,
});

const bookingsRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: '/bookings',
    component: BookingsPage,
});

const approvalsRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: '/approvals',
    component: ApprovalsPage,
});

const reportsRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: '/reports',
    component: ReportsPage,
});

const usersRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: '/users',
    component: UsersPage,
});

const fuelLogsRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: '/fuel-logs',
    component: FuelLogsPage,
});

const serviceSchedulesRoute = createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path: '/service-schedules',
    component: ServiceSchedulesPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    dashboardLayoutRoute.addChildren([
        dashboardRoute,
        bookingsRoute,
        vehiclesRoute,
        vehicleDetailRoute,
        driversRoute,
        driverDetailRoute,
        approvalsRoute,
        reportsRoute,
        fuelLogsRoute,
        serviceSchedulesRoute,
        usersRoute,
    ]),
]);

// Create router
export const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}


