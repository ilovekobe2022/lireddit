import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMeQuery } from "../generated/graphql";

export const useisAuth = () => {
    const [calledPush, setCalledPush] = useState(false);
    const [{ data, fetching }] = useMeQuery();
    const router = useRouter();
    useEffect(() => {
        if (calledPush) {
            return; // no need to call router.push() again
          }
        else if (!fetching && !data?.me) {
            // router.replace("/login" + router.pathname);
            router.replace("/login?next=" + router.pathname);
            setCalledPush(true);
        }
    }, [fetching, data, router]);
};