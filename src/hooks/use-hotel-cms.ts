import { useQuery } from "@tanstack/react-query";
import { fetchHotelInfo } from "@/lib/cms";
import { HOTEL } from "@/lib/content";

export function useHotelCms() {
  const { data, isLoading } = useQuery({
    queryKey: ["hotel-info-cms"],
    queryFn: fetchHotelInfo,
    staleTime: 60_000,
  });
  return { hotel: data ?? HOTEL, isLoading };
}
