import { useCallback } from "react";
import { XIONHUB_ADDRESS } from "~/constant";
import { HubInfoProps } from "~/interface";

const useQueryHubList = (client?: any) => {
  const queryHubList = useCallback(
    async (currentPage: number = 1, pageSize: number = 10) => {
      if (!client) {
        console.error("Client is not initialized");
        return; // Early return if client is not initialized
      }
      try {
        const hubList = (await client.queryContractSmart(XIONHUB_ADDRESS, {
          hub_addresses: {
            page: currentPage,
            size: pageSize,
          },
        })) as string[];
        if (hubList.length > 0) {
          const hubInfoData = Promise.all(
            hubList.map(async (hubAddress) => {
              const hubInfo = await client.queryContractSmart(XIONHUB_ADDRESS, {
                hub: {
                  creator: hubAddress,
                },
              });
              return hubInfo as HubInfoProps;
            }),
          );
          return hubInfoData;
        } else {
          return [];
        }
      } catch (error) {
        console.error("Error querying hub addresses:", error);
        throw error;
      }
    },
    [client],
  );

  return queryHubList;
};

export default useQueryHubList;
