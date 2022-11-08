import { Box, Button, Flex, useDisclosure } from "@chakra-ui/react";
import { NextPage } from "next";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";

import { DefaultLayout } from "@/components/layouts/Default";
import { Modal } from "@/components/Modal";
import { Unit } from "@/components/Unit";

const HomePage: NextPage = () => {
  const seedingModalDisclosure = useDisclosure();
  const seedingModalStatus = useState<"assetList">("assetList");

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
