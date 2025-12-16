import { Outlet, useLocation } from '@tanstack/react-router';
import { AppSidebar } from '@/components/app-sidebar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';

export function DashboardLayout() {
    const location = useLocation();
    const path = location.pathname.split('/').filter(Boolean);
    const formattedPath = path.map(segment =>
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    );

    return (
        <SidebarProvider>
            <AppSidebar variant='inset' />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">
                                        Sekawan Fleet
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {formattedPath.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                                {formattedPath.map((segment, index) => {
                                    const isLast = index === formattedPath.length - 1;
                                    return isLast ? (
                                        <BreadcrumbItem key={segment}>
                                            <BreadcrumbPage>{segment}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    ) : null;
                                })}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

