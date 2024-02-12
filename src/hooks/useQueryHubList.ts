import { useState, useCallback } from "react";
import { XIONHUB_ADDRESS } from "~/constant";
import { HubInfoProps } from "~/interface";

const useQueryHubList = (client?: any, account?: any) => {
  const [isQueryingHubs, setIsQueryingHubs] = useState(false);

  const queryHubList = useCallback(
    async (currentPage: number = 1, pageSize: number = 10) => {
      setIsQueryingHubs(true);
      if (!client) {
        console.error("Client is not initialized");
        setIsQueryingHubs(false);
        return;
      }
      try {
        const hubList = (await client.queryContractSmart(XIONHUB_ADDRESS, {
          hub_addresses: {
            page: currentPage,
            size: pageSize,
          },
        })) as string[];
        if (hubList.length > 0) {
          const hubInfoData = await Promise.all(
            // Added await to properly wait for all promises
            hubList.map(async (hubAddress) => {
              const hubInfo = await client.queryContractSmart(XIONHUB_ADDRESS, {
                hub: {
                  creator: hubAddress,
                },
              });
              return hubInfo as HubInfoProps;
            }),
          );
          setIsQueryingHubs(false);
          return hubInfoData;
        } else {
          setIsQueryingHubs(false);
          return [];
        }
      } catch (error) {
        console.error("Error querying hub addresses:", error);
        setIsQueryingHubs(false);
        throw error;
      }
    },
    [client],
  );

  return { queryHubList, isQueryingHubs };
};

export default useQueryHubList;
