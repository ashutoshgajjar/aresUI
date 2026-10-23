export function getFirstError(value) {
    if (!value) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return value
            .filter(Boolean)
            .map((item) =>
                typeof item === "string"
                    ? item
                    : String(item),
            )
            .join(" ");
    }

    if (typeof value === "object") {
        return (
            value.message ||
            value.detail ||
            ""
        );
    }

    return String(value);
}


export function getServerFieldError(
    error,
    ...paths
) {
    if (!error?.fieldErrors) {
        return "";
    }

    for (const path of paths) {
        const message =
            error.fieldErrors[path];

        if (message) {
            return getFirstError(message);
        }
    }

    return "";
}
