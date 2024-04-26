"use client";

import { env } from "@/env";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { PostHogProvider as CSPostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

if (typeof window !== "undefined") {
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    });
}

type PostHogProviderProps = {
    children: React.ReactNode;
};

export function PosthogProvider({ children }: PostHogProviderProps) {
    return (
        <CSPostHogProvider client={posthog}>
            <PosthogAuthWrapper>{children}</PosthogAuthWrapper>
        </CSPostHogProvider>
    );
}

function PosthogAuthWrapper({ children }: PostHogProviderProps) {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "authenticated") {
            posthog.identify(session.user.id, {
                email: session.user.email,
                name: session.user.name,
            });
        } else if (status === "unauthenticated") {
            posthog.reset();
        }
    }, [session, status]);

    return children;
}
