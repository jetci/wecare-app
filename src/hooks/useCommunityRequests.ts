import { useEffect, useState } from "react";
import qs from "query-string";
import { GetCommunityRequestsResponseSchema } from "@/schemas/community.schema";

interface UseCommunityRequestsParams {
  nationalId?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useCommunityRequests({ nationalId, type, status, page = 1, limit = 10 }: UseCommunityRequestsParams) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const query = qs.stringify({ nationalId, type, status, page, limit });
    fetch(`/api/community/requests?${query}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((json) => {
        setData(GetCommunityRequestsResponseSchema.parse(json));
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [nationalId, type, status, page, limit]);

  return { data, loading, error };
}
