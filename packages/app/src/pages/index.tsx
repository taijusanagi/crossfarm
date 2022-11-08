import { Box, Button, Flex, useDisclosure } from "@chakra-ui/react";
import axios from "axios";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useAccount } from "wagmi";

import { DefaultLayout } from "@/components/layouts/Default";
import { Modal } from "@/components/Modal";
import { Unit } from "@/components/Unit";

const HomePage: NextPage = () => {
  const seedingModalDisclosure = useDisclosure();
  const seedingModalStatus = useState<"assetList">("assetList");

  const { address } = useAccount();

  useEffect(() => {
    if (!address) {
      return;
    }
    console.log(window.location.origin);
    axios.get(`${window.location.origin}/api/token?address=${address}`).then(({ data }) => {
      console.log(data);
    });
  }, [address]);

  return (
    <DefaultLayout>
      <Flex justify="right">
        <Box>
          <Button onClick={seedingModalDisclosure.onOpen} colorScheme="brand" size="sm" rightIcon={<AiOutlinePlus />}>
            Seeding
          </Button>
          <Modal
            header="Choose your asset to plant"
            isOpen={seedingModalDisclosure.isOpen}
            onClose={seedingModalDisclosure.onClose}
          >
            Assets List
          </Modal>
        </Box>
      </Flex>

      <Unit header="Farm Overview" description="Your staking overview is visualized">
        Farm Overview
      </Unit>
      <Unit header="Farm Detail" description="Your staking detail">
        Farm Detail
      </Unit>
    </DefaultLayout>
  );
};

export default HomePage;
