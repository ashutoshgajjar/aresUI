import { apiGet } from "@/api/client";

export async function getDashboardData() {
    const [users, tasks, files] = await Promise.all([
        apiGet("/users/?limit=all"),
        apiGet("/tasks/?limit=100"),
        apiGet("/files/?limit=1"),
    ]);

    const userResults = users?.results || [];
    const taskResults = tasks?.results || [];

    const userRoles = userResults.reduce((acc, user) => {
        const role = user?.metadata?.role || "unknown";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    const userStatus = userResults.reduce((acc, user) => {
        let status = "unknown";
        
        if (user?.metadata?.accountStatus) {
            status = user.metadata.accountStatus;
        } 
        else if (user?.metadata?.is_active === true || user?.metadata?.is_active === "true") {
            status = "active";
        } 
        else if (user?.metadata?.is_active === false || user?.metadata?.is_active === "false") {
            status = "inactive";
        }

        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const isActiveUser = (user) => {
        const accountStatus = user?.metadata?.accountStatus;

        // Account status takes priority when available.
        if (
            accountStatus !== null &&
            accountStatus !== undefined &&
            String(accountStatus).trim() !== ""
        ) {
            return String(accountStatus).trim().toLowerCase() === "active";
        }

        const isActive = user?.metadata?.is_active;

        return isActive === true || isActive === "true";
    };

    // Count active users in the loaded records.
    const activeUsersLength = userResults.filter(isActiveUser).length;


    const taskStatus = taskResults.reduce((acc, task) => {
        const status = task?.status || "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    return {
        users: {
            total: Number(users?.count || 0),
            loaded: userResults.length,
            roles: userRoles,
            active: activeUsersLength,
            status: userStatus
        },
        tasks: {
            total: Number(tasks?.count || 0),
            loaded: taskResults.length,
            status: taskStatus,
        },
        files: {
            total: Number(files?.count || 0),
        },
        generatedAt: new Date().toISOString(),
    };
}
