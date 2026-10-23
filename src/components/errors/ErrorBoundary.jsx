import React, { Component } from "react";
import ErrorFallback from "./ErrorFallback";

function areResetKeysEqual(previous = [], next = []) {
    if (previous.length !== next.length) return false;
    return previous.every((value, index) => Object.is(value, next[index]));
}

/**
 * Catches descendant render/lifecycle errors. It does not catch event handler
 * exceptions or rejected async requests; handle those at their call sites.
 */
export default class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
    };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.props.onError?.(error, errorInfo);
    }

    componentDidUpdate(previousProps) {
        if (
            this.state.hasError &&
            !areResetKeysEqual(previousProps.resetKeys, this.props.resetKeys)
        ) {
            this.resetErrorBoundary();
        }
    }

    resetErrorBoundary = () => {
        this.props.onReset?.(this.state.error);
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        const { fallback, homePath = "/", showDetails = import.meta.env?.DEV } = this.props;
        const error = this.state.error;

        if (typeof fallback === "function") {
            return fallback({
                error,
                resetErrorBoundary: this.resetErrorBoundary,
            });
        }

        if (fallback) return fallback;

        return (
            <ErrorFallback
                status={500}
                eyebrow="Application error"
                title="This section ran into a problem"
                message="We couldn't render this part of the application. You can try rendering it again or return to the dashboard."
                onRetry={this.resetErrorBoundary}
                onHome={() => {
                    if (typeof this.props.onHome === "function") {
                        this.props.onHome();
                    } else if (typeof window !== "undefined") {
                        window.location.assign(homePath);
                    }
                }}
                errorDetails={error?.stack || error?.message || error}
                showDetails={Boolean(showDetails)}
                requestId={this.props.requestId}
            />
        );
    }
}
