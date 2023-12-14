import { env } from "@/env.mjs";
import { signIn, useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export const useEnforceAuthenticated = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: sessionData } = useSession();

    useEffect(() => {
        const token = searchParams.get("token");

        if (sessionData || token === env.NEXT_PUBLIC_AUTH_TOKEN) {
            setIsAuthenticated(true);

            return;
        }

        const callbackUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

        signIn("azure-ad", { callbackUrl });
    }, [sessionData, pathname, searchParams]);

    return isAuthenticated;
};
