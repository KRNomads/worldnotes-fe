"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFetchUser } from "@/features/auth/hooks/useFetchUser";
import LoadingSpinner from "@/shared/ui/LoadingSpinner/LoadingSpinner";

export default function SuccessPage() {
  const router = useRouter();
  const { fetchUser } = useFetchUser();

  useEffect(() => {
    const init = async () => {
      try {
        await fetchUser();
        router.replace("/dashboard");
      } catch (e) {
        console.error("유저정보 가져오기 실패", e);
        router.replace("/login");
      }
    };

    init();
  }, [fetchUser, router]);

  return (
    <div>
      <LoadingSpinner />
    </div>
  );
}
