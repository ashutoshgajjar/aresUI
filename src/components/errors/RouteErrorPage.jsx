import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";
import ErrorFallback from "./ErrorFallback";

function getRouteErrorPresentation(error) {
    const isResponse = isRouteErrorResponse(error);
    const status = Number(isResponse ? error.status : error?.status) || 500;

    if (status === 404) {
        return {
            status,
            eyebrow: "Page not found",
            title: "We couldn't find that page",
            message: "The page may have moved, the link may be outdated, or the address may be incorrect.",
        };
    }

    if (status === 401 || status === 403) {
        return {
            status,
            eyebrow: "Access restricted",
            title: status === 401 ? "Sign-in required" : "You don't have access",
            message: status === 401
                ? "Sign in to continue to this page."
                : "Your account does not have permission to open this resource. If you think this is a mistake, contact an administrator.",
        };
    }

    if (status >= 500) {
        return {
            status,
            eyebrow: "Server error",
            title: "Something went wrong on our side",
            message: "The request could not be completed. Try again in a moment, or return to the dashboard.",
        };
    }

    return {
        status,
        eyebrow: "Request couldn't be completed",
        title: "We couldn't complete that request",
        message: "Check the page and try again. If the problem continues, return to the dashboard.",
    };
}

export default function RouteErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();
    const presentation = getRouteErrorPresentation(error);
    const isResponse = isRouteErrorResponse(error);

    const developmentDetails = isResponse
        ? error.data
        : error?.stack || error?.message || error;

    return (
        <ErrorFallback
            {...presentation}
            onRetry={() => window.location.reload()}
            onHome={() => navigate(presentation.status === 401 ? "/login" : "/", { replace: true })}
            homeLabel={presentation.status === 401 ? "Go to sign in" : "Go to dashboard"}
            onBack={() => navigate(-1)}
            errorDetails={
                typeof developmentDetails === "string"
                    ? developmentDetails
                    : JSON.stringify(developmentDetails, null, 2)
            }
            showDetails={Boolean(import.meta.env?.DEV)}
        />
    );
}
