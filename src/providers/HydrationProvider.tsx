import { createContext, FC, PropsWithChildren, useContext, useEffect, useState } from "react";

const HydrationGuardContext = createContext(false);

export const HydrationGuardProvider: FC<PropsWithChildren> = ({ children }) => {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    return (
        <HydrationGuardContext.Provider value={isHydrated}>
            {isHydrated ? children : null}
        </HydrationGuardContext.Provider>
    );
};

export const useIsHydrated = () => {
    const hydrationContext = useContext(HydrationGuardContext);

    if (hydrationContext === null) {
        const error = new Error("useIsHydrated must be used within a hydrationContext");

        if (Error.captureStackTrace) {
            Error.captureStackTrace(error, useIsHydrated);
        }

        throw error;
    }

    return hydrationContext;
};
