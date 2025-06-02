"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/shared/ui/LoadingSpinner/LoadingSpinner";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div>
      <LoadingSpinner />
    </div>
  );
}
