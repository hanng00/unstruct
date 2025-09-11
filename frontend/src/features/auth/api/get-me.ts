import { getAxios } from "@/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";

type User = {
  email: string;
  userId: string;
};

export const useMe = () => {
  const axios = getAxios();

  const getMe = async () => {
    const response = await axios.get<User>("/me");
    return response.data;
  };

  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
